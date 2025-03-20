/*
  Warnings:

  - The values [COMPLETED,PROCESS] on the enum `Booking_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `status` on the `riwayat` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `riwayat` ADD COLUMN `jenisMesin` VARCHAR(191) NULL,
    ADD COLUMN `kilometer` INTEGER NULL,
    ADD COLUMN `notes` TEXT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';
