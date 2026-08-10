/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MetricDefinition` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessModelAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessModelAccess_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessModelAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessModelAccess" ("createdAt", "id", "modelId", "userId") SELECT "createdAt", "id", "modelId", "userId" FROM "BusinessModelAccess";
DROP TABLE "BusinessModelAccess";
ALTER TABLE "new_BusinessModelAccess" RENAME TO "BusinessModelAccess";
CREATE INDEX "BusinessModelAccess_modelId_idx" ON "BusinessModelAccess"("modelId");
CREATE INDEX "BusinessModelAccess_userId_idx" ON "BusinessModelAccess"("userId");
CREATE UNIQUE INDEX "BusinessModelAccess_modelId_userId_key" ON "BusinessModelAccess"("modelId", "userId");
CREATE TABLE "new_MetricDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "formula" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "MetricDefinition_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MetricDefinition" ("category", "formula", "id", "key", "modelId", "name", "status", "type", "unit") SELECT "category", "formula", "id", "key", "modelId", "name", "status", "type", "unit" FROM "MetricDefinition";
DROP TABLE "MetricDefinition";
ALTER TABLE "new_MetricDefinition" RENAME TO "MetricDefinition";
CREATE UNIQUE INDEX "MetricDefinition_modelId_key_key" ON "MetricDefinition"("modelId", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
