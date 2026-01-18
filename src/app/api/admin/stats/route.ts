import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/security";

// Admin API for dashboard stats
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.email !== "admin@sportsfest.com")) {
      return unauthorizedResponse();
    }

    // Get total registrations
    const totalRegistrations = await db.registration.count();
    const confirmedRegistrations = await db.registration.count({
      where: { status: "CONFIRMED" },
    });
    const pendingPayments = await db.registration.count({
      where: { status: "PENDING" },
    });

    // Get total revenue
    const payments = await db.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    });

    // Get college count
    const totalColleges = await db.college.count();

    // Get sports count
    const totalSports = await db.sport.count({
      where: { isActive: true },
    });

    // Get sport-wise stats
    const sportStats = await db.sport.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        gender: true,
        maxSlots: true,
        filledSlots: true,
        fee: true,
        registrationOpen: true,
        _count: {
          select: {
            registrations: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
    });

    // Get college-wise stats
    const collegeStats = await db.college.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        registrations: { _count: "desc" },
      },
      take: 10,
    });

    return NextResponse.json({
      totalRegistrations,
      confirmedRegistrations,
      pendingPayments,
      totalRevenue: payments._sum.amount || 0,
      totalColleges,
      totalSports,
      sportStats: sportStats.map((sport) => ({
        ...sport,
        revenue: sport._count.registrations * sport.fee,
      })),
      collegeStats,
    });
  } catch {
    return serverErrorResponse("Failed to fetch stats");
  }
}
