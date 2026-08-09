-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scenario_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Scenario_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "inputId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScenarioValue_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioValue_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "InputDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Scenario_modelId_createdAt_idx" ON "Scenario"("modelId", "createdAt");

-- CreateIndex
CREATE INDEX "Scenario_createdBy_createdAt_idx" ON "Scenario"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "ScenarioValue_scenarioId_idx" ON "ScenarioValue"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioValue_scenarioId_inputId_key" ON "ScenarioValue"("scenarioId", "inputId");
