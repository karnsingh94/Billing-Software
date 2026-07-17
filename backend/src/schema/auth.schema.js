import { z } from "zod";

// ======================================================
// COMMON FIELDS
// ======================================================

const fullNameSchema = z
  .string({
    required_error: "Full name is required",
  })
  .trim()
  .min(2, "Full name must contain at least 2 characters")
  .max(100, "Full name cannot exceed 100 characters");

const emailSchema = z
  .string({
    required_error: "Email is required",
  })
  .trim()
  .email("Invalid email format")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string({
    required_error: "Password is required",
  })
  .min(8, "Password must contain at least 8 characters")
  .max(100, "Password cannot exceed 100 characters")
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter"
  )
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number"
  )
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

const phoneSchema = z
  .string({
    required_error: "Phone number is required",
  })
  .trim()
  .min(7, "Invalid phone number")
  .max(20, "Invalid phone number")
  .regex(
    /^[0-9+\-\s()]+$/,
    "Phone number contains invalid characters"
  );

const locationSchema = z
  .string({
    required_error: "Location is required",
  })
  .trim()
  .min(2, "Location must contain at least 2 characters")
  .max(200, "Location cannot exceed 200 characters");

const createAccountBodySchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  location: locationSchema,
});

// ======================================================
// SUPER ADMIN SIGNUP
// ======================================================

export const signupSchema = z.object({
  body: createAccountBodySchema,
});

// ======================================================
// LOGIN
// ======================================================

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});

// ======================================================
// CREATE ADMIN
// ======================================================

export const createAdminSchema = z.object({
  body: createAccountBodySchema,
});

// ======================================================
// CREATE USER
// ======================================================

export const createUserSchema = z.object({
  body: createAccountBodySchema,
});