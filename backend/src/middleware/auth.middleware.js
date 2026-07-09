import jwt from "jsonwebtoken";
import prisma from "../db/db.js";

const isAuth = async (req, res, next) => {
  try {
     const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
       message: "Unauthorized. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
     message: "Invalid token.",
    });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
       message: "Only super admin can create admin.",
    });
  }

  next();
};

 const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only  admin can create user.",
    });
  }

  next();
};


// =================Product====================


const isProduct = (req, res, next) => {
  if (req.user.role !== "ADMIN || USER") {
    return res.status(403).json({
      success: false,
       message: "Only admin or user can create product.",
    });
  }

  next();
}

export { isAuth ,  isSuperAdmin , isAdmin , isProduct};