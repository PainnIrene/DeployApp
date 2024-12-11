import express from "express";
const router = express.Router();
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { generateAT, generateRT } from "../../utils/jwt.js";
import Admin from "../../models/Admin.js";
import User from "../../models/User.js";
import authMiddleware from "../../middlewares/Admin/jwt.js";
import renewToken from "../../middlewares/Admin/renewToken.js";
// Register - chỉ cho phép tạo admin đầu tiên
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra đã có admin chưa
    const isFirstAdmin = await Admin.isFirstAdmin();
    if (!isFirstAdmin) {
      return res.status(403).json({
        message: "Admin already exists",
      });
    }
    // Hash password và tạo admin
    const hashedPassword = await hashPassword(password);
    const admin = new Admin({
      username: username.toLowerCase(),
      password: hashedPassword,
    });

    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo tokens
    const accessToken = generateAT({ admin: admin._id.toString() });
    const refreshToken = generateRT({ admin: admin._id.toString() });

    // Set cookies
    res.cookie("AAT", accessToken, {
      httpOnly: false,
      secure: false,
      maxAge: 1800000, // 30 mins
      sameSite: "lax",
    });

    res.cookie("ART", refreshToken, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Login successful",
      username: admin.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("AAT");
  res.clearCookie("ART");
  res.status(200).json({ message: "Logout successful" });
});

// Thêm route verify token
router.get("/verify", async (req, res) => {
  try {
    const AAT = req.cookies.AAT;
    const ART = req.cookies.ART;

    if (!AAT || !ART) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify tokens using your JWT utils
    const isValidAT = verifyAT(AAT);
    const isValidRT = verifyRT(ART);

    if (!isValidAT || !isValidRT) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Get admin info from token
    const adminId = getIdFromJwt(AAT);
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      username: admin.username,
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Thêm các routes mới
router.get("/users", authMiddleware, renewToken, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.put("/users/:id", authMiddleware, renewToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", authMiddleware, renewToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
