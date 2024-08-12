<p align="center">
    <h1 align="center">Hierarchical Locations API</h1>
</p>

<p align="center">
	<img src="https://img.shields.io/github/license/regahr/hierarchical-locations-api?style=flat&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/regahr/hierarchical-locations-api?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/regahr/hierarchical-locations-api?style=flat&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/regahr/hierarchical-locations-api?style=flat&color=0080ff" alt="repo-language-count">
<p>
<p align="center">
	<img src="https://img.shields.io/badge/-NestJs-ea2845?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
	<img src="https://img.shields.io/badge/postgresql-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/Prisma-2D3748.svg?style=flat&logo=Prisma&logoColor=white" alt="Prisma">
	<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=flat&logo=Prettier&logoColor=black" alt="Prettier">
	<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=flat&logo=ts-node&logoColor=white" alt="tsnode">
	<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
</p>
<hr>

This project is a CRUD REST API for managing locations data, built using NestJS with Typescript and Prisma ORM with PostgreSQL.

## Table of Contents

- [Design Decisions](#design-decisions)
- [API Schema](#api-schema)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Conclusion](#conclusion)

## Design Decisions

This API was built with a focus on maintaining a hierarchical structure for locations, allowing each location to have a parent-child relationship. The design allows for infinite nesting of locations and includes features like auto-detecting parent locations based on `locationNumber` and providing guidance in error messages for correct data entry.

Key considerations:

- Hierarchical Relationships: The Location model supports nested parent-child relationships, which are essential for scenarios like geographical hierarchies, organizational structures, or category management.
- UUIDs for IDs: The use of UUIDs as primary keys ensures unique and non-guessable identifiers for locations.
- Validation and Logging: Input validations ensure data integrity, and extensive logging tracks all database queries and operations, providing useful insights and audit trails.
- Error Handling: Instead of simply returning errors, the API provides actionable guidance in error messages, such as suggesting valid parent locations when a parent location is not found.
- Data Versioning: Each location is versioned to maintain a history of changes. This ensures that updates and deletions are tracked, allowing for potential rollback and audit capabilities. Versioning is crucial for maintaining data integrity, especially in complex hierarchical structures.

## DB Schema

### Tables

- **Location**

  ```sql
  CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationNumber" TEXT NOT NULL,
    "parentLocationId" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
  );
  ```

- **LocationVersion**

  ```sql
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
  ```

- **DatabaseLog**

  ```sql
  CREATE TABLE "DatabaseLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatabaseLog_pkey" PRIMARY KEY ("id")
  );
  ```
- **EndpointLog**
  ```sql
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
  ```
## API Schema

### Locations
- Create a Location
  - `[POST] /locations`
  - Payload: `{ "locationName": "string", "locationNumber": "string" } `
  - Auto-detects `parentLocationNumber` and `building` based on `locationNumber`

- Get All Locations
  - `[GET] /locations`
  - Returns a list of all locations with their respective hierarchies.

- Get Location by locationNumber
  - `[GET] /locations/:locationNumber`
  - Returns a specific location by its locationNumber, including its hierarchy. 

- Update a Location
  - `PUT /locations/:id`
  - Payload: `{ "locationName": "string", "locationNumber": "string" }`
  - Updates a location and re-validates its position in the hierarchy.

- Delete a Location
  - `DELETE /locations/:id`
  - Deletes a location and its entire hierarchy.

### Logs
- Get All Database Logs
  - `[GET] /logs/database`
  - Returns all database operation logs stored in the database, useful for debugging and auditing.
- Get All Endpoint Logs
  - `[GET] /logs/endpoint`
  - Returns all endpoint trailing logs stored in the database, useful for debugging and auditing.

## Setup and Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/regahr/hierarchical-locations-api
   cd hierarchical-locations-api
   ```

2. **Install dependencies**:

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
  
    Create a `.env` file in the root of your project
    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/yourdatabase
    ```

4. **Run database migrations**:

   ```sh
   npx prisma migrate dev
   ```

5. **Run prisma module generation**:

   ```sh
   npx prisma generate
   ```

6. **Start the server**:

   ```sh
   npm run start:dev
   # or
   yarn start:dev
   ```

## Usage

Once the server is running, you can interact with the API using tools like Postman or cURL. The base URL for the API will be http://localhost:3000.

## Folder Structure

```sh
hierarchical-location-api/
│
├── prisma/
│ └── schema.prisma
│
├── src/
│ ├── log/
│ │ ├── log.controller.ts
│ │ ├── log.module.ts
│ │ └── log.service.ts
│ ├── location/
│ │ ├── dto/
│ │ │ ├── create-location.dto.ts
│ │ │ └── update-location.dto.ts
│ │ ├── location.controller.ts
│ │ ├── location.module.ts
│ │ └── location.service.ts
│ ├── prisma/
│ │ └── prisma.service.ts
│ ├── main.ts
│ ├── app.module.ts
│ ├── app.service.ts
│ ├── http-exception.filter.ts
│ └── logging.interceptor.ts
├── .tsconfig.json
├── package.json
└── README.md
```

## Conclusion

The Hierarchical Locations API provides a robust and flexible solution for managing hierarchical locations data. With its focus on simplicity, scalability, and usability, it can be easily integrated into larger systems requiring hierarchical locations data management.
