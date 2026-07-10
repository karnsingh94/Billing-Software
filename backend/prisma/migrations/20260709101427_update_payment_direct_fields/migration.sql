-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_invoiceId_fkey`;

-- DropIndex
DROP INDEX `Payment_invoiceId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` MODIFY `invoiceId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
