"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiX,
  FiClock,
  FiTrash2,
  FiHeart,
  FiMessageCircle,
  FiFilter,
  FiSearch,
} from "react-icons/fi";

interface Review {
  id: string;
  fullName: string;
  companyName: string | null;
  profileImage: string | null;
  referenceImages: string | null;
  email: string;
  country: string;
  rating: number;
  message: string;
  isApproved: boolean;
  isRead: boolean;
  likes: number;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  form: { title: string; slug: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const fetchReviews = () => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApprove = async (id: string) => {
    await fetch(`/api/reviews/${id}/approve`, { method: "POST" });
    toast.success("Review status updated");
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    toast.success("Review deleted");
    fetchReviews();
  };

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return;
    await fetch(`/api/reviews/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    });
    toast.success("Reply added");
    setReplyingTo(null);
    setReplyText("");
    fetchReviews();
  };

  const likeReview = async (id: string) => {
    await fetch(`/api/reviews/${id}/like`, { method: "POST" });
    fetchReviews();
  };

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return "\u{1F929}";
    if (rating >= 4) return "\u{1F60A}";
    if (rating === 3) return "\u{1F642}";
    return "\u{1F61E}";
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending" && r.isApproved) return false;
    if (filter === "approved" && !r.isApproved) return false;
    if (search && !r.fullName.toLowerCase().includes(search.toLowerCase()) && !r.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">{reviews.length} total reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FiMessageCircle className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-500">
            {filter !== "all" ? "Try changing the filter" : "Reviews will appear here once customers submit them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all animate-fadeIn">
              <div className="flex items-start gap-4">
                {/* Avatar / emoji */}
                <div className="shrink-0">
                  {review.profileImage ? (
                    <img src={review.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">
                      {getRatingEmoji(review.rating)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{review.fullName}</span>
                    {review.companyName && (
                      <span className="text-xs text-gray-400">from {review.companyName}</span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>
                          &#9733;
                        </span>
                      ))}
                    </div>
                    {review.isApproved ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                        <FiCheck className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                        <FiClock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-2">{review.message}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{review.country}</span>
                    <span>{review.email}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-500 font-medium">{review.form?.title}</span>
                  </div>

                  {/* Reference images */}
                  {review.referenceImages && (
                    <div className="flex gap-2 mt-3">
                      {JSON.parse(review.referenceImages).map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                      ))}
                    </div>
                  )}

                  {/* Reply */}
                  {review.reply && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-xl p-4">
                      <p className="text-xs font-semibold text-indigo-600 mb-1">Business Reply</p>
                      <p className="text-sm text-gray-700">{review.reply}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {review.repliedAt && new Date(review.repliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingTo === review.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => e.key === "Enter" && submitReply(review.id)}
                      />
                      <button
                        onClick={() => submitReply(review.id)}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => likeReview(review.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiHeart className="w-4 h-4" /> {review.likes}
                  </button>
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyText(review.reply || ""); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Reply"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleApprove(review.id)}
                    className={`p-2 rounded-xl transition-all ${
                      review.isApproved
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-green-500 hover:bg-green-50"
                    }`}
                    title={review.isApproved ? "Unapprove" : "Approve"}
                  >
                    {review.isApproved ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
