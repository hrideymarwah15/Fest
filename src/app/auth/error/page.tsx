"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { AlertCircle, ArrowLeft } from "lucide-react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get("message") || "An authentication error occurred";

    return (
        <Card hover={false} className="p-8 max-w-md w-full">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="font-display text-2xl text-white mb-2">
                    Authentication Error
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                    {errorMessage}
                </p>
                <div className="flex flex-col gap-3">
                    <Link href="/auth/signin">
                        <Button className="w-full">
                            Try Again
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}

export default function AuthErrorPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="absolute inset-0 grid-bg" />
            <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-red-500 rounded-full blur-[300px] opacity-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
            >
                <Suspense fallback={
                    <Card hover={false} className="p-8 max-w-md w-full">
                        <div className="text-center">
                            <h1 className="font-display text-2xl text-white mb-2">Loading...</h1>
                        </div>
                    </Card>
                }>
                    <ErrorContent />
                </Suspense>
            </motion.div>
        </main>
    );
}
