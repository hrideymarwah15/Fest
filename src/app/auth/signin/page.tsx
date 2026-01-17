"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { Mail, Lock, ArrowRight, Chrome } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error || "An error occurred. Please try again.");
      } else {
        // Get session to check user role
        const session = await getSession();
        const redirectUrl = session?.user?.role === "ADMIN" ? "/admin" : callbackUrl;
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <Card hover={false} className="p-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-white mb-2">SIGN IN</h1>
        <p className="text-[var(--text-secondary)]">
          Welcome back! Sign in to continue.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--text-secondary)]">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--card-border)] bg-[var(--card-bg)]"
            />
            Remember me
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-[var(--accent-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="relative my-8">
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
        Sign in with Google
      </Button>

      <p className="mt-8 text-center text-[var(--text-secondary)]">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-[var(--accent-primary)] hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </Card>
  );
}

function SignInFormFallback() {
  return (
    <Card hover={false} className="p-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-white mb-2">SIGN IN</h1>
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-10" />

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

        <Suspense fallback={<SignInFormFallback />}>
          <SignInForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
