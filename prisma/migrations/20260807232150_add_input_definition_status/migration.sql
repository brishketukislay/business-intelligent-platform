-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InputDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InputDefinition_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InputDefinition" ("category", "createdAt", "id", "key", "modelId", "name", "type", "unit") SELECT "category", "createdAt", "id", "key", "modelId", "name", "type", "unit" FROM "InputDefinition";
DROP TABLE "InputDefinition";
ALTER TABLE "new_InputDefinition" RENAME TO "InputDefinition";
CREATE UNIQUE INDEX "InputDefinition_modelId_key_key" ON "InputDefinition"("modelId", "key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
