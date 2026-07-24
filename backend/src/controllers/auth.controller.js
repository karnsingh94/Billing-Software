
import bcrypt from "bcryptjs";

import prisma from "../db/db.js";

import {
  signupService,
  loginService,
  createAdminService,
  createUserService,
  logoutService,
  getMeService,
  toggleUserStatusService,
  toggleAdminStatusService,
  getAllAdminsService,
  getAllUsersService,
  updateAdminService,
<<<<<<< HEAD
  updateUserService,
=======
  getUsersByAdminService
>>>>>>> 29c59a8 (feat: add admin users management page and functionality to fetch users by admin)
} from "../services/auth.service.js";

// ======================================================
// ERROR STATUS HELPER
// ======================================================

const getErrorStatusCode = (message = "") => {
  const normalizedMessage =
    String(message).toLowerCase();

  if (
    normalizedMessage.includes(
      "invalid credentials"
    ) ||
    normalizedMessage.includes(
      "unauthorized"
    ) ||
    normalizedMessage.includes(
      "invalid token"
    ) ||
    normalizedMessage.includes(
      "expired token"
    )
  ) {
    return 401;
  }

  if (
    normalizedMessage.includes(
      "only super admin"
    ) ||
    normalizedMessage.includes(
      "only admin"
    ) ||
    normalizedMessage.includes(
      "forbidden"
    )
  ) {
    return 403;
  }

  if (
    normalizedMessage.includes(
      "not found"
    )
  ) {
    return 404;
  }

  if (
    normalizedMessage.includes(
      "already exists"
    )
  ) {
    return 409;
  }

  if (
    normalizedMessage.includes(
      "required"
    ) ||
    normalizedMessage.includes(
      "invalid"
    ) ||
    normalizedMessage.includes(
      "must"
    ) ||
    normalizedMessage.includes(
      "cannot"
    ) ||
    normalizedMessage.includes(
      "incorrect"
    ) ||
    normalizedMessage.includes(
      "do not match"
    )
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
  fallbackMessage =
    "Internal Server Error"
) => {
  console.error(
    "AUTH CONTROLLER ERROR:",
    error
  );

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(
      error.statusCode ||
        getErrorStatusCode(message)
    )
    .json({
      success: false,

      message:
        message ||
        fallbackMessage,
    });
};

// ======================================================
// 1. SIGNUP SUPER ADMIN
// POST /api/v1/auth/signup
// ======================================================

const signup = async (req, res) => {
  try {

    const superAdmin =
      await signupService(
        req.body
      );




    return res.status(201).json({
      success: true,

      message:
        "Super admin created successfully",

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

// ======================================================
// 2. UPDATE PASSWORD
// PUT /api/v1/auth/update-password
// ======================================================

const updatePassword = async (
  req,
  res
) => {
  try {
    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ==================================================
    // CHECK LOGIN USER
    // ==================================================

    const loggedInUserId =
      req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized user",
      });
    }

    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,

        message:
          "All fields are required",
      });
    }

    // ==================================================
    // CONFIRM PASSWORD CHECK
    // ==================================================

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,

        message:
          "New password and confirm password do not match",
      });
    }

    // ==================================================
    // OLD AND NEW PASSWORD CHECK
    // ==================================================

    if (
      oldPassword === newPassword
    ) {
      return res.status(400).json({
        success: false,

        message:
          "New password must be different from old password",
      });
    }

    // ==================================================
    // FIND LOGGED-IN USER
    // ==================================================

    const user =
      await prisma.user.findUnique({
        where: {
          id: loggedInUserId,
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }

    // ==================================================
    // CHECK OLD PASSWORD
    // ==================================================

    const isOldPasswordCorrect =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (
      !isOldPasswordCorrect
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Old password is incorrect",
      });
    }

    // ==================================================
    // HASH NEW PASSWORD
    // ==================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ==================================================
    // UPDATE PASSWORD
    // ==================================================

    await prisma.user.update({
      where: {
        id: loggedInUserId,
      },

      data: {
        password:
          hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,

      message:
        "Password updated successfully",
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update password"
    );
  }
};

// ======================================================
// 3. LOGIN
// POST /api/v1/auth/login
// ======================================================


const login = async (
  req,
  res
) => {
  try {
    const {
      user,
      accessToken,
    } = await loginService(
      req.body
    );

    res.cookie(
      "accessToken",
      accessToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

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
// 4. CREATE ADMIN
// POST /api/v1/auth/create-admin
// ======================================================

const createAdmin = async (
  req,
  res
) => {
  try {
    const loggedInUser =
      req.user;

    if (
      !loggedInUser?.id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized user",
      });
    }

    const admin =
      await createAdminService(
        req.body,
        loggedInUser
      );

    return res.status(201).json({
      success: true,

      message:
        "Admin created successfully",

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


// ======================================================
// 5. CREATE NORMAL USER
// POST /api/v1/auth/create-user
// ======================================================


const createUser = async (
  req,
  res
) => {
  try {
    const loggedInUser =
      req.user;

    if (
      !loggedInUser?.id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized user",
      });
    }

    const user =
      await createUserService(
        req.body,
        loggedInUser
      );

    return res.status(201).json({
      success: true,

      message:
        "User created successfully",

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
// 6. LOGOUT
// POST /api/v1/auth/logout
// ======================================================

const logout = async (
  req,
  res
) => {
  try {
    const loggedInUser =
      req.user;

    if (
      !loggedInUser?.id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized user",
      });
    }

    await logoutService(
      loggedInUser
    );

    res.clearCookie(
      "accessToken",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Logout successful",
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
// 7. GET CURRENT USER
// GET /api/v1/auth/me
// ======================================================

const getMe = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,

        message:
          "Unauthorized user",
      });
    }

    const user =
      await getMeService(
        userId
      );

    return res.status(200).json({
      success: true,

      message:
        "Current user fetched successfully",

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

// ======================================================
// 8. GET ALL ADMINS
// GET /api/v1/auth/admins
// ======================================================

const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService(req.user);

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      admins,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch admins"
    );
  }
};

// ======================================================
// 9. GET ALL USERS
// GET /api/v1/auth/users
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService(req.user);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to fetch users"
    );
  }
};

// ======================================================
// 10. TOGGLE ADMIN STATUS
// PATCH /api/v1/auth/admin/:id/status
// ======================================================

const toggleAdminStatus = async (req, res) => {
  try {
    const admin = await toggleAdminStatusService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Admin status updated successfully",
      admin,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update admin status"
    );
  }
};

// ======================================================
// 11. TOGGLE USER STATUS
// PATCH /api/v1/auth/user/:id/status
// ======================================================

const toggleUserStatus = async (req, res) => {
  try {
    const user = await toggleUserStatusService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update user status"
    );
  }
};


 const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "This user is not an Admin",
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user exists
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
 const updateAdmin = async (req, res) => {
  try {
    const admin = await updateAdminService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

 const getUsersByAdmin = async (req, res) => {
  try {
    const users = await User.find({
      createdBy: req.params.id,
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// UPDATE USER
// PUT /api/v1/auth/user/:id
// ======================================================

const updateUser = async (
  req,
  res
) => {
  try {
    const loggedInUser =
      req.user;

    const { id } =
      req.params;

    if (!loggedInUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const user =
      await updateUserService(
        id,
        req.body,
        loggedInUser
      );

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      user,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      error,
      "Failed to update user"
    );
  }
};


export {
  signup,
  updatePassword,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
  getAllAdmins,
  getAllUsers,
  toggleAdminStatus,
  toggleUserStatus,
  deleteAdmin,
  deleteUser,
  updateAdmin,
<<<<<<< HEAD
  updateUser,
=======
  getUsersByAdmin
>>>>>>> 29c59a8 (feat: add admin users management page and functionality to fetch users by admin)
};
