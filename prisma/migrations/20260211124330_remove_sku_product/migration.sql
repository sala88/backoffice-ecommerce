/*
  Warnings:

  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `ProductSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_sku_idx";

-- DropIndex
DROP INDEX "Product_sku_key";

-- DropIndex
DROP INDEX "User_updatedAt_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "ProductSnapshot" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
