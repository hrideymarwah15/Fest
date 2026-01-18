import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "@/lib/config";

// Lazy initialization to avoid build-time errors when env vars are missing
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
}

/**
 * Verifies Razorpay signature for frontend payment callbacks.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = config.razorpay.keySecret;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET not configured");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay webhook signature.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  if (!body || !signature) {
    return false;
  }

  const secret = config.razorpay.webhookSecret;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

/**
 * Creates a Razorpay order for payment.
 * Amount is in rupees, converted to paise internally.
 */
export async function createRazorpayOrder(options: CreateOrderOptions) {
  const razorpay = getRazorpay();
  const { amount, currency = "INR", receipt, notes } = options;

  const order = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency,
    receipt,
    notes,
  });

  return order;
}

/**
 * Fetches order details from Razorpay.
 * Useful for validating order status.
 */
export async function fetchRazorpayOrder(orderId: string) {
  const razorpay = getRazorpay();
  return razorpay.orders.fetch(orderId);
}

/**
 * Fetches payment details from Razorpay.
 * Useful for verifying payment status server-side.
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const razorpay = getRazorpay();
  return razorpay.payments.fetch(paymentId);
}
