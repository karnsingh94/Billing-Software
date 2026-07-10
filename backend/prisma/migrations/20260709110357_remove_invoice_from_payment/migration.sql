/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_invoiceId_fkey`;

-- DropIndex
DROP INDEX `Payment_invoiceId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `invoiceId`,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountPercent` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountValue` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `finalPrice` DOUBLE NOT NULL DEFAULT 0;
