-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricDefinition_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MetricDefinition" ("category", "formula", "id", "key", "modelId", "name", "status", "type", "unit") SELECT "category", "formula", "id", "key", "modelId", "name", "status", "type", "unit" FROM "MetricDefinition";
DROP TABLE "MetricDefinition";
ALTER TABLE "new_MetricDefinition" RENAME TO "MetricDefinition";
CREATE UNIQUE INDEX "MetricDefinition_modelId_key_key" ON "MetricDefinition"("modelId", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
