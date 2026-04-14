export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  businessName: string;
  businessLogo: string | null;
  username: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required: boolean;
  options?: string[];
}

export interface ReviewFormData {
  id: string;
  title: string;
  description: string | null;
  logo: string | null;
  thankYouMessage: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  customFields: CustomField[];
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count?: { reviews: number };
}

export interface ReviewData {
  id: string;
  fullName: string;
  companyName: string | null;
  profileImage: string | null;
  referenceImages: string | null;
  email: string;
  country: string;
  rating: number;
  message: string;
  customFieldData: string | null;
  isApproved: boolean;
  isRead: boolean;
  likes: number;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  form?: {
    title: string;
    slug: string;
    user?: {
      businessName: string;
      businessLogo: string | null;
    };
  };
}
