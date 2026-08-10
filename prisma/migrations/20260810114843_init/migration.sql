-- CreateTable
CREATE TABLE "BusinessModelSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "periodType" TEXT NOT NULL DEFAULT 'MONTH',
    CONSTRAINT "BusinessModelSettings_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "ModelPeriod_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PeriodValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PeriodValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PeriodValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InputDefinition_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InputDefinition" ("category", "createdAt", "id", "key", "modelId", "name", "status", "type", "unit") SELECT "category", "createdAt", "id", "key", "modelId", "name", "status", "type", "unit" FROM "InputDefinition";
DROP TABLE "InputDefinition";
ALTER TABLE "new_InputDefinition" RENAME TO "InputDefinition";
CREATE UNIQUE INDEX "InputDefinition_modelId_key_key" ON "InputDefinition"("modelId", "key");
CREATE TABLE "new_MetricDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "category" TEXT,
    "formula" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'PERIOD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricDefinition_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MetricDefinition" ("category", "createdAt", "formula", "id", "key", "modelId", "name", "status", "type", "unit") SELECT "category", "createdAt", "formula", "id", "key", "modelId", "name", "status", "type", "unit" FROM "MetricDefinition";
DROP TABLE "MetricDefinition";
ALTER TABLE "new_MetricDefinition" RENAME TO "MetricDefinition";
CREATE UNIQUE INDEX "MetricDefinition_modelId_key_key" ON "MetricDefinition"("modelId", "key");
CREATE TABLE "new_SavedModelValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "savedModelId" TEXT,
    "periodId" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedModelValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_savedModelId_fkey" FOREIGN KEY ("savedModelId") REFERENCES "SavedModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedModelValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedModelValue" ("createdAt", "id", "inputId", "modelId", "savedModelId", "value") SELECT "createdAt", "id", "inputId", "modelId", "savedModelId", "value" FROM "SavedModelValue";
DROP TABLE "SavedModelValue";
ALTER TABLE "new_SavedModelValue" RENAME TO "SavedModelValue";
CREATE INDEX "SavedModelValue_savedModelId_idx" ON "SavedModelValue"("savedModelId");
CREATE INDEX "SavedModelValue_periodId_idx" ON "SavedModelValue"("periodId");
CREATE TABLE "new_ScenarioValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "periodId" TEXT,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScenarioValue_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ModelPeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScenarioValue" ("id", "inputId", "scenarioId", "updatedAt", "value") SELECT "id", "inputId", "scenarioId", "updatedAt", "value" FROM "ScenarioValue";
DROP TABLE "ScenarioValue";
ALTER TABLE "new_ScenarioValue" RENAME TO "ScenarioValue";
CREATE INDEX "ScenarioValue_scenarioId_idx" ON "ScenarioValue"("scenarioId");
CREATE INDEX "ScenarioValue_periodId_idx" ON "ScenarioValue"("periodId");
CREATE UNIQUE INDEX "ScenarioValue_scenarioId_inputId_periodId_key" ON "ScenarioValue"("scenarioId", "inputId", "periodId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessModelSettings_modelId_key" ON "BusinessModelSettings"("modelId");

-- CreateIndex
CREATE INDEX "ModelPeriod_modelId_sortOrder_idx" ON "ModelPeriod"("modelId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ModelPeriod_modelId_key_key" ON "ModelPeriod"("modelId", "key");

-- CreateIndex
CREATE INDEX "PeriodValue_periodId_idx" ON "PeriodValue"("periodId");

-- CreateIndex
CREATE INDEX "PeriodValue_inputId_idx" ON "PeriodValue"("inputId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodValue_periodId_inputId_key" ON "PeriodValue"("periodId", "inputId");
