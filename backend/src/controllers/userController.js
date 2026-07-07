import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find user and populate their role and warehouse info
    const user = await User.findOne({ email })
      .populate("role")
      .populate("warehouse");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "User account is suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse: user.warehouse,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, warehouse } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      warehouse: warehouse || undefined,
      status: "ACTIVE"
    });

    const populatedUser = await User.findById(user._id)
      .populate("role")
      .populate("warehouse");

    res.status(201).json({
      success: true,
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        warehouse: populatedUser.warehouse,
        status: populatedUser.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find()
      .populate("role")
      .populate("warehouse")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRoles(req, res) {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
