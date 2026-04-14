"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiSave, FiPlus, FiTrash2, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required: boolean;
  options?: string[];
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    logo: "",
    thankYouMessage: "",
    primaryColor: "#4F46E5",
    secondaryColor: "#818CF8",
    backgroundColor: "#F9FAFB",
    textColor: "#111827",
    customFields: [] as CustomField[],
    isActive: true,
  });

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          ...data,
          customFields: JSON.parse(data.customFields || "[]"),
        });
        setLoading(false);
      });
  }, [id]);

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

  const updateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
    setForm({
      ...form,
      customFields: form.customFields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const removeCustomField = (fieldId: string) => {
    setForm({
      ...form,
      customFields: form.customFields.filter((f) => f.id !== fieldId),
    });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Please enter a form title");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Form updated!");
        router.push("/dashboard/forms");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forms" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Form</h1>
            <p className="text-gray-500 mt-1">Update your review form settings</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Logo</label>
              <div className="flex items-center gap-4">
                {form.logo && (
                  <img src={form.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-100" />
                )}
                <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                  <span className="text-sm text-gray-500">Click to upload</span>
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
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Form Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Primary", key: "primaryColor" },
              { label: "Secondary", key: "secondaryColor" },
              { label: "Background", key: "backgroundColor" },
              { label: "Text", key: "textColor" },
            ].map((c) => (
              <div key={c.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{c.label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form[c.key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form[c.key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

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
            <p className="text-sm text-gray-400 text-center py-6">No custom fields</p>
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
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <button onClick={() => removeCustomField(field.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {field.type === "select" && (
                    <input
                      type="text"
                      placeholder="Options (comma separated)"
                      value={field.options?.join(", ") || ""}
                      onChange={(e) => updateCustomField(field.id, { options: e.target.value.split(",").map((o) => o.trim()) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
