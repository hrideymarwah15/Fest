
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

async function verify() {
    console.log("🔍 Verifying System Integrity...");

    try {
        const adapter = new PrismaBetterSqlite3({ url: "prisma/dev.db" });
        const prisma = new PrismaClient({ adapter });

        const sportsCount = await prisma.sport.count();
        const collegesCount = await prisma.college.count();
        const usersCount = await prisma.user.count();

        console.log(`✅ Database Connection: SUCCESS`);
        console.log(`📊 Data Stats:`);
        console.log(`   - Sports: ${sportsCount}`);
        console.log(`   - Colleges: ${collegesCount}`);
        console.log(`   - Users: ${usersCount}`);

        if (sportsCount === 0) throw new Error("Database is empty! Seeding failed.");

        const admin = await prisma.user.findUnique({ where: { email: "admin@sportsfest.com" } });
        if (!admin) console.warn("⚠️ Admin user not found!");
        else console.log("✅ Admin User: Verified");

        console.log("\n🚀 SYSTEM STATUS: FUNCTIONAL");
        console.log("   (Ensure you restart your Next.js dev server to pick up the new .env configuration)");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verify();
