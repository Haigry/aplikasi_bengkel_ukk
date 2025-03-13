/*
  Warnings:

  - You are about to drop the column `email` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `riwayat` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `sparepart` table. All the data in the column will be lost.
  - You are about to drop the `_kendaraantoriwayat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaksiitem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Karyawan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[NoKTP]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CC` to the `Kendaraan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `Kendaraan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipe` to the `Kendaraan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transmisi` to the `Kendaraan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Kendaraan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kendaraanId` to the `Riwayat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_kendaraantoriwayat` DROP FOREIGN KEY `_KendaraanToRiwayat_A_fkey`;

-- DropForeignKey
ALTER TABLE `_kendaraantoriwayat` DROP FOREIGN KEY `_KendaraanToRiwayat_B_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_email_fkey`;

-- DropForeignKey
ALTER TABLE `transaksiitem` DROP FOREIGN KEY `TransaksiItem_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksiitem` DROP FOREIGN KEY `TransaksiItem_sparepartId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksiitem` DROP FOREIGN KEY `TransaksiItem_transaksiId_fkey`;

-- DropIndex
DROP INDEX `Booking_email_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Karyawan_email_key` ON `karyawan`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `email`,
    ADD COLUMN `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `karyawan` DROP COLUMN `email`,
    DROP COLUMN `password`,
    ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `kendaraan` ADD COLUMN `CC` INTEGER NOT NULL,
    ADD COLUMN `tahun` INTEGER NOT NULL,
    ADD COLUMN `tipe` VARCHAR(191) NOT NULL,
    ADD COLUMN `transmisi` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `riwayat` DROP COLUMN `status`,
    ADD COLUMN `harga` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `kendaraanId` VARCHAR(191) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `serviceId` INTEGER NULL,
    ADD COLUMN `sparepartId` INTEGER NULL;

-- AlterTable
ALTER TABLE `service` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `sparepart` DROP COLUMN `description`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `NoKTP` VARCHAR(191) NULL,
    ADD COLUMN `alamat` TEXT NULL,
    ADD COLUMN `noTelp` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_kendaraantoriwayat`;

-- DropTable
DROP TABLE `transaksiitem`;

-- CreateTable
CREATE TABLE `Laporan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `periode` VARCHAR(191) NOT NULL,
    `omset` DOUBLE NOT NULL DEFAULT 0,
    `jumlahServis` INTEGER NOT NULL DEFAULT 0,
    `jumlahSparepart` INTEGER NOT NULL DEFAULT 0,
    `totalTransaksi` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiwayatLaporan` (
    `laporanId` INTEGER NOT NULL,
    `riwayatId` INTEGER NOT NULL,

    PRIMARY KEY (`laporanId`, `riwayatId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Karyawan_userId_key` ON `Karyawan`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_NoKTP_key` ON `User`(`NoKTP`);

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kendaraan` ADD CONSTRAINT `Kendaraan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riwayat` ADD CONSTRAINT `Riwayat_kendaraanId_fkey` FOREIGN KEY (`kendaraanId`) REFERENCES `Kendaraan`(`noPolisi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riwayat` ADD CONSTRAINT `Riwayat_sparepartId_fkey` FOREIGN KEY (`sparepartId`) REFERENCES `Sparepart`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riwayat` ADD CONSTRAINT `Riwayat_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiwayatLaporan` ADD CONSTRAINT `RiwayatLaporan_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiwayatLaporan` ADD CONSTRAINT `RiwayatLaporan_riwayatId_fkey` FOREIGN KEY (`riwayatId`) REFERENCES `Riwayat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
