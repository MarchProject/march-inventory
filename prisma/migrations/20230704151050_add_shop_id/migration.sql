-- AlterTable
ALTER TABLE `InventoryFile` ADD COLUMN `shopsId` VARCHAR(40) NULL,
    ADD COLUMN `status` ENUM('PASS', 'FAIL') NOT NULL DEFAULT 'PASS';
