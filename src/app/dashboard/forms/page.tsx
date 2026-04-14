"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiLink, FiCode, FiMessageSquare, FiToggleLeft, FiToggleRight } from "react-icons/fi";

interface Form {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  primaryColor: string;
  createdAt: string;
  _count: { reviews: number };
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = () => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => {
        setForms(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchForms(); }, []);

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated reviews.")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    toast.success("Form deleted");
    fetchForms();
  };

  const toggleActive = async (form: Form) => {
    await fetch(`/api/forms/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isActive: !form.isActive }),
    });
    toast.success(form.isActive ? "Form deactivated" : "Form activated");
    fetchForms();
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/review/${slug}`);
    toast.success("Link copied to clipboard!");
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Forms</h1>
          <p className="text-gray-500 mt-1">Create and manage your review collection forms</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <FiPlus className="w-4 h-4" /> New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FiMessageSquare className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No review forms yet</h3>
          <p className="text-gray-500 mb-6">Create your first review form to start collecting customer feedback</p>
          <Link
            href="/dashboard/forms/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
          >
            <FiPlus className="w-4 h-4" /> Create Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  {form.title.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => toggleActive(form)}
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                    form.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {form.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                  {form.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{form.title}</h3>
              {form.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{form.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                <span className="flex items-center gap-1">
                  <FiMessageSquare className="w-4 h-4" /> {form._count.reviews} reviews
                </span>
                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => copyLink(form.slug)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <FiLink className="w-4 h-4" /> Copy Link
                </button>
                <Link
                  href={`/dashboard/forms/${form.id}/embed`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <FiCode className="w-4 h-4" /> Embed
                </Link>
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <FiEdit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => deleteForm(form.id)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
