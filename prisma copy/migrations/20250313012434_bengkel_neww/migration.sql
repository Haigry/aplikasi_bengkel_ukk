-- CreateTable
CREATE TABLE `RiwayatSparepart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `riwayatId` INTEGER NOT NULL,
    `sparepartId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `harga` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RiwayatSparepart` ADD CONSTRAINT `RiwayatSparepart_riwayatId_fkey` FOREIGN KEY (`riwayatId`) REFERENCES `Riwayat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiwayatSparepart` ADD CONSTRAINT `RiwayatSparepart_sparepartId_fkey` FOREIGN KEY (`sparepartId`) REFERENCES `Sparepart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
