import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

import prisma from "../db/db.js";

// ======================================================
// HELPERS
// ======================================================

const removePassword = (user) => {
  if (!user) {
    return null;
  }

  const {
    password,
    ...userWithoutPassword
  } = user;

  return userWithoutPassword;
};

const makeJsonSafe = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(value, (_, item) => {
      if (item instanceof Prisma.Decimal) {
        return item.toNumber();
      }

      if (item instanceof Date) {
        return item.toISOString();
      }

      if (typeof item === "bigint") {
        return item.toString();
      }

      return item;
    })
  );
};

const getSafeUserAuditValue = (user) => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    location: user.location,
    role: user.role,
    createdById: user.createdById,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const findExistingUser = async (
  database,
  email,
  phone
) => {
  return database.user.findFirst({
    where: {
      OR: [
        {
          email: email.trim().toLowerCase(),
        },
        {
          phone: phone.trim(),
        },
      ],
    },
  });
};

const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      parentId: user.createdById || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// CREATE AUDIT RECORD
// ======================================================

const createAuditRecord = async ({
  database = prisma,
  action,
  table,
  oldValue = null,
  newValue = null,
  userId,
  createdBy,
  updatedBy = null,
}) => {
  if (!action) {
    throw new Error("Audit action is required");
  }

  if (!table) {
    throw new Error("Audit table is required");
  }

  if (!userId) {
    throw new Error("Audit userId is required");
  }

  return database.audit.create({
    data: {
      action,
      table,

      oldValue:
        oldValue === null
          ? Prisma.JsonNull
          : makeJsonSafe(oldValue),

      newValue:
        newValue === null
          ? Prisma.JsonNull
          : makeJsonSafe(newValue),

      userId,

      createdBy: createdBy || userId,
      updatedBy,
    },
  });
};

// ======================================================
// SIGNUP SUPER ADMIN
// ======================================================

export const signupService = async (input) => {
  const {
    fullName,
    email,
    password,
    phone,
    location,
  } = input;

  return prisma.$transaction(async (tx) => {
    const superAdminExists =
      await tx.user.findFirst({
        where: {
          role: "SUPER_ADMIN",
          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

    if (superAdminExists) {
      throw new Error("Super admin already exists");
    }

    const existingUser =
      await findExistingUser(
        tx,
        email,
        phone
      );

    if (existingUser) {
      throw new Error(
        "Email or phone already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const superAdmin =
      await tx.user.create({
        data: {
          fullName: fullName.trim(),

          email: email
            .trim()
            .toLowerCase(),

          password: hashedPassword,

          phone: phone.trim(),

          location: location.trim(),

          role: "SUPER_ADMIN",

          createdById: null,
        },
      });

    await createAuditRecord({
      database: tx,

      action: "CREATE_SUPER_ADMIN",

      table: "User",

      oldValue: null,

      newValue:
        getSafeUserAuditValue(
          superAdmin
        ),

      /*
       * Audit.userId is required.
       * The newly created super admin is used here.
       */
      userId: superAdmin.id,

      createdBy: superAdmin.id,
    });

    return removePassword(superAdmin);
  });
};

// ======================================================
// LOGIN
// ======================================================

export const loginService = async (input) => {
  const {
    email,
    password,
  } = input;

  const normalizedEmail =
    email.trim().toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (
    !user ||
    !user.password ||
    user.deletedAt
  ) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const accessToken =
    generateAccessToken(user);

  await createAuditRecord({
    action: "USER_LOGIN",

    table: "User",

    oldValue: null,

    newValue: {
      userId: user.id,
      email: user.email,
      role: user.role,
      loginAt: new Date(),
    },

    userId: user.id,

    createdBy: user.id,
  });

  return {
    user: removePassword(user),
    accessToken,
  };
};

// ======================================================
// CREATE ADMIN
// ======================================================

  export const createAdminService = async (
    input,
    loggedInUser
  ) => {
    if (!loggedInUser?.id) {
      throw new Error("Unauthorized user");
    }

    if (loggedInUser.role !== "SUPER_ADMIN") {
      throw new Error(
        "Only super admin can create admin"
      );
    }

    const {
      fullName,
      email,
      password,
      phone,
      location,
    } = input;

    return prisma.$transaction(async (tx) => {
      const existingUser =
        await findExistingUser(
          tx,
          email,
          phone
        );
        

      if (existingUser) {
        throw new Error(
          "Email or phone already exists"
        );
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const admin =
        await tx.user.create({
          data: {
            fullName: fullName.trim(),

            email: email
              .trim()
              .toLowerCase(),

            password: hashedPassword,

            phone: phone.trim(),

            location: location.trim(),

            role: "ADMIN",

            createdById:
              loggedInUser.id,
          },
        });

      await createAuditRecord({
        database: tx,

        action: "CREATE_ADMIN",

        table: "User",

        oldValue: null,

        newValue:
          getSafeUserAuditValue(admin),

        /*
        * Action was performed by super admin.
        */
        userId: loggedInUser.id,

        createdBy: loggedInUser.id,
      });

      return removePassword(admin);
    });
  };

// ======================================================
// CREATE NORMAL USER
// ======================================================

export const createUserService = async (
  input,
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  if (loggedInUser.role !== "ADMIN") {
    throw new Error(
      "Only admin can create user"
    );
  }

  const {
    fullName,
    email,
    password,
    phone,
    location,
  } = input;

  return prisma.$transaction(async (tx) => {
    const existingUser =
      await findExistingUser(
        tx,
        email,
        phone
      );

    if (existingUser) {
      throw new Error(
        "Email or phone already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const newUser =
      await tx.user.create({
        data: {
          fullName: fullName.trim(),

          email: email
            .trim()
            .toLowerCase(),

          password: hashedPassword,

          phone: phone.trim(),

          location: location.trim(),

          role: "USER",

          createdById:
            loggedInUser.id,
        },
      });

    await createAuditRecord({
      database: tx,

      action: "CREATE_USER",

      table: "User",

      oldValue: null,

      newValue:
        getSafeUserAuditValue(
          newUser
        ),

      /*
       * Action was performed by admin.
       */
      userId: loggedInUser.id,

      createdBy: loggedInUser.id,
    });

    return removePassword(newUser);
  });
};

// ======================================================
// LOGOUT
// ======================================================

export const logoutService = async (
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  await createAuditRecord({
    action: "USER_LOGOUT",

    table: "User",

    oldValue: null,

    newValue: {
      userId: loggedInUser.id,
      email: loggedInUser.email,
      role: loggedInUser.role,
      logoutAt: new Date(),
    },

    userId: loggedInUser.id,

    createdBy: loggedInUser.id,
  });

  return {
    success: true,
  };
};

// ======================================================
// GET CURRENT USER
// ======================================================

export const getMeService = async (userId) => {
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  const user =
    await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },

      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },

        _count: {
          select: {
            products: true,
            invoices: true,
            payments: true,
            returns: true,
            audits: true,
            createdUsers: true,
          },
        },
      },
    });

  if (!user) {
    throw new Error("User not found");
  }

  return removePassword(user);
};

// ======================================================
// GET ALL ADMINS
// ======================================================

export const getAllAdminsService = async (
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  if (loggedInUser.role !== "SUPER_ADMIN") {
    throw new Error(
      "Only super admin can view admins"
    );
  }

  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      deletedAt: null,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      location: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return admins;
};

// ======================================================
// GET ALL USERS
// ======================================================

export const getAllUsersService = async (
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  if (loggedInUser.role !== "ADMIN") {
    throw new Error(
      "Only admin can view users"
    );
  }

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      deletedAt: null,

      createdById: loggedInUser.id,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      location: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

// ======================================================
// TOGGLE ADMIN STATUS
// ======================================================

export const toggleAdminStatusService = async (
  adminId,
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  if (loggedInUser.role !== "SUPER_ADMIN") {
    throw new Error(
      "Only super admin can change admin status"
    );
  }

  return prisma.$transaction(async (tx) => {
    const admin = await tx.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
        deletedAt: null,
      },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const updatedAdmin = await tx.user.update({
      where: {
        id: adminId,
      },
      data: {
        isActive: !admin.isActive,
      },
    });

    await createAuditRecord({
      database: tx,

      action: admin.isActive
        ? "DEACTIVATE_ADMIN"
        : "ACTIVATE_ADMIN",

      table: "User",

      oldValue: getSafeUserAuditValue(admin),

      newValue: getSafeUserAuditValue(updatedAdmin),

      userId: loggedInUser.id,

      createdBy: loggedInUser.id,
    });

    return removePassword(updatedAdmin);
  });
};

// ======================================================
// TOGGLE USER STATUS
// ======================================================

export const toggleUserStatusService = async (
  userId,
  loggedInUser
) => {
  if (!loggedInUser?.id) {
    throw new Error("Unauthorized user");
  }

  if (loggedInUser.role !== "ADMIN") {
    throw new Error(
      "Only admin can change user status"
    );
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: userId,
        role: "USER",
        deletedAt: null,
        createdById: loggedInUser.id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: !user.isActive,
      },
    });

    await createAuditRecord({
      database: tx,

      action: user.isActive
        ? "DEACTIVATE_USER"
        : "ACTIVATE_USER",

      table: "User",

      oldValue: getSafeUserAuditValue(user),

      newValue: getSafeUserAuditValue(updatedUser),

      userId: loggedInUser.id,

      createdBy: loggedInUser.id,
    });

    return removePassword(updatedUser);
  });
};
//update admin service
export const updateAdminService = async (id, input) => {
  const admin = await prisma.user.findUnique({
    where: { id },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      location: input.location,
    },
  });
};

