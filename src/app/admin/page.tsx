"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Card, Badge, Modal } from "@/components/ui";
import {
  Users,
  Trophy,
  DollarSign,
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Building,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";

interface Stats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingPayments: number;
  totalRevenue: number;
  totalColleges: number;
  totalSports: number;
  sportStats: SportStat[];
  collegeStats: CollegeStat[];
}

interface SportStat {
  id: string;
  name: string;
  type: string;
  maxSlots: number;
  filledSlots: number;
  fee: number;
  registrationOpen: boolean;
  revenue: number;
}

interface CollegeStat {
  id: string;
  name: string;
  _count: { registrations: number };
}

interface Registration {
  id: string;
  teamName: string | null;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
  sport: { name: string; type: string; fee: number };
  college: { name: string; code: string } | null;
  payment: { amount: number; status: string; razorpayPaymentId: string | null } | null;
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "sports" | "colleges">("registrations");
  const [stats, setStats] = useState<Stats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSport, setFilterSport] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Check admin access
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }
    if (session.user?.role !== "ADMIN" && session.user?.email !== "admin@sportsfest.com") {
      router.push("/dashboard");
    }
  }, [session, sessionStatus, router]);

  // Fetch stats
  useEffect(() => {
    async function fetchData() {
      if (sessionStatus !== "authenticated" || session?.user?.role !== "ADMIN") return;

      try {
        const [statsRes, registrationsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/registrations"),
        ]);

        if (!statsRes.ok || !registrationsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [statsData, registrationsData] = await Promise.all([
          statsRes.json(),
          registrationsRes.json(),
        ]);

        setStats(statsData);
        setRegistrations(registrationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [session, sessionStatus]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/admin/export?format=csv");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${Date.now()}.csv`;
      a.click();
    } catch (err) {
      alert("Failed to export CSV");
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedRegistration) return;

    // Optimistic UI update or loading state could be added here
    if (!window.confirm(`Confirm payment of ₹${selectedRegistration.sport.fee} for ${selectedRegistration.user.name}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          amount: selectedRegistration.sport.fee,
          paymentMethod: "CASH",
          notes: "Confirmed manually via Admin Dashboard"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to confirm payment");
      }

      // Success
      alert("Payment confirmed successfully!");
      setSelectedRegistration(null);

      // Refresh data
      const [statsRes, registrationsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/registrations"),
      ]);

      if (statsRes.ok && registrationsRes.ok) {
        const [statsData, registrationsData] = await Promise.all([
          statsRes.json(),
          registrationsRes.json(),
        ]);
        setStats(statsData);
        setRegistrations(registrationsData);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleToggleSport = async (sportId: string, currentState: boolean) => {
    try {
      const res = await fetch("/api/admin/sports/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sportId, registrationOpen: !currentState }),
      });

      if (!res.ok) throw new Error("Failed to toggle");

      // Refresh stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      alert("Failed to toggle registration status");
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.college?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = filterSport === "all" || reg.sport.name === filterSport;
    const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
    return matchesSearch && matchesSport && matchesStatus;
  });

  if (sessionStatus === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Loading admin dashboard...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </main>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Total Registrations</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats?.totalRegistrations || 0}
              </p>
              <p className="text-blue-400 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Live data
              </p>
            </div>
            <div className="w-14 h-14 bg-[var(--accent-primary-dim)] rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-[var(--accent-primary)]" />
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Confirmed</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats?.confirmedRegistrations || 0}
              </p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                {stats?.pendingPayments || 0} pending payments
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Total Revenue</p>
              <p className="text-4xl font-bold text-white mt-1">
                ₹{(stats?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-blue-400 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Live data
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-300/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-blue-300" />
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Active Sports</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats?.totalSports || 0}
              </p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                {stats?.sportStats?.filter((s) => s.registrationOpen).length || 0} open for registration
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Colleges Participating</p>
              <p className="text-4xl font-bold text-white mt-1">
                {stats?.totalColleges || 0}
              </p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                From Delhi NCR region
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Building className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-sm">Event Date</p>
              <p className="text-2xl font-bold text-white mt-1">Feb 14-18</p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">2026</p>
            </div>
            <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sports Performance */}
        <Card hover={false} className="p-6">
          <h3 className="font-display text-xl text-white mb-6">
            SPORTS PERFORMANCE
          </h3>
          <div className="space-y-4">
            {stats?.sportStats?.map((sport) => (
              <div key={sport.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">{sport.name}</span>
                  <span className="text-[var(--accent-primary)]">
                    {sport.filledSlots}/{sport.maxSlots}
                  </span>
                </div>
                <div className="h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                    style={{
                      width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Colleges */}
        <Card hover={false} className="p-6">
          <h3 className="font-display text-xl text-white mb-6">
            TOP COLLEGES
          </h3>
          <div className="space-y-4">
            {stats?.collegeStats?.slice(0, 5).map((college, index) => (
              <div
                key={college.id}
                className="flex items-center justify-between p-3 bg-[var(--background)] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-gray-400"
                        : index === 2
                          ? "bg-blue-700"
                          : "bg-[var(--card-border)]"
                      }`}
                  >
                    <span className="text-white text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{college.name}</p>
                    <p className="text-[var(--text-muted)] text-sm">
                      {college._count.registrations} registrations
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Sports</option>
            {stats?.sportStats?.map((sport) => (
              <option key={sport.id} value={sport.name}>
                {sport.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-[var(--background)]/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{reg.user.name || "N/A"}</p>
                      <p className="text-[var(--text-muted)] text-sm">{reg.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {reg.college?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-white">{reg.sport.name}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {reg.teamName || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        reg.status === "CONFIRMED"
                          ? "success"
                          : reg.status === "PENDING"
                            ? "warning"
                            : "error"
                      }
                    >
                      {reg.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    ₹{reg.payment?.amount || reg.sport.fee}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Registration Detail Modal */}
      <Modal
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        title="Registration Details"
        size="lg"
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Participant</p>
                <p className="text-white font-medium">
                  {selectedRegistration.user.name}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Email</p>
                <p className="text-white">{selectedRegistration.user.email}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">College</p>
                <p className="text-white">{selectedRegistration.college?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Sport</p>
                <p className="text-white">{selectedRegistration.sport.name}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Team Name</p>
                <p className="text-white">
                  {selectedRegistration.teamName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Status</p>
                <Badge
                  variant={
                    selectedRegistration.status === "CONFIRMED"
                      ? "success"
                      : selectedRegistration.status === "PENDING"
                        ? "warning"
                        : "error"
                  }
                >
                  {selectedRegistration.status}
                </Badge>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Amount</p>
                <p className="text-white font-bold">
                  ₹{selectedRegistration.payment?.amount || selectedRegistration.sport.fee}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Date</p>
                <p className="text-white">
                  {new Date(selectedRegistration.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedRegistration.status === "PENDING" && (
              <div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
                <Button
                  onClick={handleManualConfirm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Payment (Cash)
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

  const renderSports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-white">MANAGE SPORTS</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stats?.sportStats?.map((sport) => (
          <Card key={sport.id} hover={false} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-xl text-white">{sport.name}</h3>
                <Badge variant={sport.type === "TEAM" ? "team" : "individual"}>
                  {sport.type}
                </Badge>
              </div>
              <button
                onClick={() => handleToggleSport(sport.id, sport.registrationOpen)}
                className={`p-2 rounded-lg transition-colors ${sport.registrationOpen
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-red-500/20 text-red-400"
                  }`}
              >
                {sport.registrationOpen ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Slots</p>
                <p className="text-white font-medium">
                  {sport.filledSlots}/{sport.maxSlots}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Fee</p>
                <p className="text-white font-medium">₹{sport.fee}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Revenue</p>
                <p className="text-[var(--accent-primary)] font-bold">
                  ₹{sport.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm">Status</p>
                <Badge variant={sport.registrationOpen ? "success" : "error"}>
                  {sport.registrationOpen ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>

            <div className="h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] rounded-full"
                style={{
                  width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderColleges = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-white">COLLEGE STATISTICS</h2>
        <Button variant="secondary" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Registrations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {stats?.collegeStats?.map((college, index) => (
                <tr key={college.id} className="hover:bg-[var(--background)]/50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : index === 2
                            ? "bg-blue-700"
                            : "bg-[var(--card-border)]"
                        }`}
                    >
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {college.name}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {college._count.registrations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
              ADMIN DASHBOARD
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage registrations, sports, and view analytics
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2"
          >
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "registrations", label: "Registrations", icon: Users },
              { id: "sports", label: "Sports", icon: Trophy },
              { id: "colleges", label: "Colleges", icon: Building },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-white border border-[var(--card-border)]"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "registrations" && renderRegistrations()}
            {activeTab === "sports" && renderSports()}
            {activeTab === "colleges" && renderColleges()}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
