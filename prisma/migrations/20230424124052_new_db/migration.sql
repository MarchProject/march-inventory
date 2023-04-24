/*
  Warnings:

  - You are about to drop the `Functions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupFunctions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `GroupFunctions` DROP FOREIGN KEY `GroupFunctions_functionId_fkey`;

-- DropForeignKey
ALTER TABLE `GroupFunctions` DROP FOREIGN KEY `GroupFunctions_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `GroupMembers` DROP FOREIGN KEY `GroupMembers_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `GroupMembers` DROP FOREIGN KEY `GroupMembers_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_role_fkey`;

-- DropTable
DROP TABLE `Functions`;

-- DropTable
DROP TABLE `GroupFunctions`;

-- DropTable
DROP TABLE `GroupMembers`;

-- DropTable
DROP TABLE `Groups`;

-- DropTable
DROP TABLE `Payments`;

-- DropTable
DROP TABLE `Users`;
