const express = require("express");
const Donation = require("../models/Donation");
const { checkForLogin, authRoles } = require("../middlewares/auth");
const router = express.Router();

// Get assigned deliveries for a driver
router.get("/assigned", checkForLogin, authRoles("DRIVER"), async (req, res) => {
  try {
    const deliveries = await Donation.find({ driver: req.user._id })
      .populate("donor", "name organization")
      .populate("receiver", "name organization")
      .select("-__v");
    res.status(200).json({ deliveries });
  } catch (err) {
    console.error("Error fetching driver deliveries:", err.message);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// Mark donation as picked up
router.post("/pickup/:id", checkForLogin, authRoles("DRIVER"), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.status !== "MATCHED") {
      return res.status(400).json({ error: "Donation not ready for pickup" });
    }
    donation.status = "PICKED";
    await donation.save();
    res.status(200).json({ message: "Donation picked up", donation });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as picked up" });
  }
});

// Mark donation as delivered
router.post("/deliver/:id", checkForLogin, authRoles("DRIVER"), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.status !== "PICKED") {
      return res.status(400).json({ error: "Donation not ready for delivery" });
    }
    donation.status = "DELIVERED";
    await donation.save();
    res.status(200).json({ message: "Donation delivered", donation });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete delivery" });
  }
});

module.exports = router;
