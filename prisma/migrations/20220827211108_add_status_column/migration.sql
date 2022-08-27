-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'PENDING', 'CLOSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" "Status" NOT NULL DEFAULT 'PENDING';
