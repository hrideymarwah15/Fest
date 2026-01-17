import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rishihood Sports Fest 2026 | Register Now",
  description:
    "The biggest inter-college sports championship in Delhi NCR. Compete, conquer, and claim glory across 15+ sports at Rishihood University.",
  keywords: [
    "sports fest",
    "college sports",
    "rishihood university",
    "delhi ncr sports",
    "inter-college competition",
  ],
  openGraph: {
    title: "Rishihood Sports Fest 2026",
    description: "The biggest inter-college sports championship in Delhi NCR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
