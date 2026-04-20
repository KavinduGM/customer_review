"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiStar, FiUpload, FiCheck } from "react-icons/fi";
import {
  MdSentimentVerySatisfied,
  MdSentimentSatisfied,
  MdSentimentNeutral,
  MdSentimentDissatisfied,
  MdSentimentVeryDissatisfied,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { uploadFile } from "@/lib/upload-client";

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required: boolean;
  options?: string[];
}

interface FormData {
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
  user: {
    businessName: string;
    businessLogo: string | null;
  };
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
  "India", "Japan", "Brazil", "Mexico", "Spain", "Italy", "Netherlands",
  "Sweden", "Switzerland", "Singapore", "South Korea", "New Zealand",
  "Sri Lanka", "United Arab Emirates", "Other",
];

export default function ReviewFormClient({ form }: { form: FormData }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [data, setData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    country: "",
    rating: 0,
    message: "",
    profileImage: "",
    referenceImages: [] as string[],
    customFieldData: {} as Record<string, string>,
  });

  const handleProfileImage = async (file: File) => {
    try {
      const url = await uploadFile(file);
      setData((d) => ({ ...d, profileImage: url }));
    } catch (e) {
      toast.error((e as Error).message || "Could not upload photo");
    }
  };

  const handleReferenceImages = async (files: FileList) => {
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadFile(file));
      }
      setData((d) => ({ ...d, referenceImages: [...d.referenceImages, ...uploaded] }));
    } catch (e) {
      toast.error((e as Error).message || "Could not upload reference image");
    }
  };

  // Professional 2D sentiment icons instead of emoji. One icon per rating,
  // paired with a short label and a dedicated colour for stronger feedback.
  const ratingMeta: Record<number, { label: string; Icon: IconType; color: string }> = {
    5: { label: "Excellent", Icon: MdSentimentVerySatisfied, color: "#16A34A" },
    4: { label: "Great", Icon: MdSentimentSatisfied, color: "#65A30D" },
    3: { label: "Good", Icon: MdSentimentNeutral, color: "#CA8A04" },
    2: { label: "Fair", Icon: MdSentimentDissatisfied, color: "#EA580C" },
    1: { label: "Poor", Icon: MdSentimentVeryDissatisfied, color: "#DC2626" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.fullName || !data.email || !data.country || !data.rating || !data.message) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSlug: form.slug,
          ...data,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: form.backgroundColor }}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-scaleIn">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ backgroundColor: `${form.primaryColor}15` }}>
            <FiCheck className="w-10 h-10" style={{ color: form.primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Review Submitted!</h2>
          <p className="text-gray-500 leading-relaxed">{form.thankYouMessage}</p>
          {form.logo && (
            <img src={form.logo} alt="" className="h-8 mx-auto mt-8 opacity-50" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: form.backgroundColor }}>
      <div className="max-w-2xl mx-auto">
        {/* Header — solid primary colour, no gradient */}
        <div
          className="rounded-t-3xl px-8 py-10 text-center"
          style={{ backgroundColor: form.primaryColor }}
        >
          {(form.logo || form.user.businessLogo) && (
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm">
              <img
                src={form.logo || form.user.businessLogo || ""}
                alt={form.user.businessName}
                className="max-h-12 max-w-12 object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{form.title}</h1>
          {form.description && (
            <p className="text-white/80 text-sm max-w-md mx-auto mt-2">{form.description}</p>
          )}
          <p className="text-white/60 text-xs mt-3 uppercase tracking-wider">{form.user.businessName}</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-3xl shadow-xl p-8 space-y-6"
        >
          {/* Star Rating */}
          <div className="text-center pb-6 border-b border-gray-100">
            <label className="block text-sm font-semibold mb-4" style={{ color: form.textColor }}>
              How would you rate your experience? *
            </label>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setData({ ...data, rating: star })}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  className="p-1 rounded-lg transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ "--tw-ring-color": form.primaryColor } as React.CSSProperties}
                >
                  <FiStar
                    className={`w-10 h-10 transition-all ${
                      star <= (hoveredStar || data.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {data.rating > 0 && (() => {
              const meta = ratingMeta[data.rating];
              const Icon = meta.Icon;
              return (
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full animate-fadeIn"
                  style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  <span className="text-sm font-semibold">{meta.label}</span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
                Full Name *
              </label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm"
                style={{ "--tw-ring-color": form.primaryColor } as React.CSSProperties}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
                Company Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm"
                placeholder="Your company"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
                Email *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
                Country *
              </label>
              <select
                value={data.country}
                onChange={(e) => setData({ ...data, country: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm bg-white"
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
              Your Photo <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              {data.profileImage && (
                <img src={data.profileImage} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
              )}
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all text-sm text-gray-500">
                <FiUpload className="w-4 h-4" />
                <span>Upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleProfileImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Review Message */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
              Your Review *
            </label>
            <textarea
              value={data.message}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm resize-none"
              placeholder="Share your experience in detail..."
            />
          </div>

          {/* Reference Images */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
              Reference Images <span className="text-gray-400">(optional)</span>
            </label>
            {data.referenceImages.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {data.referenceImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                    <button
                      type="button"
                      onClick={() => setData({ ...data, referenceImages: data.referenceImages.filter((_, idx) => idx !== i) })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all text-sm text-gray-500">
              <FiUpload className="w-4 h-4" />
              <span>Upload reference images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleReferenceImages(e.target.files)}
              />
            </label>
          </div>

          {/* Custom Fields */}
          {form.customFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: form.textColor }}>
                {field.label} {field.required && "*"}
              </label>
              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  value={data.customFieldData[field.id] || ""}
                  onChange={(e) => setData({ ...data, customFieldData: { ...data.customFieldData, [field.id]: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm"
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  required={field.required}
                  value={data.customFieldData[field.id] || ""}
                  onChange={(e) => setData({ ...data, customFieldData: { ...data.customFieldData, [field.id]: e.target.value } })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm resize-none"
                />
              )}
              {field.type === "number" && (
                <input
                  type="number"
                  required={field.required}
                  value={data.customFieldData[field.id] || ""}
                  onChange={(e) => setData({ ...data, customFieldData: { ...data.customFieldData, [field.id]: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm"
                />
              )}
              {field.type === "select" && (
                <select
                  required={field.required}
                  value={data.customFieldData[field.id] || ""}
                  onChange={(e) => setData({ ...data, customFieldData: { ...data.customFieldData, [field.id]: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm bg-white"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {field.type === "checkbox" && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.customFieldData[field.id] === "true"}
                    onChange={(e) => setData({ ...data, customFieldData: { ...data.customFieldData, [field.id]: e.target.checked.toString() } })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">{field.label}</span>
                </label>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: form.primaryColor, boxShadow: `0 8px 24px ${form.primaryColor}40` }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by <span className="font-semibold text-indigo-500">ReviewHub</span>
          </p>
        </form>
      </div>
    </div>
  );
}
