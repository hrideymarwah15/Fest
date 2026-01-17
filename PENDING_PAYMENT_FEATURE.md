# Pending Payment Feature

## Overview

This feature allows users to register for sports without immediate payment and complete the payment later from their dashboard. This provides flexibility for users who may not have payment methods ready at registration time.

## Changes Made

### 1. Database Schema Updates

The existing schema already supports pending payments:
- `Registration` model has a `status` field with `PENDING` status
- `Payment` model has a `status` field with `PENDING` status
- No schema changes were required

### 2. API Endpoints

#### New Endpoint: `/api/payments/complete-pending`
- **Purpose**: Creates a Razorpay order for completing a pending payment
- **Method**: POST
- **Request Body**: `{ registrationId: string }`
- **Response**: Returns Razorpay order details for payment processing
- **Location**: `src/app/api/payments/complete-pending/route.ts`

#### Updated Endpoint: `/api/registrations`
- **Changes**: Added support for `payImmediately` parameter (default: true)
- **Behavior**: 
  - If `payImmediately: true`: Creates Razorpay order immediately (existing behavior)
  - If `payImmediately: false`: Creates registration with pending payment status
- **Location**: `src/app/api/registrations/route.ts`

### 3. Frontend Updates

#### Registration Page (`src/app/register/[slug]/page.tsx`)
- **Changes**: Added payment option buttons
- **New UI**: Two buttons at the payment step:
  - "Pay Now" - Initiates Razorpay checkout immediately
  - "Pay Later" - Completes registration without payment
- **Behavior**: 
  - Pay Now: Opens Razorpay checkout modal
  - Pay Later: Redirects to dashboard with success message

#### Dashboard Page (`src/app/dashboard/page.tsx`)
- **Changes**: Enhanced pending payment display and functionality
- **New Features**:
  - Shows "Pending Payment" badge for registrations with pending status
  - Displays status message explaining the payment status
  - "Complete Payment" button for pending registrations
  - Payment completion flow with Razorpay integration
- **Location**: `src/app/dashboard/page.tsx`

#### Layout (`src/app/layout.tsx`)
- **Changes**: Added Razorpay script to HTML head
- **Purpose**: Loads Razorpay checkout.js for payment processing

### 4. Security Updates

#### Security Schema (`src/lib/security.ts`)
- **Changes**: Added `payImmediately` field to registration schema
- **Default**: `true` for backward compatibility

## User Flow

### Registration Flow

1. User selects a sport and fills in registration details
2. At payment step, user chooses:
   - **Pay Now**: Opens Razorpay checkout, completes payment, confirms registration
   - **Pay Later**: Registration is created with pending status, user redirected to dashboard
3. Registration is created with appropriate status

### Dashboard Flow

1. User views dashboard showing all registrations
2. Pending registrations display:
   - "Pending Payment" badge (amber/orange)
   - Status message explaining payment is pending
   - "Complete Payment" button
3. Clicking "Complete Payment":
   - Creates Razorpay order via `/api/payments/complete-pending`
   - Opens Razorpay checkout modal
   - On successful payment, verifies and updates status
   - Refreshes dashboard to show confirmed status

## Technical Details

### Payment Status Handling

- **PENDING**: Registration created, payment not completed
- **SUCCESS**: Payment completed, registration confirmed
- **FAILED**: Payment failed (can retry via dashboard)

### Slot Management

- Slots are reserved immediately upon registration creation
- This prevents double-booking even if payment is pending
- Registration status determines if slot is confirmed

### Security Considerations

- All API endpoints require authentication
- Registration ownership is verified before payment operations
- Razorpay signature verification ensures payment authenticity
- Idempotent payment processing prevents duplicate charges

## Testing

To test the pending payment flow:

1. Register for a sport and select "Pay Later"
2. Visit dashboard to see pending registration
3. Click "Complete Payment" on the pending registration
4. Complete Razorpay checkout
5. Verify registration status changes to "CONFIRMED"

## Future Enhancements

- Payment reminders for pending registrations
- Automatic cancellation after payment deadline
- Partial payment support
- Payment history and receipts
