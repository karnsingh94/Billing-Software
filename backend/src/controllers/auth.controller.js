import {
  signupService,
  loginService,
  createAdminService,
  createUserService,
  logoutService,
  getMeService,
} from "../services/auth.service.js";

// ======================================================
// ERROR STATUS HELPER
// ======================================================

const getErrorStatusCode = (message = "") => {
  const normalizedMessage = String(message).toLowerCase();

  if (
    normalizedMessage.includes("invalid credentials") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("invalid token") ||
    normalizedMessage.includes("expired token")
  ) {
    return 401;
  }

  if (
    normalizedMessage.includes("only super admin") ||
    normalizedMessage.includes("only admin") ||
    normalizedMessage.includes("forbidden")
  ) {
    return 403;
  }

  if (normalizedMessage.includes("not found")) {
    return 404;
  }

  if (
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("required") ||
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("must") ||
    normalizedMessage.includes("cannot")
  ) {
    return 400;
  }

  return 500;
};

// ======================================================
// COMMON ERROR RESPONSE
// ======================================================

const sendErrorResponse = (
  res,
  error,
  fallbackMessage = "Internal Server Error"
) => {
  console.error("AUTH CONTROLLER ERROR:", error);

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res.status(getErrorStatusCode(message)).json({
    success: false,
    message: message || fallbackMessage,
  });
};

// ======================================================
// SIGNUP SUPER ADMIN
// POST /api/v1/auth/signup
// ======================================================

const signup = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    const superAdmin = await signupService(req.body);
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)

    return res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      superAdmin,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create super admin"
    );
  }
};

<<<<<<< HEAD

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
=======
// ======================================================
// LOGIN
// POST /api/v1/auth/login
// ======================================================
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)

const login = async (req, res) => {
  try {
    const {
      user,
      accessToken,
    } = await loginService(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Login failed"
    );
  }
};

// ======================================================
// CREATE ADMIN
// POST /api/v1/auth/create-admin
// ======================================================

const createAdmin = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const admin = await createAdminService(
      req.body,
      loggedInUser
    );

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create admin"
    );
  }
};

<<<<<<< HEAD
// ==============================create User==============================
=======
// ======================================================
// CREATE NORMAL USER
// POST /api/v1/auth/create-user
// ======================================================
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)

const createUser = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const user = await createUserService(
      req.body,
      loggedInUser
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to create user"
    );
  }
};

// ======================================================
// LOGOUT
// POST /api/v1/auth/logout
// ======================================================

const logout = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    await logoutService(loggedInUser);

    res.clearCookie("accessToken", {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Logout failed"
    );
  }
};

// ======================================================
// GET CURRENT USER
// GET /api/v1/auth/me
// ======================================================

const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const user = await getMeService(userId);

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch current user"
    );
  }
};

<<<<<<< HEAD
export { signup, updatePassword, login, createAdmin, createUser, logout, getMe };
=======
export {
  signup,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
};
>>>>>>> 3b53bc7 (feat: add period report generation functionality with date range filtering)
