-- CreateTable
CREATE TABLE "SavedModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModel_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedModelValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "savedModelId" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedModelValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_savedModelId_fkey" FOREIGN KEY ("savedModelId") REFERENCES "SavedModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedModelValue" ("createdAt", "id", "inputId", "modelId", "value") SELECT "createdAt", "id", "inputId", "modelId", "value" FROM "SavedModelValue";
DROP TABLE "SavedModelValue";
ALTER TABLE "new_SavedModelValue" RENAME TO "SavedModelValue";
CREATE INDEX "SavedModelValue_savedModelId_idx" ON "SavedModelValue"("savedModelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SavedModel_modelId_createdAt_idx" ON "SavedModel"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedModel_createdBy_createdAt_idx" ON "SavedModel"("createdBy", "createdAt");
