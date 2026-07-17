/*
  Warnings:

  - You are about to drop the column `createdBy` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `grandTotal` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `gst` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceDate` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `payment` table. All the data in the column will be lost.
  - You are about to alter the column `paymentMethod` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to drop the `discount` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `discount` DROP FOREIGN KEY `Discount_invoiceId_fkey`;

-- AlterTable
ALTER TABLE `invoice` DROP COLUMN `createdBy`,
    DROP COLUMN `discountValue`,
    DROP COLUMN `grandTotal`,
    DROP COLUMN `gst`,
    DROP COLUMN `invoiceDate`,
    DROP COLUMN `paymentMethod`,
    DROP COLUMN `paymentStatus`,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `totalAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `subTotal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `discountAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `paidAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `dueAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `createdBy`,
    DROP COLUMN `paymentDate`,
    DROP COLUMN `productName`,
    ADD COLUMN `productId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `paymentMethod` ENUM('CASH', 'UPI', 'CARD', 'ONLINE', 'BANK_TRANSFER') NOT NULL,
    MODIFY `amount` DECIMAL(15, 2) NOT NULL,
    MODIFY `price` DECIMAL(15, 2) NOT NULL,
    MODIFY `totalPrice` DECIMAL(15, 2) NOT NULL,
    MODIFY `discountAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `discountPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    MODIFY `discountValue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `finalPrice` DECIMAL(15, 2) NOT NULL;

-- DropTable
DROP TABLE `discount`;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `couponName` VARCHAR(191) NOT NULL,
    `couponCode` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minOrderAmount` DOUBLE NOT NULL DEFAULT 0,
    `maxDiscountAmount` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `maxUsage` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coupon_couponCode_key`(`couponCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_paymentId_key` ON `Invoice`(`paymentId`);

-- CreateIndex
CREATE INDEX `Invoice_paymentId_idx` ON `Invoice`(`paymentId`);

-- CreateIndex
CREATE INDEX `Payment_productId_idx` ON `Payment`(`productId`);

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Invoice_userId_idx` ON `Invoice`(`userId`);
DROP INDEX `Invoice_userId_fkey` ON `invoice`;

-- RedefineIndex
CREATE INDEX `Payment_userId_idx` ON `Payment`(`userId`);
DROP INDEX `Payment_userId_fkey` ON `payment`;
