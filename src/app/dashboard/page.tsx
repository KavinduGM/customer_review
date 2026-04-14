"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiFileText, FiMessageSquare, FiStar, FiTrendingUp, FiPlus, FiCheck, FiClock } from "react-icons/fi";

interface DashboardStats {
  totalForms: number;
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  recentReviews: Array<{
    id: string;
    fullName: string;
    rating: number;
    message: string;
    isApproved: boolean;
    createdAt: string;
    form: { title: string };
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((forms) => {
        fetch("/api/reviews")
          .then((r) => r.json())
          .then((reviews) => {
            const totalRating = reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
            setStats({
              totalForms: forms.length,
              totalReviews: reviews.length,
              pendingReviews: reviews.filter((r: { isApproved: boolean }) => !r.isApproved).length,
              averageRating: reviews.length ? totalRating / reviews.length : 0,
              recentReviews: reviews.slice(0, 5),
            });
          });
      });
  }, []);

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return "\u{1F929}";
    if (rating >= 4) return "\u{1F60A}";
    if (rating === 3) return "\u{1F642}";
    return "\u{1F61E}";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {(user?.name as string)?.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 mt-1">{user?.businessName as string}</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <FiPlus className="w-4 h-4" /> New Form
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Review Forms",
            value: stats?.totalForms ?? "-",
            icon: FiFileText,
            color: "indigo",
            bg: "bg-indigo-50",
            text: "text-indigo-600",
          },
          {
            label: "Total Reviews",
            value: stats?.totalReviews ?? "-",
            icon: FiMessageSquare,
            color: "blue",
            bg: "bg-blue-50",
            text: "text-blue-600",
          },
          {
            label: "Pending Approval",
            value: stats?.pendingReviews ?? "-",
            icon: FiClock,
            color: "amber",
            bg: "bg-amber-50",
            text: "text-amber-600",
          },
          {
            label: "Average Rating",
            value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "-",
            icon: FiStar,
            color: "green",
            bg: "bg-green-50",
            text: "text-green-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
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

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
          <Link href="/dashboard/reviews" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all
          </Link>
        </div>

        {!stats?.recentReviews?.length ? (
          <div className="text-center py-12 text-gray-400">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm mt-1">Create a review form and share it with your customers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all">
                <div className="text-2xl">{getRatingEmoji(review.rating)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.fullName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-xs ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>
                          &#9733;
                        </span>
                      ))}
                    </div>
                    {review.isApproved ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <FiCheck className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <FiClock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{review.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.form?.title}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
