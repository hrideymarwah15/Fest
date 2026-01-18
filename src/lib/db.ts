import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Global store to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient for Supabase PostgreSQL
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const logConfig = process.env.NODE_ENV === "development"
    ? ["query" as const, "error" as const, "warn" as const]
    : ["error" as const];

  // Create PostgreSQL connection pool for Supabase
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: logConfig,
  });
}

// Singleton pattern for Prisma Client
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Ensure connection is established
export async function connectDatabase() {
  try {
    await db.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await db.$disconnect();
}
