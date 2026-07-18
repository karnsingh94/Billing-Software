
import bcrypt from "bcryptjs";

import prisma from "../db/db.js";

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
<<<<<<< HEAD
    const superAdmin =
      await signupService(
        req.body
      );
=======
    const superAdmin = await signupService(req.body);
>>>>>>> 45ef114245a36b8b7b3d7ac6c7e82badfc6849cc

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

<<<<<<< HEAD
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
=======
>>>>>>> 45ef114245a36b8b7b3d7ac6c7e82badfc6849cc

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

<<<<<<< HEAD
// ======================================================
// 5. CREATE NORMAL USER
// POST /api/v1/auth/create-user
// ======================================================
=======
>>>>>>> 45ef114245a36b8b7b3d7ac6c7e82badfc6849cc

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

<<<<<<< HEAD
=======

>>>>>>> 45ef114245a36b8b7b3d7ac6c7e82badfc6849cc
export {
  signup,
  updatePassword,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
};
<<<<<<< HEAD

=======
>>>>>>> 45ef114245a36b8b7b3d7ac6c7e82badfc6849cc
