import validator from "validator";
import bcrypt from "bcryptjs";
import prisma from "../db/db.js";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
  try {
    const { fullName, email, password, phone, location } = req.body;

    if (!fullName || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and symbol",
      });
    }

    if (!validator.isMobilePhone(phone, "any")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const superAdminExists = await prisma.user.findFirst({
      where: {
        role: "SUPER_ADMIN",
      },
    });

    if (superAdminExists) {
      return res.status(400).json({
        success: false,
        message: "Super admin already exists",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        location: location.trim(),
        role: "SUPER_ADMIN",
        createdById: null,
      },
    });

    const { password: _, ...superAdminWithoutPassword } = superAdmin;

    return res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      superAdmin: superAdminWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


//====================================updatePassword=================================

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // ================= Validation =================
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ================= Confirm Password =================
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // ================= Get Logged-in User =================
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= Check Old Password =================
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // ================= Hash New Password =================
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ================= Update Password =================
    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//==================================== login=================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        parentId: user.createdById || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Login successfully",
      user,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===============================create Admin==============================

const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone, location } = req.body;

    if (!fullName || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        location: location.trim(),
        role: "ADMIN",

        // yahi super-admin ka id hai
        createdById: req.user.id,
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: adminWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ==============================create User==============================

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, location } = req.body;

    // 1) required fields
    if (!fullName || !email || !password || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2) email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // 3) password validation
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and symbol",
      });
    }

    // 4) phone validation
    if (!validator.isMobilePhone(phone, "any")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // 5) only ADMIN can create user
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create user",
      });
    }

    // 6) email/phone already exists check
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    // 7) password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8) create user
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone.trim(),
        location: location.trim(),
        role: "USER",
        createdById: req.user.id,
      },
    });

    // 9) remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ============================logout=============================

const logout = async (req, res) => {
  res.clearCookie("accessToken");

  return res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
};

// ============================getMe=============================

const getMe = async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;

  return res.status(200).json({
    success: true,
    user: userWithoutPassword,
  });
};

export { signup, updatePassword, login, createAdmin, createUser, logout, getMe };
