"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card, Badge } from "@/components/ui";
import {
  Trophy,
  Download,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  User,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";

interface Registration {
  id: string;
  teamName: string | null;
  status: string;
  createdAt: string;
  sport: {
    id: string;
    name: string;
    slug: string;
    type: string;
    eventDate: string | null;
    venue: string | null;
  };
  college: {
    name: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    razorpayPaymentId: string | null;
  } | null;
}

function SuccessToast() {
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("registration") === "success") {
      setShowSuccessModal(true);
      const timer = setTimeout(() => setShowSuccessModal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showSuccessModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
    >
      <CheckCircle className="w-6 h-6" />
      <span className="font-medium">Registration successful! Welcome aboard.</span>
    </motion.div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return <Badge variant="success">Confirmed</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending Payment</Badge>;
    case "CANCELLED":
      return <Badge variant="error">Cancelled</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}

function getStatusMessage(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Your registration is confirmed and payment is complete.";
    case "PENDING":
      return "Your registration is pending payment. Complete payment to confirm your slot.";
    case "CANCELLED":
      return "Your registration has been cancelled.";
    default:
      return "Unknown status";
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBA";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user registrations
  useEffect(() => {
    async function fetchRegistrations() {
      if (sessionStatus === "loading") return;
      if (!session) {
        router.push("/auth/signin?callbackUrl=/dashboard");
        return;
      }

      try {
        const res = await fetch("/api/registrations");
        if (!res.ok) throw new Error("Failed to fetch registrations");
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRegistrations();
  }, [session, sessionStatus, router]);

  const confirmedCount = registrations.filter((r) => r.status === "CONFIRMED").length;
  const pendingCount = registrations.filter((r) => r.status === "PENDING").length;

  // Handle completing pending payment
  const handleCompletePayment = async (registrationId: string) => {
    if (isProcessingPayment) return;
    
    setIsProcessingPayment(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/complete-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const data = await res.json();

      // Initialize Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount * 100, // Convert to paise
        currency: data.currency,
        name: "Rishihood University Sports Fest",
        description: `Payment for ${registrations.find(r => r.id === registrationId)?.sport.name || "Sport"}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            // Refresh registrations to show updated status
            const regRes = await fetch("/api/registrations");
            if (regRes.ok) {
              const updatedRegistrations = await regRes.json();
              setRegistrations(updatedRegistrations);
            }

            // Show success message
            router.push("/dashboard?registration=success");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#10B981",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setIsProcessingPayment(false);
    }
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Loading dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Success Toast - wrapped in Suspense */}
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>

      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
                  MY DASHBOARD
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Welcome back, {session?.user?.name || "User"}
                </p>
              </div>
              <Link href="/sports">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Register for New Sport
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card hover={false} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--accent-primary-dim)] rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-sm">Total Registrations</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card hover={false} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-sm">Confirmed</p>
                  <p className="text-3xl font-bold text-white">{confirmedCount}</p>
                </div>
              </div>
            </Card>

            <Card hover={false} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-300/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-sm">Pending Payment</p>
                  <p className="text-3xl font-bold text-white">{pendingCount}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl text-white mb-4">MY PROFILE</h2>
            <Card hover={false} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] rounded-2xl flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Name</p>
                    <p className="text-white font-medium">{session?.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Email</p>
                    <p className="text-white font-medium">{session?.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Role</p>
                    <p className="text-white font-medium">{session?.user?.role || "PARTICIPANT"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Registrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-2xl text-white mb-4">
              MY REGISTRATIONS
            </h2>

            {registrations.length === 0 ? (
              <Card hover={false} className="p-12 text-center">
                <Trophy className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">No Registrations Yet</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  You haven&apos;t registered for any sports yet. Start your journey now!
                </p>
                <Link href="/sports">
                  <Button>Browse Sports</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration, index) => (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card hover={false} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Sport Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display text-xl text-white">
                              {registration.sport.name.toUpperCase()}
                            </h3>
                            {getStatusBadge(registration.status)}
                          </div>
                          {registration.teamName && (
                            <p className="text-[var(--accent-primary)] font-medium mb-3">
                              Team: {registration.teamName}
                            </p>
                          )}
                          <p className="text-[var(--text-secondary)] text-sm mb-3">
                            {getStatusMessage(registration.status)}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(registration.sport.eventDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {registration.sport.venue || "TBA"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Registered {formatDate(registration.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-right">
                            <p className="text-[var(--text-muted)] text-sm">Amount</p>
                            <p className="text-2xl font-bold text-white">
                              ₹{registration.payment?.amount || 0}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {registration.status === "PENDING" ? (
                              <Button 
                                size="sm"
                                onClick={() => handleCompletePayment(registration.id)}
                                disabled={isProcessingPayment}
                              >
                                {isProcessingPayment ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                  <CreditCard className="w-4 h-4 mr-1" />
                                )}
                                Complete Payment
                              </Button>
                            ) : (
                              <Button variant="secondary" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download Receipt
                              </Button>
                            )}
                            <Link href={`/sports/${registration.sport.slug}`}>
                              <Button variant="ghost" size="sm">
                                <FileText className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
