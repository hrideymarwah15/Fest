/**
 * Environment configuration with validation
 * Ensures all required environment variables are present
 */

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    cspReportUri: process.env.CSP_REPORT_URI,
  },
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },
} as const;

/**
 * Validates that all required environment variables are present
 * Throws error if any are missing
 */
export function validateConfig() {
  const errors: string[] = [];

  if (!config.database.url) {
    errors.push("DATABASE_URL is required");
  }

  if (!config.auth.nextAuthSecret) {
    errors.push("NEXTAUTH_SECRET is required");
  }

  if (!config.auth.google.clientId || !config.auth.google.clientSecret) {
    errors.push("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  }

  if (config.app.isProduction) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      errors.push("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in production");
    }

    if (!config.razorpay.webhookSecret) {
      errors.push("RAZORPAY_WEBHOOK_SECRET is required in production");
    }

    if (!config.security.cspReportUri) {
      console.warn("⚠️  CSP_REPORT_URI is not set - CSP violations will not be reported");
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${errors.join("\n")}`
    );
  }
}

// Validate config on import (will fail at build time if missing)
if (typeof window === "undefined") {
  // Only validate on server-side
  try {
    validateConfig();
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Configuration Error:", error.message);
    }
    if (config.app.isProduction) {
      throw error; // Fail hard in production
    }
  }
}
