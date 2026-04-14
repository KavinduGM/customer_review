"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
  FiTrash2,
  FiShield,
  FiPause,
  FiPlay,
  FiSearch,
} from "react-icons/fi";

interface AdminStats {
  totalUsers: number;
  totalForms: number;
  totalReviews: number;
  averageRating: number;
  users: Array<{
    id: string;
    fullName: string;
    username: string;
    email: string;
    businessName: string;
    businessType: string | null;
    role: string;
    status: string;
    createdAt: string;
    formsCount: number;
    reviewsCount: number;
  }>;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as Record<string, unknown> | undefined;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/dashboard");
      });
  }, [user, router]);

  const toggleSuspend = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}`);
    const res = await fetch("/api/admin/stats");
    setStats(await res.json());
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    toast.success("User deleted");
    const res = await fetch("/api/admin/stats");
    setStats(await res.json());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  const filteredUsers = stats.users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FiShield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and user management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: FiUsers, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Total Forms", value: stats.totalForms, icon: FiFileText, bg: "bg-indigo-50", text: "text-indigo-600" },
          { label: "Total Reviews", value: stats.totalReviews, icon: FiMessageSquare, bg: "bg-green-50", text: "text-green-600" },
          { label: "Avg Rating", value: `${stats.averageRating}/5`, icon: FiStar, bg: "bg-amber-50", text: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
              <FiTrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Registered Businesses</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">Business</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Forms</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Reviews</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase px-6 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{u.businessName}</p>
                    <p className="text-xs text-gray-400">{u.businessType || "-"}</p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{u.formsCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{u.reviewsCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      {u.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {u.role !== "admin" && (
                        <>
                          <button
                            onClick={() => toggleSuspend(u.id, u.status)}
                            className={`p-2 rounded-xl transition-all ${
                              u.status === "active"
                                ? "text-amber-500 hover:bg-amber-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            title={u.status === "active" ? "Suspend" : "Activate"}
                          >
                            {u.status === "active" ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {u.role === "admin" && (
                        <span className="text-xs text-indigo-500 font-medium px-2">Admin</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
