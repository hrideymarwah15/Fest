export interface Sport {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string[] | { [key: string]: any };
  type: "INDIVIDUAL" | "TEAM";
  minTeamSize: number;
  maxTeamSize: number;
  maxSlots: number;
  filledSlots: number;
  fee: number;
  image?: string;
  icon?: string;
  isActive: boolean;
  registrationOpen: boolean;
  eventDate?: Date;
  venue?: string;
}

export interface Registration {
  id: string;
  userId: string;
  sportId: string;
  collegeId: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITLISTED";
  paymentId?: string;
  createdAt: Date;
  sport?: Sport;
  college?: College;
  payment?: Payment;
}

export interface TeamMember {
  name: string;
  email: string;
  phone?: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  logoUrl?: string | null;
  createdAt?: Date;
}

export interface Payment {
  id: string;
  registrationId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  receiptUrl?: string;
  createdAt: Date;
}

export interface RegistrationFormData {
  sportId: string;
  collegeId: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  phone: string;
}
