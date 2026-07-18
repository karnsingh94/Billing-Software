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
    const superAdmin = await signupService(req.body);

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


export {
  signup,
  login,
  createAdmin,
  createUser,
  logout,
  getMe,
};
