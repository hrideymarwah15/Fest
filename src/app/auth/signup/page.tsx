"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { Mail, Lock, User, Users, Phone, ArrowRight, Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    college: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // First, register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            gender: formData.gender,
            college: formData.college,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user && !authData.session) {
        // Email confirmation required
        setMessage("Check your email for the confirmation link!");
      } else if (authData.session) {
        // User is immediately signed in (email confirmation disabled in Supabase)
        // Sync user to our database
        await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: authData.user!.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            gender: formData.gender,
            college: formData.college,
          }),
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
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

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
              {message}
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

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Gender *
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full !pl-14 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] appearance-none"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="MEN">Male</option>
                  <option value="WOMEN">Female</option>
                  <option value="MIXED">Other</option>
                </select>
              </div>
            </div>

            <Input
              label="College/University Name"
              placeholder="Enter your college name"
              value={formData.college}
              onChange={(e) =>
                setFormData({ ...formData, college: e.target.value })
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password (min 8 chars)"
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
              <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border border-[var(--input-border)] bg-transparent checked:bg-[var(--accent-primary)] checked:border-[var(--accent-primary)] cursor-pointer"
                />
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
              </label>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--card-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--card-bg)] text-[var(--text-muted)]">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Sign up with Google
          </Button>

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
