/*
  Warnings:

  - You are about to drop the `transaksi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_karyawanId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksiitem` DROP FOREIGN KEY `TransaksiItem_transaksiId_fkey`;

-- DropIndex
DROP INDEX `TransaksiItem_transaksiId_fkey` ON `transaksiitem`;

-- AlterTable
ALTER TABLE `transaksiitem` ADD COLUMN `subtotal` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `quantity` INTEGER NOT NULL DEFAULT 1,
    MODIFY `harga` DOUBLE NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `transaksi`;

-- CreateTable
CREATE TABLE `Kendaraan` (
    `noPolisi` VARCHAR(191) NOT NULL,
    `merk` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`noPolisi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Riwayat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `karyawanId` INTEGER NOT NULL,
    `totalHarga` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'PROCESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_KendaraanToRiwayat` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_KendaraanToRiwayat_AB_unique`(`A`, `B`),
    INDEX `_KendaraanToRiwayat_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riwayat` ADD CONSTRAINT `Riwayat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riwayat` ADD CONSTRAINT `Riwayat_karyawanId_fkey` FOREIGN KEY (`karyawanId`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransaksiItem` ADD CONSTRAINT `TransaksiItem_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Riwayat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KendaraanToRiwayat` ADD CONSTRAINT `_KendaraanToRiwayat_A_fkey` FOREIGN KEY (`A`) REFERENCES `Kendaraan`(`noPolisi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KendaraanToRiwayat` ADD CONSTRAINT `_KendaraanToRiwayat_B_fkey` FOREIGN KEY (`B`) REFERENCES `Riwayat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
