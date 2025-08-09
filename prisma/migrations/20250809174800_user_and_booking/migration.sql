-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "pricePerHour" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "pricePerHour" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "familyName" TEXT,
ADD COLUMN     "firstName" TEXT;
