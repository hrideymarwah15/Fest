import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
  };

  try {
    // Try to import db
    const { db } = await import("@/lib/db");
    diagnostics.dbImported = true;
    
    // Try a simple query
    const count = await db.sport.count();
    diagnostics.sportsCount = count;
    diagnostics.status = "healthy";
  } catch (error) {
    diagnostics.status = "error";
    diagnostics.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(diagnostics);
}
