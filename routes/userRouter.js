const express = require("express");
//const users = require("../models/User");
const Donation = require("../models/Donation");
const createAuditLog = require("../helper/auditLog");
//const jwt = require("jsonwebtoken");
const router = express.Router();
const { authRoles, checkForLogin } = require("../middlewares/auth");
const loginRouter = require("./login");
router.use("/auth", loginRouter);

router.use((req, res, next) => {
  console.log("Session seen in router:", req.session);
  next();
});

//Donation creation
router.post("/donate", checkForLogin, authRoles("DONOR"), async (req, res) => {
  try {
    console.log("👤 req.user in donate route:", req.user); // debug log

    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not found in session" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      category: req.body.category,
      quantity: req.body.quantity,
      unit: req.body.unit,
      expiryAt: req.body.expiryAt,
      location: {
        type: "Point",
        coordinates: req.body.location?.coordinates || [0, 0],
      },
    });

    console.log("Donation created:", donation._id);
    return res.status(201).json({ message: "Donation created", donation });

  } catch (err) {
    console.log("cannot create donation...error occurred", err);
    return res.status(500).json({
      error: "Failed to create donation",
      details: err.message,
    });
  }
});

// Donation receiving (auto-assign driver)
router.post("/receive/:id", checkForLogin, authRoles("RECEIVER"), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    if (donation.status !== "LISTED") {
      return res.status(400).json({ error: "Donation not available for claiming" });
    }

    // Step 1: Claim donation
    donation.status = "MATCHED";
    donation.receiver = req.user._id;

    //  Step 2: Auto-assign an available driver
    const User = require("../models/User");
    const drivers = await User.find({ role: "DRIVER" }).sort({ createdAt: 1 });

    let assignedDriver = null;
    if (drivers.length > 0) {
      // pick the least recently assigned (round-robin style)
      assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];
      donation.driver = assignedDriver._id;
      console.log(`🚚 Assigned driver: ${assignedDriver.name} (${assignedDriver._id})`);
    } else {
      console.log("⚠️ No drivers available for assignment");
    }

    // Optional delivery location
    donation.deliveryLocation = {
      type: "Point",
      coordinates: req.body?.deliveryLocation?.coordinates || [77.1, 28.6],
    };

    await donation.save();

    await createAuditLog({
      actorId: req.user._id,
      action: "MATCHED",
      entity: "Donation",
      entityId: donation._id,
      data: {
        status: "MATCHED",
        receiver: req.user._id,
        driver: assignedDriver ? assignedDriver._id : null,
      },
    });

    res.status(200).json({
      message: assignedDriver
        ? `Donation claimed and assigned to driver ${assignedDriver.name}`
        : "Donation claimed (no driver available currently)",
      donation,
    });
  } catch (err) {
    console.error("Error in claiming donation:", err);
    res.status(500).json({ error: "Failed to claim donation", details: err.message });
  }
});


//Driver router
router.post(
  "/:id/driver",
  checkForLogin,
  authRoles("DRIVER"),
  async (req, res) => {
    try {
      console.log("👤 Driver in pickup route:", req.user); // debug log
      const donation = await Donation.findById(req.params.id);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      if (donation.status !== "MATCHED") {
        return res.status(400).json({ error: "Donation not ready for pickup" });
      }

      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (donation.driver?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You are not assigned to this donation" });
      }

      donation.status = "PICKED";
      donation.pickedAt = new Date();
      await donation.save();

      await createAuditLog({
        actorId: req.user._id,
        action: "PICKED",
        entity: "Donation",
        entityId: donation._id,
        data: { status: "PICKED" },
      });

      res.status(200).json({
        message: "Donation marked as picked successfully",
        donation,
      });
    } catch (err) {
      console.error("🔥 Pickup error trace:", err);
      res.status(500).json({
        error: "Failed to mark donation as picked",
        details: err.message,
      });
    }
  }
);

// Admin router – fetch all donations (accessible only to ADMIN)
router.post(
  "/admin",
  checkForLogin,
  authRoles("ADMIN"),
  async (req, res) => {
    try {
      const donations = await Donation.find()
        .populate("donor receiver driver", "name email organization role")
        .select("-__v")
        .sort({ createdAt: -1 });

      res.status(200).json({ donations });
    } catch (err) {
      console.error("Admin fetch error:", err);
      res.status(500).json({
        error: "Failed to fetch all donations",
        details: err.message,
      });
    }
  }
);

//Cancelling a donation
router.post(
  "/admin/reset/:id",
  checkForLogin,
  authRoles("ADMIN"),
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }
      if (donation.status === "DELIVERED") {
        return res
          .status(400)
          .json({ error: "Cannot reset a delivered donation" });
      }
      donation.status = "LISTED";
      donation.receiver = null;
      donation.driver = null;
      await donation.save();
      //Details
      await createAuditLog({
        actorId: req.user._id,
        action: "RESET",
        entity: "Donation",
        entityId: donation._id,
        data: { status: "LISTED" },
      });
      res
        .status(200)
        .json({ message: "Donation reset to available", donation });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to reset donation", details: err.message });
    }
  }
);

//Admin views all details of perticular donation
router.get(
  "/admin/logs/:id",
  checkForLogin,
  authRoles("ADMIN"),
  async (req, res) => {
    try {
      const logs = await AuditLog.find({
        entity: "Donation",
        entityId: req.params.id,
      })
        .populate("actorId", "name email role")
        .sort({ createdAt: 1 });

      res.status(200).json({ logs });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch logs", details: err.message });
    }
  }
);
//All donations info
router.get(
  "/admin/logs",
  checkForLogin,
  authRoles("ADMIN"),
  async (req, res) => {
    try {
      const logs = await AuditLog.find()
        .populate("actorId", "name email role")
        .sort({ createdAt: -1 });

      res.status(200).json({ logs });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch audit logs", details: err.message });
    }
  }
);
// Listing available donations
router.get("/list", checkForLogin, async (req, res) => {
  try {
    const donations = await Donation.find({ status: "LISTED" })
      .populate("donor", "name email")
      .select("-__v");

    return res.status(200).json({ donations });
  } catch (err) {
    console.error("Error fetching donations:", err.message);
    return res.status(400).json({
      message: "Cannot fetch donations",
      details: err.message,
    });
  }
});
//Pickup
// Driver marks a donation as picked
router.post(
  "/:id/driver",
  checkForLogin,
  authRoles("DRIVER"),
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }

      // ensure it's still in MATCHED before pickup
      if (donation.status !== "MATCHED") {
        return res.status(400).json({ error: "Donation not ready for pickup" });
      }

      // make sure current driver matches assigned one
      if (donation.driver?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You are not assigned to this donation" });
      }

      donation.status = "PICKED";
      donation.pickedAt = new Date();
      await donation.save();

      await createAuditLog({
        actorId: req.user._id,
        action: "PICKED",
        entity: "Donation",
        entityId: donation._id,
        data: { status: "PICKED" },
      });

      res.status(200).json({
        message: "Donation marked as picked successfully",
        donation,
      });
    } catch (err) {
      console.error("Pickup error:", err);
      res.status(500).json({
        error: "Failed to mark donation as picked",
        details: err.message,
      });
    }
  }
);

//Donation delivered
router.post(
  "/:id/deliver",
  checkForLogin,
  authRoles("DRIVER"),
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id);
      if (!donation || donation.status !== "PICKED") {
        return res
          .status(400)
          .json({ error: "Donation not ready for delivery" });
      }

      donation.status = "DELIVERED";
      donation.deliveredAt = new Date();
      await donation.save();

      res
        .status(200)
        .json({ message: "Donation delivered successfully", donation });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to deliver donation", details: err.message });
    }
  }
);

// Driver dashboard – get all assigned deliveries for the logged-in driver
router.get(
  "/driver/assigned",
  checkForLogin,
  authRoles("DRIVER"),
  async (req, res) => {
    try {
      const deliveries = await Donation.find({ driver: req.user._id })
        .populate("donor receiver", "name email organization")
        .sort({ createdAt: -1 });

      res.status(200).json({ deliveries });
    } catch (err) {
      console.error("Error fetching assigned deliveries:", err);
      res.status(500).json({
        error: "Failed to fetch driver deliveries",
        details: err.message,
      });
    }
  }
);

// Driver dashboard – get available donations ready for pickup
router.get(
  "/driver/available",
  checkForLogin,
  authRoles("DRIVER"),
  async (req, res) => {
    try {
      const available = await Donation.find({ status: "MATCHED" })
        .populate("donor receiver", "name email organization")
        .sort({ createdAt: -1 });

      res.status(200).json({ available });
    } catch (err) {
      console.error("Error fetching available deliveries:", err);
      res.status(500).json({
        error: "Failed to fetch available donations",
        details: err.message,
      });
    }
  }
);

//  Fetch deliveries assigned to the logged-in driver
router.get("/driver/deliveries", checkForLogin, authRoles("DRIVER"), async (req, res) => {
  try {
    const deliveries = await Donation.find({
      driver: req.user._id,
      status: { $in: ["PICKED", "DELIVERED"] },
    })
      .populate("donor receiver", "name email")
      .select("-__v");

    return res.status(200).json({ deliveries });
  } catch (err) {
    console.error("Error fetching driver deliveries:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch driver deliveries", details: err.message });
  }
});


module.exports = router;
