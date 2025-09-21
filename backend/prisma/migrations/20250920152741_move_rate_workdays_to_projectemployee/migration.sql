/*
  Warnings:

  - You are about to drop the column `rate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `workDays` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Employee" DROP COLUMN "rate",
DROP COLUMN "workDays",
ADD COLUMN     "roleId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ProjectEmployee" ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "workDays" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
