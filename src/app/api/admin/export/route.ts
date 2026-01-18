import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// Export registrations as CSV
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.email !== "admin@sportsfest.com")) {
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
      reg.id,
      reg.teamName || "N/A",
      reg.sport.name,
      reg.sport.type,
      reg.college?.name || "N/A",
      reg.user.name || "N/A",
      reg.user.email || "N/A",
      reg.user.phone || "N/A",
      Array.isArray(reg.teamMembers)
        ? (reg.teamMembers as any[]).map((m) => m.name).join("; ")
        : "N/A",
      reg.status,
      reg.payment?.amount || 0,
      reg.payment?.status || "N/A",
      reg.payment?.razorpayPaymentId || "N/A",
      new Date(reg.createdAt).toISOString(),
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
