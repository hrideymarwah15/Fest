import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// Helper to sanitize CSV cell values to prevent formula injection
function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Prevent CSV injection by escaping cells starting with formula characters
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

// Export registrations as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Only check for ADMIN role, remove hardcoded email
    if (!session?.user || session.user.role !== "ADMIN") {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get("sportId");
    const collegeId = searchParams.get("collegeId");
    const status = searchParams.get("status");

    const registrations = await db.registration.findMany({
      where: {
        ...(sportId && { sportId }),
        ...(collegeId && { collegeId }),
        ...(status && { status: status as any }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        sport: {
          select: {
            name: true,
            type: true,
            fee: true,
          },
        },
        college: {
          select: {
            name: true,
            code: true,
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
            razorpayPaymentId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "Registration ID",
      "Team Name",
      "Sport",
      "Sport Type",
      "College",
      "Captain Name",
      "Captain Email",
      "Captain Phone",
      "Team Members",
      "Status",
      "Payment Amount",
      "Payment Status",
      "Payment ID",
      "Registration Date",
    ];

    const rows = registrations.map((reg) => [
      sanitizeCsvCell(reg.id),
      sanitizeCsvCell(reg.teamName || "N/A"),
      sanitizeCsvCell(reg.sport.name),
      sanitizeCsvCell(reg.sport.type),
      sanitizeCsvCell(reg.college?.name || "N/A"),
      sanitizeCsvCell(reg.user.name || "N/A"),
      sanitizeCsvCell(reg.user.email || "N/A"),
      sanitizeCsvCell(reg.user.phone || "N/A"),
      sanitizeCsvCell(
        Array.isArray(reg.teamMembers)
          ? (reg.teamMembers as any[]).map((m) => m.name).join("; ")
          : "N/A"
      ),
      sanitizeCsvCell(reg.status),
      sanitizeCsvCell(reg.payment?.amount || 0),
      sanitizeCsvCell(reg.payment?.status || "N/A"),
      sanitizeCsvCell(reg.payment?.razorpayPaymentId || "N/A"),
      sanitizeCsvCell(new Date(reg.createdAt).toISOString()),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations-${Date.now()}.csv"`,
      },
    });
  } catch {
    return serverErrorResponse("Failed to export registrations");
  }
}
