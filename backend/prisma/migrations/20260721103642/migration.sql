-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'USER') NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productImage` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `productPrice` DOUBLE NOT NULL,
    `gst` DOUBLE NOT NULL DEFAULT 18,
    `sellingPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedBy` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `subTotal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `paidAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `dueAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Invoice_paymentId_key`(`paymentId`),
    INDEX `Invoice_paymentId_idx`(`paymentId`),
    INDEX `Invoice_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `gst` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discount` (
    `id` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `couponName` VARCHAR(191) NOT NULL,
    `couponCode` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `discountValue` DOUBLE NOT NULL,
    `minOrderAmount` DOUBLE NULL,
    `maxOrderAmount` DOUBLE NULL,
    `maxDiscountAmount` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Coupon_couponCode_key`(`couponCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `paymentNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `paymentMethod` ENUM('CASH', 'UPI', 'CARD', 'ONLINE', 'BANK_TRANSFER') NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NULL,
    `discountValue` DOUBLE NOT NULL DEFAULT 0,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `finalAmount` DOUBLE NOT NULL,
    `paidAmount` DOUBLE NOT NULL,
    `dueAmount` DOUBLE NOT NULL,
    `status` ENUM('PAID', 'PENDING', 'PARTIAL', 'REFUNDED') NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,

    UNIQUE INDEX `Payment_paymentNumber_key`(`paymentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentItem` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentItem_paymentId_idx`(`paymentId`),
    INDEX `PaymentItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Return` (
    `id` VARCHAR(191) NOT NULL,
    `returnNumber` VARCHAR(191) NOT NULL,
    `returnDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productName` VARCHAR(191) NOT NULL,
    `productImage` VARCHAR(191) NULL,
    `subTotal` DOUBLE NOT NULL DEFAULT 0,
    `grandTotal` DOUBLE NOT NULL DEFAULT 0,
    `refundStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NULL,

    UNIQUE INDEX `Return_returnNumber_key`(`returnNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Audit` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NOT NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `reportName` VARCHAR(191) NOT NULL,
    `reportType` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL') NOT NULL,
    `format` ENUM('JSON', 'PDF', 'EXCEL', 'CSV') NOT NULL DEFAULT 'JSON',
    `status` ENUM('GENERATING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'GENERATING',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `day` INTEGER NULL,
    `week` INTEGER NULL,
    `month` INTEGER NULL,
    `year` INTEGER NULL,
    `filters` JSON NULL,
    `reportData` JSON NULL,
    `totalProducts` INTEGER NOT NULL DEFAULT 0,
    `totalUsers` INTEGER NOT NULL DEFAULT 0,
    `totalInvoices` INTEGER NOT NULL DEFAULT 0,
    `totalPayments` INTEGER NOT NULL DEFAULT 0,
    `totalReturns` INTEGER NOT NULL DEFAULT 0,
    `totalSales` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalPaid` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalDue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalDiscount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalPaymentReceived` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalRefund` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `netRevenue` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `fileUrl` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `totalRecords` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Report_reportType_idx`(`reportType`),
    INDEX `Report_status_idx`(`status`),
    INDEX `Report_format_idx`(`format`),
    INDEX `Report_userId_idx`(`userId`),
    INDEX `Report_startDate_idx`(`startDate`),
    INDEX `Report_endDate_idx`(`endDate`),
    INDEX `Report_createdAt_idx`(`createdAt`),
    INDEX `Report_reportType_year_month_idx`(`reportType`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Discount` ADD CONSTRAINT `Discount_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentItem` ADD CONSTRAINT `PaymentItem_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentItem` ADD CONSTRAINT `PaymentItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Return` ADD CONSTRAINT `Return_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Return` ADD CONSTRAINT `Return_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Return` ADD CONSTRAINT `Return_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
