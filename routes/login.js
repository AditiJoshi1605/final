const express = require("express");
const users = require("../models/User");
const router = express.Router();
router.post("/register",async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);
    const { email, name, password, phone, organization, role } = req.body;
    
    //allow only one admin in the system
    if (role  && role.toUpperCase()=== "ADMIN") {
      const existingAdmin = await users.findOne({ role: "ADMIN" });
      if (existingAdmin) {
        return res.status(403).json({ error: "Admin account already exists" });
      }
    }

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await users.create({
      email,
      name,
      password,
      phone,
      organization,
      role,
    });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/login",async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    
    // If attempting admin login, role must be ADMIN
    if (user.role === "ADMIN") {
      req.session.userId = user._id;
      req.session.role = user.role;
    } 
    else {
      req.session.userId = user._id;
      req.session.role = user.role;
    }

     console.log(`Authenticated user: ${user._id} (${user.role})`);

    return res.status(200).json({
      message: "login successful",
      user: {
        id:user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:",err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err.message);
      return res.status(500).json({ error: "Cannot logout" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out" });
  });
});
module.exports = router;
