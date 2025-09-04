/*
  Warnings:

  - The primary key for the `Availability` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sub` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `familyName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - Added the required column `sellerId` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_sub_key";

-- AlterTable
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_pkey",
DROP COLUMN "userId",
ADD COLUMN     "sellerId" INTEGER NOT NULL,
ALTER COLUMN "pricePerHour" SET DEFAULT 0,
ADD CONSTRAINT "Availability_pkey" PRIMARY KEY ("sellerId", "from", "to");

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "userId",
ADD COLUMN     "sellerId" INTEGER NOT NULL,
ALTER COLUMN "pricePerHour" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "googleAccessToken",
DROP COLUMN "googleRefreshToken",
DROP COLUMN "passwordHash",
DROP COLUMN "sub",
ALTER COLUMN "familyName" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(32);

-- CreateTable
CREATE TABLE "EmailAuthMethod" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "EmailAuthMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleAuthMethod" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "googleId" TEXT NOT NULL,

    CONSTRAINT "GoogleAuthMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleCalendarIntegration" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "GoogleCalendarIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleCalendarIntegration" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "AppleCalendarIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailAuthMethod_sellerId_key" ON "EmailAuthMethod"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAuthMethod_email_key" ON "EmailAuthMethod"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuthMethod_sellerId_key" ON "GoogleAuthMethod"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAuthMethod_googleId_key" ON "GoogleAuthMethod"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarIntegration_sellerId_key" ON "GoogleCalendarIntegration"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "AppleCalendarIntegration_sellerId_key" ON "AppleCalendarIntegration"("sellerId");

-- AddForeignKey
ALTER TABLE "EmailAuthMethod" ADD CONSTRAINT "EmailAuthMethod_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleAuthMethod" ADD CONSTRAINT "GoogleAuthMethod_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarIntegration" ADD CONSTRAINT "GoogleCalendarIntegration_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppleCalendarIntegration" ADD CONSTRAINT "AppleCalendarIntegration_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
