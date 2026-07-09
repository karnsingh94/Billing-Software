/*
  Warnings:

  - Added the required column `price` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `productName` VARCHAR(191) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `totalPrice` DOUBLE NOT NULL;
