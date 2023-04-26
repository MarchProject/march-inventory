/*
  Warnings:

  - You are about to drop the `inventory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `BrandType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `InventoryType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `Inventory_BrandTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `Inventory_InventoryTypeId_fkey`;

-- DropTable
DROP TABLE `inventory`;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `InventoryTypeId` VARCHAR(40) NOT NULL,
    `BrandTypeId` VARCHAR(40) NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `price` INTEGER NOT NULL DEFAULT 0,
    `sold` INTEGER NOT NULL DEFAULT 0,
    `expiryDate` DATETIME(3) NULL,
    `shopsId` VARCHAR(40) NULL,
    `description` VARCHAR(191) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Inventory_name_key`(`name`),
    FULLTEXT INDEX `Inventory_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BrandType_name_key` ON `BrandType`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `InventoryType_name_key` ON `InventoryType`(`name`);

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_BrandTypeId_fkey` FOREIGN KEY (`BrandTypeId`) REFERENCES `BrandType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_InventoryTypeId_fkey` FOREIGN KEY (`InventoryTypeId`) REFERENCES `InventoryType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
