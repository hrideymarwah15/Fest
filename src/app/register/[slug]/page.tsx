"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { Button, Input, SearchableSelect, Card } from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  CreditCard,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import northIndiaColleges from "@/data/north_india_colleges.json";

interface Sport {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: "TEAM" | "INDIVIDUAL";
  minTeamSize: number;
  maxTeamSize: number;
  maxSlots: number;
  filledSlots: number;
  fee: number;
  eventDate: string | null;
  venue: string | null;
  registrationOpen: boolean;
}

// College interface is no longer needed from API for list, but maybe for type safety?
// Actually we will use the JSON list now.

interface TeamMember {
  name: string;
  email: string;
  phone: string;
}

export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const slug = params.slug as string;

  const [sport, setSport] = useState<Sport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    collegeId: "",
    customCollege: "",
    teamName: "",
    teamMembers: [] as TeamMember[],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // College options from JSON + Other
  const collegeOptions = [
    ...northIndiaColleges,
    { value: "other", label: "Other (College Not Listed)", state: "" },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/register/${slug}`);
    }
  }, [sessionStatus, router, slug]);

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        // We'll trust they update college if needed, or if stored in user profile used here
        // If user profile has collegeId that matches our list, great. 
        collegeId: session.user.collegeId || "",
      }));
    }
  }, [session]);

  // Fetch sport only (colleges from JSON now)
  useEffect(() => {
    async function fetchData() {
      try {
        const sportRes = await fetch(`/api/sports/${slug}`);

        if (!sportRes.ok) throw new Error("Sport not found");

        const sportData = await sportRes.json();
        setSport(sportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const totalSteps = sport?.type === "TEAM" ? 4 : 3;

  const steps = sport ? [
    { number: 1, title: "Personal Info", icon: User },
    ...(sport.type === "TEAM"
      ? [{ number: 2, title: "Team Details", icon: Users }]
      : []),
    { number: sport.type === "TEAM" ? 3 : 2, title: "Review", icon: CheckCircle },
    { number: sport.type === "TEAM" ? 4 : 3, title: "Payment", icon: CreditCard },
  ] : [];

  const validateStep = (step: number): boolean => {
    if (!sport) return false;
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      else if (!/^[6-9]\d{9}$/.test(formData.phone))
        newErrors.phone = "Invalid Indian mobile number (10 digits, starts with 6-9)";
      if (!formData.collegeId) newErrors.collegeId = "College is required";
    }

    if (step === 2 && sport.type === "TEAM") {
      if (!formData.teamName.trim()) newErrors.teamName = "Team name is required";
      if (formData.teamMembers.length < sport.minTeamSize - 1) {
        newErrors.teamMembers = `Minimum ${sport.minTeamSize} team members required (including you)`;
      }

      // Validate team members
      formData.teamMembers.forEach((member, index) => {
        if (!member.name.trim()) {
          newErrors[`teamMember_${index}_name`] = `Player ${index + 2} name is required`;
        } else if (member.name.trim().length < 2) {
          newErrors[`teamMember_${index}_name`] = `Player ${index + 2} name must be at least 2 characters`;
        }
        if (!member.email.trim()) {
          newErrors[`teamMember_${index}_email`] = `Player ${index + 2} email is required`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
          newErrors[`teamMember_${index}_email`] = `Invalid email for Player ${index + 2}`;
        }
        if (!member.phone.trim()) {
          newErrors[`teamMember_${index}_phone`] = `Player ${index + 2} phone is required`;
        } else if (!/^[6-9]\d{9}$/.test(member.phone)) {
          newErrors[`teamMember_${index}_phone`] = `Invalid phone for Player ${index + 2}`;
        }
      });
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addTeamMember = () => {
    if (sport && formData.teamMembers.length < sport.maxTeamSize - 1) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, { name: "", email: "", phone: "" }],
      });
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((_, i) => i !== index),
    });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...formData.teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, teamMembers: updated });
  };

  const handleSubmitRegistration = async (payImmediately: boolean = true) => {
    if (!sport || !session) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const registrationData: any = {
        sportId: sport.id,
        collegeId: formData.collegeId,
        customCollege: formData.customCollege,
        phone: formData.phone,
        payImmediately,
      };

      // Only add teamName and teamMembers for TEAM sports
      if (sport.type === "TEAM") {
        registrationData.teamName = formData.teamName;
        // Only include teamMembers if there are any
        if (formData.teamMembers.length > 0) {
          registrationData.teamMembers = formData.teamMembers;
        }
      }

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // If paying immediately, initialize Razorpay checkout
      if (payImmediately && data.orderId) {
        const options = {
          key: data.keyId,
          amount: data.amount * 100, // Convert to paise
          currency: data.currency,
          name: "Rishihood University Sports Fest",
          description: `Payment for ${sport.name}`,
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

              // Success - redirect to dashboard
              router.push("/dashboard?registration=success");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment verification failed");
              setIsSubmitting(false);
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
              setIsSubmitting(false);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Success - redirect to dashboard
        router.push("/dashboard?registration=success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading || sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Loading...</span>
        </div>
        <Footer />
      </main>
    );
  }

  // Sport not found
  if (!sport) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <h1 className="font-display text-4xl text-white mb-4">Sport Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || "This sport does not exist."}</p>
          <Link href="/sports">
            <Button variant="secondary">Back to Sports</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Registration closed
  if (!sport.registrationOpen) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 pb-16 text-center max-w-md mx-auto">
          <h1 className="font-display text-4xl text-white mb-4">Registration Closed</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Registration for {sport.name} is currently closed.
          </p>
          <Link href="/sports">
            <Button variant="secondary">Browse Other Sports</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Slots full
  if (sport.filledSlots >= sport.maxSlots) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 pb-16 text-center max-w-md mx-auto">
          <h1 className="font-display text-4xl text-white mb-4">Slots Full</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            All slots for {sport.name} have been filled.
          </p>
          <Link href="/sports">
            <Button variant="secondary">Browse Other Sports</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-white mb-2">
                PERSONAL INFORMATION
              </h2>
              <p className="text-[var(--text-secondary)]">
                Confirm your details for registration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={validationErrors.name}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={validationErrors.email}
                disabled
              />
              <Input
                label="Phone Number *"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={validationErrors.phone}
              />
              <SearchableSelect
                label="College/University *"
                options={collegeOptions}
                placeholder="Select your college"
                value={formData.collegeId}
                onChange={(value) => setFormData({ ...formData, collegeId: value })}
                error={validationErrors.collegeId}
                required
              />
              {formData.collegeId === "other" && (
                <Input
                  label="College Name"
                  placeholder="Enter your college name"
                  value={formData.customCollege}
                  onChange={(e) => setFormData({ ...formData, customCollege: e.target.value })}
                  required
                />
              )}
            </div>
          </motion.div>
        );

      case 2:
        if (sport.type !== "TEAM") return renderReviewStep();
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-white mb-2">
                TEAM DETAILS
              </h2>
              <p className="text-[var(--text-secondary)]">
                Add your team members. You need {sport.minTeamSize}-{sport.maxTeamSize}{" "}
                players including yourself.
              </p>
            </div>

            <Input
              label="Team Name *"
              placeholder="Enter your team name"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              error={validationErrors.teamName}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">
                  Team Members ({formData.teamMembers.length + 1}/{sport.maxTeamSize})
                </h3>
                {formData.teamMembers.length < sport.maxTeamSize - 1 && (
                  <Button variant="secondary" size="sm" onClick={addTeamMember}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </Button>
                )}
              </div>

              {/* Captain (current user) */}
              <div className="p-4 bg-[var(--accent-primary-dim)] rounded-xl border border-[var(--accent-primary)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{formData.name || "You"}</p>
                    <p className="text-[var(--text-muted)] text-sm">Team Captain</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {formData.teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Player {index + 2}</span>
                    <button
                      onClick={() => removeTeamMember(index)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                      error={validationErrors[`teamMember_${index}_name`]}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                      error={validationErrors[`teamMember_${index}_email`]}
                    />
                    <Input
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) => updateTeamMember(index, "phone", e.target.value)}
                      error={validationErrors[`teamMember_${index}_phone`]}
                    />
                  </div>
                </motion.div>
              ))}

              {validationErrors.teamMembers && (
                <p className="text-red-500 text-sm">{validationErrors.teamMembers}</p>
              )}
            </div>
          </motion.div>
        );

      case sport.type === "TEAM" ? 3 : 2:
        return renderReviewStep();

      case sport.type === "TEAM" ? 4 : 3:
        return (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-white mb-2">
                CONFIRM REGISTRATION
              </h2>
              <p className="text-[var(--text-secondary)]">
                Click below to complete your registration
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                {error}
              </div>
            )}

            <Card hover={false} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">Sport</span>
                  <span className="text-white font-medium">{sport.name}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
                  <span className="text-[var(--text-secondary)]">
                    Registration Type
                  </span>
                  <span className="text-white font-medium">
                    {sport.type === "TEAM" ? "Team" : "Individual"}
                  </span>
                </div>
                {sport.type === "TEAM" && (
                  <div className="flex items-center justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-[var(--text-secondary)]">Team Name</span>
                    <span className="text-white font-medium">{formData.teamName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-[var(--text-secondary)]">Amount</span>
                  <span className="text-3xl font-bold text-[var(--accent-primary)]">
                    ₹{sport.fee}
                  </span>
                </div>
              </div>
            </Card>

            <div className="bg-blue-300/10 rounded-xl p-4 border border-blue-300/30">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong className="text-blue-300">Note:</strong> You can choose to pay now or complete payment later from your dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => handleSubmitRegistration(true)}
                isLoading={isSubmitting}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay Now
              </Button>
              <Button
                size="lg"
                className="w-full"
                variant="secondary"
                onClick={() => handleSubmitRegistration(false)}
                disabled={isSubmitting}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Pay Later
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderReviewStep = () => (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-white mb-2">
          REVIEW YOUR DETAILS
        </h2>
        <p className="text-[var(--text-secondary)]">
          Please verify all information before proceeding.
        </p>
      </div>

      <Card hover={false} className="p-6">
        <h3 className="font-display text-xl text-white mb-4">
          PERSONAL INFORMATION
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-[var(--text-muted)] text-sm">Name</p>
            <p className="text-white">{formData.name}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-sm">Email</p>
            <p className="text-white">{formData.email}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-sm">Phone</p>
            <p className="text-white">{formData.phone}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-sm">College</p>
            <p className="text-white">
              {collegeOptions.find((c) => c.value === formData.collegeId)?.label || "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {sport.type === "TEAM" && (
        <Card hover={false} className="p-6">
          <h3 className="font-display text-xl text-white mb-4">TEAM DETAILS</h3>
          <div className="mb-4">
            <p className="text-[var(--text-muted)] text-sm">Team Name</p>
            <p className="text-white">{formData.teamName}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-sm mb-3">
              Team Members ({formData.teamMembers.length + 1})
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-[var(--accent-primary-dim)] rounded-lg">
                <div className="w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="text-white">{formData.name}</span>
                <span className="text-[var(--text-muted)] text-sm">(Captain)</span>
              </div>
              {formData.teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[var(--card-border)]/30 rounded-lg"
                >
                  <div className="w-6 h-6 bg-[var(--card-border)] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{index + 2}</span>
                  </div>
                  <span className="text-white">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card hover={false} className="p-6 bg-gradient-to-br from-[var(--accent-primary)]/20 to-transparent border-[var(--accent-primary)]/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-muted)] text-sm">Total Amount</p>
            <p className="text-white font-display text-2xl">
              {sport.name} Registration
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-white">₹{sport.fee}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href={`/sports/${slug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {sport.name}
              </Button>
            </Link>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number
                      ? "bg-[var(--accent-primary)] text-white"
                      : "bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--card-border)]"
                      }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-full h-1 mx-2 rounded ${currentStep > step.number
                        ? "bg-[var(--accent-primary)]"
                        : "bg-[var(--card-border)]"
                        }`}
                      style={{ width: "60px" }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {steps.map((step) => (
                <span
                  key={step.number}
                  className={`text-xs ${currentStep >= step.number
                    ? "text-white"
                    : "text-[var(--text-muted)]"
                    }`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <Card hover={false} className="p-8">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--card-border)]">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {currentStep < totalSteps && (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
