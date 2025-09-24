/*
  Warnings:

  - You are about to drop the column `authorId` on the `list` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_authorId_fkey`;

-- DropIndex
DROP INDEX `List_authorId_fkey` ON `list`;

-- AlterTable
ALTER TABLE `list` DROP COLUMN `authorId`;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
