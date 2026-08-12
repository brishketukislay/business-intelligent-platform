-- DropIndex
DROP INDEX "AnalyticsChart_createdBy_createdAt_idx";

-- CreateTable
CREATE TABLE "ModelItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelItem_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelItemValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "periodId" TEXT,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelItemValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ModelItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelItemValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelItemValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemLabelSingular" TEXT NOT NULL DEFAULT 'Item',
    "itemLabelPlural" TEXT NOT NULL DEFAULT 'Items',
    CONSTRAINT "BusinessModel_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BusinessModel" ("createdAt", "createdBy", "description", "id", "name", "status") SELECT "createdAt", "createdBy", "description", "id", "name", "status" FROM "BusinessModel";
DROP TABLE "BusinessModel";
ALTER TABLE "new_BusinessModel" RENAME TO "BusinessModel";
CREATE TABLE "new_SavedModelValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "savedModelId" TEXT,
    "periodId" TEXT,
    "itemId" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedModelValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_savedModelId_fkey" FOREIGN KEY ("savedModelId") REFERENCES "SavedModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ModelItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedModelValue" ("createdAt", "id", "inputId", "modelId", "periodId", "savedModelId", "value") SELECT "createdAt", "id", "inputId", "modelId", "periodId", "savedModelId", "value" FROM "SavedModelValue";
DROP TABLE "SavedModelValue";
ALTER TABLE "new_SavedModelValue" RENAME TO "SavedModelValue";
CREATE INDEX "SavedModelValue_savedModelId_idx" ON "SavedModelValue"("savedModelId");
CREATE INDEX "SavedModelValue_periodId_idx" ON "SavedModelValue"("periodId");
CREATE INDEX "SavedModelValue_itemId_idx" ON "SavedModelValue"("itemId");
CREATE TABLE "new_ScenarioValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "periodId" TEXT,
    "itemId" TEXT,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScenarioValue_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ModelItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScenarioValue" ("id", "inputId", "periodId", "scenarioId", "updatedAt", "value") SELECT "id", "inputId", "periodId", "scenarioId", "updatedAt", "value" FROM "ScenarioValue";
DROP TABLE "ScenarioValue";
ALTER TABLE "new_ScenarioValue" RENAME TO "ScenarioValue";
CREATE INDEX "ScenarioValue_scenarioId_idx" ON "ScenarioValue"("scenarioId");
CREATE INDEX "ScenarioValue_periodId_idx" ON "ScenarioValue"("periodId");
CREATE INDEX "ScenarioValue_itemId_idx" ON "ScenarioValue"("itemId");
CREATE INDEX "ScenarioValue_scenarioId_inputId_idx" ON "ScenarioValue"("scenarioId", "inputId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ModelItem_modelId_sortOrder_idx" ON "ModelItem"("modelId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ModelItem_modelId_key_key" ON "ModelItem"("modelId", "key");

-- CreateIndex
CREATE INDEX "ModelItemValue_itemId_idx" ON "ModelItemValue"("itemId");

-- CreateIndex
CREATE INDEX "ModelItemValue_inputId_idx" ON "ModelItemValue"("inputId");

-- CreateIndex
CREATE INDEX "ModelItemValue_periodId_idx" ON "ModelItemValue"("periodId");

-- CreateIndex
CREATE INDEX "ModelItemValue_itemId_inputId_idx" ON "ModelItemValue"("itemId", "inputId");

-- CreateIndex
CREATE INDEX "ModelItemValue_itemId_periodId_idx" ON "ModelItemValue"("itemId", "periodId");

-- CreateIndex
CREATE INDEX "AnalyticsChart_createdBy_idx" ON "AnalyticsChart"("createdBy");
