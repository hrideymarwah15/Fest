"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, SearchableSelect, Card } from "@/components/ui";
import { Mail, Lock, User, Phone, ArrowRight, Chrome } from "lucide-react";
import { signIn } from "next-auth/react";
import northIndiaColleges from "@/data/north_india_colleges.json";

// Add "Other" option manually
const colleges = [
  ...northIndiaColleges,
  { value: "other", label: "Other (College Not Listed)", state: "" },
];

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      // Sign in after successful registration
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: "/dashboard",
      });
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 py-20">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center">
            <span className="font-display text-2xl text-white">R</span>
          </div>
          <div>
            <span className="font-display text-2xl text-white block">
              RISHIHOOD
            </span>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
              Sports Fest 2026
            </span>
          </div>
        </Link>

        <Card hover={false} className="p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-white mb-2">
              CREATE ACCOUNT
            </h1>
            <p className="text-[var(--text-secondary)]">
              Join Sports Fest 2026 today!
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              icon={<Phone className="w-5 h-5" />}
              required
            />

            <SearchableSelect
              label="College/University"
              options={colleges}
              placeholder="Select your college"
              value={formData.college}
              onChange={(value) =>
                setFormData({ ...formData, college: value })
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded border-[var(--card-border)] bg-[var(--card-bg)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-[var(--accent-primary)] hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--accent-primary)] hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>



          <p className="mt-6 text-center text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-[var(--accent-primary)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
