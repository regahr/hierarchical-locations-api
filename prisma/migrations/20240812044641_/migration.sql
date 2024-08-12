-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationNumber" TEXT NOT NULL,
    "parentLocationId" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationVersion" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "building" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationNumber" TEXT NOT NULL,
    "parentLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatabaseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndpointLog" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndpointLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationNumber_key" ON "Location"("locationNumber");

-- CreateIndex
CREATE INDEX "Location_parentLocationId_idx" ON "Location"("parentLocationId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationVersion" ADD CONSTRAINT "LocationVersion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
