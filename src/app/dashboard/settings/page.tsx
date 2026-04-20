"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FiUser, FiSave, FiUpload } from "react-icons/fi";
import { uploadFileWithToast } from "@/lib/upload-client";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    businessUrl: "",
    businessLogo: "",
    address: "",
    country: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/settings`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            businessName: data.businessName || "",
            businessType: data.businessType || "",
            businessUrl: data.businessUrl || "",
            businessLogo: data.businessLogo || "",
            address: data.address || "",
            country: data.country || "",
          });
          setLoading(false);
        });
    }
  }, [user?.id]);

  const uploadLogo = async (file: File) => {
    const url = await uploadFileWithToast(file);
    if (!url) return;
    setForm((prev) => ({ ...prev, businessLogo: url }));
    toast.success("Logo uploaded");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Settings saved!");
        update();
      }
    } catch {
      toast.error("Failed to save");
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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FiUser className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and business details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Logo</label>
              <div className="flex items-center gap-4">
                {form.businessLogo && (
                  <img src={form.businessLogo} alt="" className="w-16 h-16 object-contain rounded-xl border border-gray-100" />
                )}
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all text-sm text-gray-500">
                  <FiUpload className="w-4 h-4" />
                  Upload logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select type</option>
                <option value="retail">Retail</option>
                <option value="restaurant">Restaurant</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
                <option value="consulting">Consulting</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
              <input
                type="url"
                value={form.businessUrl}
                onChange={(e) => setForm({ ...form, businessUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
