/*
  Warnings:

  - Added the required column `kendaraanId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `kendaraanId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_kendaraanId_fkey` FOREIGN KEY (`kendaraanId`) REFERENCES `Kendaraan`(`noPolisi`) ON DELETE RESTRICT ON UPDATE CASCADE;
