"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiStar, FiUpload, FiCheck } from "react-icons/fi";

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

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();
    return result.url;
  };

  const handleProfileImage = async (file: File) => {
    const url = await uploadFile(file);
    setData({ ...data, profileImage: url });
  };

  const handleReferenceImages = async (files: FileList) => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      urls.push(url);
    }
    setData({ ...data, referenceImages: [...data.referenceImages, ...urls] });
  };

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return "\u{1F929}";
    if (rating >= 4) return "\u{1F60A}";
    if (rating === 3) return "\u{1F642}";
    return "\u{1F61E}";
  };

  const getRatingText = (rating: number) => {
    if (rating === 5) return "Excellent!";
    if (rating === 4) return "Great!";
    if (rating === 3) return "Good";
    if (rating === 2) return "Fair";
    if (rating === 1) return "Poor";
    return "";
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
        {/* Header */}
        <div
          className="rounded-t-3xl p-8 text-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div className="relative z-10">
            {(form.logo || form.user.businessLogo) && (
              <img
                src={form.logo || form.user.businessLogo || ""}
                alt={form.user.businessName}
                className="h-14 mx-auto mb-4 rounded-xl object-contain bg-white/20 p-2"
              />
            )}
            <h1 className="text-3xl font-bold text-white mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-white/80 text-sm max-w-md mx-auto">{form.description}</p>
            )}
            <p className="text-white/60 text-xs mt-3">{form.user.businessName}</p>
          </div>
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
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setData({ ...data, rating: star })}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-all duration-200 hover:scale-125"
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
            {data.rating > 0 && (
              <div className="flex items-center justify-center gap-2 animate-fadeIn">
                <span className="text-3xl">{getRatingEmoji(data.rating)}</span>
                <span className="text-sm font-medium" style={{ color: form.primaryColor }}>
                  {getRatingText(data.rating)}
                </span>
              </div>
            )}
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
