"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Button, Card, Badge, Modal, Input, Select } from "@/components/ui";
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
  Plus,
  Edit,
  Trash2,
  Save,
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

interface SportForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  type: "INDIVIDUAL" | "TEAM";
  minTeamSize: number;
  maxTeamSize: number;
  maxSlots: number;
  fee: number;
  venue: string;
  registrationOpen: boolean;
}

interface CollegeForm {
  id?: string;
  name: string;
  code: string;
  address: string;
}

const emptySportForm: SportForm = {
  name: "",
  slug: "",
  description: "",
  type: "INDIVIDUAL",
  minTeamSize: 1,
  maxTeamSize: 1,
  maxSlots: 50,
  fee: 500,
  venue: "",
  registrationOpen: true,
};

const emptyCollegeForm: CollegeForm = {
  name: "",
  code: "",
  address: "",
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "PARTICIPANT";
  college: { name: string } | null;
  createdAt: string;
  _count: { registrations: number };
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "sports" | "colleges" | "users">("registrations");
  const [stats, setStats] = useState<Stats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSport, setFilterSport] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Sport CRUD state
  const [showSportModal, setShowSportModal] = useState(false);
  const [sportForm, setSportForm] = useState<SportForm>(emptySportForm);
  const [isSavingSport, setIsSavingSport] = useState(false);

  // College CRUD state
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [collegeForm, setCollegeForm] = useState<CollegeForm>(emptyCollegeForm);
  const [isSavingCollege, setIsSavingCollege] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "sport" | "college"; id: string; name: string } | null>(null);

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

  // Fetch stats and data
  useEffect(() => {
    async function fetchData() {
      if (sessionStatus !== "authenticated" || session?.user?.role !== "ADMIN") return;

      try {
        const [statsRes, registrationsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/registrations"),
          fetch("/api/admin/users"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (registrationsRes.ok) {
          const registrationsData = await registrationsRes.json();
          setRegistrations(registrationsData);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [session, sessionStatus]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to export CSV");
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedRegistration) return;

    try {
      const res = await fetch("/api/admin/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: selectedRegistration.id }),
      });

      if (!res.ok) throw new Error("Failed to confirm payment");

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

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "PARTICIPANT") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to inform role update");
      }

      // Refresh users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) setUsers(await usersRes.json());

      alert(`User role updated to ${newRole}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
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

  // Save sport (create or update)
  const handleSaveSport = async () => {
    setIsSavingSport(true);
    try {
      const isEdit = !!sportForm.id;
      const url = isEdit ? `/api/admin/sports/${sportForm.id}` : "/api/admin/sports";
      const method = isEdit ? "PATCH" : "POST";

      // Generate slug from name if not provided
      const slug = sportForm.slug || sportForm.name.toLowerCase().replace(/\s+/g, "-");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sportForm, slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save sport");
      }

      // Refresh stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      setShowSportModal(false);
      setSportForm(emptySportForm);
      alert(isEdit ? "Sport updated successfully!" : "Sport created successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save sport");
    } finally {
      setIsSavingSport(false);
    }
  };

  // Delete sport
  const handleDeleteSport = async (sportId: string) => {
    try {
      const res = await fetch(`/api/admin/sports/${sportId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sport");

      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      setDeleteConfirm(null);
      alert("Sport deleted successfully!");
    } catch (err) {
      alert("Failed to delete sport");
    }
  };

  // Save college (create or update)
  const handleSaveCollege = async () => {
    setIsSavingCollege(true);
    try {
      const isEdit = !!collegeForm.id;
      const url = isEdit ? `/api/admin/colleges/${collegeForm.id}` : "/api/admin/colleges";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collegeForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save college");
      }

      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      setShowCollegeModal(false);
      setCollegeForm(emptyCollegeForm);
      alert(isEdit ? "College updated successfully!" : "College created successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save college");
    } finally {
      setIsSavingCollege(false);
    }
  };

  // Delete college
  const handleDeleteCollege = async (collegeId: string) => {
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete college");

      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      setDeleteConfirm(null);
      alert("College deleted successfully!");
    } catch (err) {
      alert("Failed to delete college");
    }
  };

  // Cancel registration
  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;

    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to cancel registration");

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

      setSelectedRegistration(null);
      alert("Registration cancelled successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel registration");
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
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
                <Button
                  variant="secondary"
                  onClick={() => handleCancelRegistration(selectedRegistration.id)}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Registration
                </Button>
                <Button
                  onClick={handleManualConfirm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Payment (Cash)
                </Button>
              </div>
            )}
            {selectedRegistration.status === "CONFIRMED" && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
                <Button
                  variant="secondary"
                  onClick={() => handleCancelRegistration(selectedRegistration.id)}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Registration
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
        <Button
          onClick={() => {
            setSportForm(emptySportForm);
            setShowSportModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sport
        </Button>
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSportForm({
                      id: sport.id,
                      name: sport.name,
                      slug: sport.name.toLowerCase().replace(/\s+/g, "-"),
                      description: "",
                      type: sport.type as "INDIVIDUAL" | "TEAM",
                      minTeamSize: 1,
                      maxTeamSize: sport.type === "TEAM" ? 10 : 1,
                      maxSlots: sport.maxSlots,
                      fee: sport.fee,
                      venue: "",
                      registrationOpen: sport.registrationOpen,
                    });
                    setShowSportModal(true);
                  }}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ type: "sport", id: sport.id, name: sport.name })}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleSport(sport.id, sport.registrationOpen)}
                  className={`p-2 rounded-lg transition-colors ${sport.registrationOpen
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                    }`}
                >
                  {sport.registrationOpen ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
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

      {/* Sport Modal */}
      <Modal
        isOpen={showSportModal}
        onClose={() => {
          setShowSportModal(false);
          setSportForm(emptySportForm);
        }}
        title={sportForm.id ? "Edit Sport" : "Add New Sport"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Name *</label>
            <input
              type="text"
              value={sportForm.name}
              onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="e.g., Cricket"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Description</label>
            <textarea
              value={sportForm.description}
              onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              rows={3}
              placeholder="Describe the sport..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Type *</label>
              <select
                value={sportForm.type}
                onChange={(e) => setSportForm({ ...sportForm, type: e.target.value as "INDIVIDUAL" | "TEAM" })}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Registration Fee (₹) *</label>
              <input
                type="number"
                value={sportForm.fee}
                onChange={(e) => setSportForm({ ...sportForm, fee: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Max Slots *</label>
              <input
                type="number"
                value={sportForm.maxSlots}
                onChange={(e) => setSportForm({ ...sportForm, maxSlots: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Venue</label>
              <input
                type="text"
                value={sportForm.venue}
                onChange={(e) => setSportForm({ ...sportForm, venue: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                placeholder="e.g., Main Ground"
              />
            </div>
          </div>
          {sportForm.type === "TEAM" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">Min Team Size</label>
                <input
                  type="number"
                  value={sportForm.minTeamSize}
                  onChange={(e) => setSportForm({ ...sportForm, minTeamSize: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">Max Team Size</label>
                <input
                  type="number"
                  value={sportForm.maxTeamSize}
                  onChange={(e) => setSportForm({ ...sportForm, maxTeamSize: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="registrationOpen"
              checked={sportForm.registrationOpen}
              onChange={(e) => setSportForm({ ...sportForm, registrationOpen: e.target.checked })}
              className="w-5 h-5 rounded border-[var(--card-border)]"
            />
            <label htmlFor="registrationOpen" className="text-white">Registration Open</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
            <Button variant="secondary" onClick={() => setShowSportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSport} disabled={isSavingSport || !sportForm.name}>
              {isSavingSport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {sportForm.id ? "Update Sport" : "Create Sport"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm && deleteConfirm.type === "sport"}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <strong className="text-white">{deleteConfirm?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => deleteConfirm && handleDeleteSport(deleteConfirm.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderColleges = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-white">COLLEGE STATISTICS</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setCollegeForm(emptyCollegeForm);
              setShowCollegeModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add College
          </Button>
        </div>
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
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {stats?.collegeStats?.map((college, index) => (
                <tr key={college.id} className="hover:bg-[var(--background)]/50 group">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCollegeForm({
                            id: college.id,
                            name: college.name,
                            code: "",
                            address: "",
                          });
                          setShowCollegeModal(true);
                        }}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "college", id: college.id, name: college.name })}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* College Modal */}
      <Modal
        isOpen={showCollegeModal}
        onClose={() => {
          setShowCollegeModal(false);
          setCollegeForm(emptyCollegeForm);
        }}
        title={collegeForm.id ? "Edit College" : "Add New College"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Name *</label>
            <input
              type="text"
              value={collegeForm.name}
              onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="e.g., Delhi University"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Code *</label>
            <input
              type="text"
              value={collegeForm.code}
              onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="e.g., DU"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Address</label>
            <textarea
              value={collegeForm.address}
              onChange={(e) => setCollegeForm({ ...collegeForm, address: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              rows={3}
              placeholder="College address..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
            <Button variant="secondary" onClick={() => setShowCollegeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCollege} disabled={isSavingCollege || !collegeForm.name || !collegeForm.code}>
              {isSavingCollege ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {collegeForm.id ? "Update College" : "Create College"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal (Shared) */}
      <Modal
        isOpen={!!deleteConfirm && deleteConfirm.type === "college"}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to delete <strong className="text-white">{deleteConfirm?.name}</strong>?
            This will also delete related registrations.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => deleteConfirm && handleDeleteCollege(deleteConfirm.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  /* Users Tab */
  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl text-white">USER MANAGEMENT</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] w-64"
          />
        </div>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {users
                .filter(u =>
                  u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--background)]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center mr-3">
                          <span className="text-[var(--accent-primary)] font-bold">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name || "User"}</p>
                          <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === "ADMIN" ? "team" : "individual"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {user.college?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {user._count.registrations}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role === "PARTICIPANT" ? (
                        <Button
                          variant="secondary"
                          className="text-xs py-1 h-auto"
                          onClick={() => handleRoleChange(user.id, "ADMIN")}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        user.email !== "admin@sportsfest.com" && (
                          <Button
                            variant="secondary"
                            className="text-xs py-1 h-auto bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                            onClick={() => handleRoleChange(user.id, "PARTICIPANT")}
                          >
                            Revoke Admin
                          </Button>
                        )
                      )}
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
              Manage registrations, sports, users, and view analytics
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
              { id: "users", label: "Users", icon: Users },
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
            {activeTab === "users" && renderUsers()}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
