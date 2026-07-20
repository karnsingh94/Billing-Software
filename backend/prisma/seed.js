import bcrypt from "bcryptjs";
import prisma from "../src/db/db.js";

async function main() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  if (existingSuperAdmin) {
    console.log("✅ Super Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Azz@12345", 10);

  const superAdmin = await prisma.user.create({
    data: {
      fullName: "Azzuniqe",
      email: "Azzuniqe1@gmail.com",
      password: hashedPassword,
      phone: "0987654321",
      location: "India",
      role: "SUPER_ADMIN",
      isActive: true,
      createdById: null,
    },
  });

  console.log("✅ Super Admin created successfully");
  console.log(superAdmin);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });