-- CreateTable
CREATE TABLE "BusinessModelAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessModelAccess_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "BusinessModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessModelAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BusinessModelAccess_userId_idx" ON "BusinessModelAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessModelAccess_modelId_userId_key" ON "BusinessModelAccess"("modelId", "userId");
