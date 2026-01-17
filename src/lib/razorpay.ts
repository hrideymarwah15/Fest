import Razorpay from "razorpay";
import crypto from "crypto";

// Lazy initialization to avoid build-time errors when env vars are missing
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
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

  const secret = process.env.RAZORPAY_KEY_SECRET;
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

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
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
