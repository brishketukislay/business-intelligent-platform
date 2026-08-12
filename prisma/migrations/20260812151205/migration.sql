/*
  This migration preserves the BusinessModel item label columns
  while adding/changing the model type structure.
*/

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_BusinessModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemLabelSingular" TEXT NOT NULL DEFAULT 'Item',
    "itemLabelPlural" TEXT NOT NULL DEFAULT 'Items',
    CONSTRAINT "BusinessModel_createdBy_fkey"
      FOREIGN KEY ("createdBy")
      REFERENCES "User" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

INSERT INTO "new_BusinessModel" (
    "createdAt",
    "createdBy",
    "description",
    "id",
    "modelType",
    "name",
    "status",
    "itemLabelSingular",
    "itemLabelPlural"
)
SELECT
    "createdAt",
    "createdBy",
    "description",
    "id",
    "modelType",
    "name",
    "status",
    "itemLabelSingular",
    "itemLabelPlural"
FROM "BusinessModel";

DROP TABLE "BusinessModel";

ALTER TABLE "new_BusinessModel" RENAME TO "BusinessModel";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;