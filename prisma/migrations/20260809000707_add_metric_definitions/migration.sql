-- CreateTable
CREATE TABLE "MetricDefinition" (
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

-- CreateIndex
CREATE UNIQUE INDEX "MetricDefinition_modelId_key_key" ON "MetricDefinition"("modelId", "key");
