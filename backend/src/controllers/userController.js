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
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ success: false, message: "User account is suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouse: user.warehouse,
        status: user.status,
      },
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
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      warehouse: warehouse || undefined,
      status: "ACTIVE",
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
        status: populatedUser.status,
      },
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

export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const { name, email, phone, warehouse, role } = req.body;

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const emailOwner = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (emailOwner) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    existingUser.name = name;
    existingUser.email = email;
    existingUser.phone = phone;
    existingUser.warehouse = warehouse || undefined;
    if (role) {
      existingUser.role = role;
    }

    await existingUser.save();

    const updatedUser = await User.findById(id)
      .populate("role")
      .populate("warehouse")
      .select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    //console.log(id)
    const user = await User.findById(id).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role?.name === "Super Admin") {
      return res.status(400).json({
        success: false,
        message: "Super Admin cannot be suspended",
      });
    }
    user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await user.save();

    res.json({
      success: true,
      status: user.status,
      message: `User status changed to ${user.status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function changeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
    const user = await User.findById(id).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role?.name === "Super Admin") {
      return res.status(400).json({
        success: false,
        message: "Super Admin role cannot be changed",
      });
    }

    const role = await Role.findOne({
      name: roleName,
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    user.role = role._id;

    await user.save();

    const updatedUser = await User.findById(id)
      .populate("role")
      .populate("warehouse")
      .select("-password");

    res.json({
      success: true,
      user: updatedUser,
      message: "Role updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role?.name === "Super Admin") {
      return res.status(400).json({
        success: false,
        message: "Super Admin cannot be deleted",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
