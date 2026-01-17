import { db } from "./db";

/**
 * Logs critical transactions for auditing and debugging
 */
export async function logTransaction(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  metadata?: Record<string, any>,
  status: "SUCCESS" | "FAILED" = "SUCCESS"
) {
  try {
    await db.transactionLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        metadata: metadata || {},
        status,
      },
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("Failed to log transaction:", error);
  }
}

/**
 * Transaction types
 */
export type TransactionAction =
  | "REGISTRATION_CREATED"
  | "REGISTRATION_CONFIRMED"
  | "REGISTRATION_CANCELLED"
  | "PAYMENT_CREATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "SPORT_CREATED"
  | "SPORT_UPDATED"
  | "SPORT_DELETED"
  | "SLOT_RESERVED"
  | "SLOT_RELEASED";

/**
 * Entity types
 */
export type EntityType =
  | "REGISTRATION"
  | "PAYMENT"
  | "SPORT"
  | "USER"
  | "COLLEGE";