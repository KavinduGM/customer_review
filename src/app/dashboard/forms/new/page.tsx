"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiEye, FiSave, FiStar } from "react-icons/fi";

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required: boolean;
  options?: string[];
}

export default function NewFormPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    logo: "",
    thankYouMessage: "Thank you for your valuable review! We appreciate your feedback.",
    primaryColor: "#4F46E5",
    secondaryColor: "#818CF8",
    backgroundColor: "#F9FAFB",
    textColor: "#111827",
    customFields: [] as CustomField[],
  });

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setForm({ ...form, logo: data.url });
  };

  const addCustomField = () => {
    setForm({
      ...form,
      customFields: [
        ...form.customFields,
        { id: Date.now().toString(), label: "", type: "text", required: false },
      ],
    });
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setForm({
      ...form,
      customFields: form.customFields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    });
  };

  const removeCustomField = (id: string) => {
    setForm({
      ...form,
      customFields: form.customFields.filter((f) => f.id !== id),
    });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Please enter a form title");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Form created successfully!");
        router.push("/dashboard/forms");
      } else {
        toast.error("Failed to create form");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Review Form</h1>
          <p className="text-gray-500 mt-1">Design a custom review form for your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <FiEye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" /> {saving ? "Creating..." : "Create Form"}
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-2" : ""}`}>
        {/* Form Builder */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Form Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="e.g. Customer Satisfaction Survey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Tell your customers what this review is about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Logo</label>
                <div className="flex items-center gap-4">
                  {form.logo && (
                    <img src={form.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-100" />
                  )}
                  <label className="flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                    />
                    <span className="text-sm text-gray-500">Click to upload logo</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thank You Message</label>
                <textarea
                  value={form.thankYouMessage}
                  onChange={(e) => setForm({ ...form, thankYouMessage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  rows={2}
                  placeholder="Message shown after review submission"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Form Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Primary Color", key: "primaryColor" },
                { label: "Secondary Color", key: "secondaryColor" },
                { label: "Background Color", key: "backgroundColor" },
                { label: "Text Color", key: "textColor" },
              ].map((color) => (
                <div key={color.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{color.label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form[color.key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [color.key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form[color.key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [color.key]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Default Fields Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Default Fields</h2>
            <p className="text-sm text-gray-500 mb-4">These fields are included in every review form:</p>
            <div className="space-y-2">
              {["Full Name", "Email", "Country", "Company Name (optional)", "Profile Image (optional)", "Reference Images (optional)", "Star Rating", "Review Message"].map((field) => (
                <div key={field} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                  {field}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Custom Fields</h2>
              <button
                onClick={addCustomField}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
              >
                <FiPlus className="w-4 h-4" /> Add Field
              </button>
            </div>

            {form.customFields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No custom fields added yet</p>
            ) : (
              <div className="space-y-4">
                {form.customFields.map((field) => (
                  <div key={field.id} className="p-4 border border-gray-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                        placeholder="Field label"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateCustomField(field.id, { type: e.target.value as CustomField["type"] })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        Required
                      </label>
                      <button
                        onClick={() => removeCustomField(field.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {field.type === "select" && (
                      <input
                        type="text"
                        placeholder="Options (comma separated)"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) => updateCustomField(field.id, { options: e.target.value.split(",").map((o) => o.trim()) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-8 h-fit">
            <div
              className="rounded-2xl border border-gray-100 overflow-hidden shadow-xl"
              style={{ backgroundColor: form.backgroundColor }}
            >
              {/* Preview Header */}
              <div
                className="p-8 text-center"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}
              >
                {form.logo && (
                  <img src={form.logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-xl object-contain bg-white/20 p-2" />
                )}
                <h3 className="text-2xl font-bold text-white">{form.title || "Your Form Title"}</h3>
                {form.description && (
                  <p className="text-white/80 mt-2 text-sm">{form.description}</p>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: form.textColor }}>Full Name</label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm" placeholder="John Doe" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: form.textColor }}>Star Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} className="w-8 h-8 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: form.textColor }}>Review</label>
                  <textarea className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm resize-none" rows={3} placeholder="Write your review..." readOnly />
                </div>
                <button
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
