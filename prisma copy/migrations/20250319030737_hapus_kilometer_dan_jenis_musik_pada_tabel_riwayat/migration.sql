/*
  Warnings:

  - You are about to drop the column `jenisMesin` on the `riwayat` table. All the data in the column will be lost.
  - You are about to drop the column `kilometer` on the `riwayat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `riwayat` DROP COLUMN `jenisMesin`,
    DROP COLUMN `kilometer`;
