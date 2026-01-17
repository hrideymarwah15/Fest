import { PrismaClient } from "@prisma/client";

// Determine database type from connection string
const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres = databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");
const isSqlite = databaseUrl.startsWith("file:");

// Global store to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient with appropriate adapter
async function createPrismaClient(): Promise<PrismaClient> {
  const logConfig = process.env.NODE_ENV === "development"
    ? ["query" as const, "error" as const, "warn" as const]
    : ["error" as const];

  if (isPostgres) {
    // PostgreSQL adapter for production
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: logConfig,
    });
  } else if (isSqlite) {
    // SQLite adapter for local development
    const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
    const path = await import("path");

    const dbPath = databaseUrl.replace("file:", "");
    const resolvedPath = path.resolve(process.cwd(), dbPath);
    const adapter = new PrismaBetterSqlite3({ url: resolvedPath });

    return new PrismaClient({
      adapter,
      log: logConfig,
    });
  }

  // Fallback (should not happen in proper setup)
  throw new Error("DATABASE_URL must start with 'postgresql://' or 'file:'");
}

// Singleton pattern with lazy initialization
let prismaInstance: PrismaClient | null = null;

async function getPrismaClient(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (!prismaInstance) {
    prismaInstance = await createPrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }

  return prismaInstance;
}

// For synchronous access (after initialization)
// Using a proxy that will resolve the promise on first access
export const db = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    // Return the property from the cached instance
    if (globalForPrisma.prisma) {
      return (globalForPrisma.prisma as any)[prop];
    }

    // For initial access, we need the sync instance
    // This works because Prisma 7 with adapters initializes synchronously
    if (!prismaInstance) {
      // Synchronous initialization for SQLite
      if (isSqlite) {
        const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
        const path = require("path");
        const dbPath = databaseUrl.replace("file:", "");
        const resolvedPath = path.resolve(process.cwd(), dbPath);
        const adapter = new PrismaBetterSqlite3({ url: resolvedPath });

        prismaInstance = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
        });

        if (process.env.NODE_ENV !== "production") {
          globalForPrisma.prisma = prismaInstance;
        }
      } else if (isPostgres) {
        const { PrismaPg } = require("@prisma/adapter-pg");
        const { Pool } = require("pg");

        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        prismaInstance = new PrismaClient({
          adapter,
          log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
        });

        if (process.env.NODE_ENV !== "production") {
          globalForPrisma.prisma = prismaInstance;
        }
      }
    }

    return (prismaInstance as any)?.[prop];
  },
});

// Export async getter for explicit async usage
export { getPrismaClient };
