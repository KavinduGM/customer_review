"use client";

import { useState } from "react";
import { FiStar, FiHeart, FiShield, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface Review {
  id: string;
  fullName: string;
  companyName: string | null;
  profileImage: string | null;
  referenceImages: string | null;
  country: string;
  rating: number;
  message: string;
  likes: number;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Props {
  form: {
    title: string;
    slug: string;
    primaryColor: string;
    user: {
      businessName: string;
      businessLogo: string | null;
    };
  };
  reviews: Review[];
  stats: { total: number; averageRating: number };
}

export default function ReviewsDisplayClient({ form, reviews, stats }: Props) {
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  const likeReview = async (id: string) => {
    if (likedReviews.has(id)) return;
    await fetch(`/api/reviews/${id}/like`, { method: "POST" });
    setLikedReviews(new Set([...likedReviews, id]));
  };

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return "\u{1F929}";
    if (rating >= 4) return "\u{1F60A}";
    if (rating === 3) return "\u{1F642}";
    return "\u{1F61E}";
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const isEmbed = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("embed") === "true";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="py-12 px-4 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.primaryColor}CC)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          {form.user.businessLogo && (
            <img src={form.user.businessLogo} alt="" className="h-12 mx-auto mb-4 rounded-xl object-contain bg-white/20 p-2" />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">{form.user.businessName}</h1>
          <p className="text-white/70 text-sm mb-6">{form.title}</p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.averageRating}</div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? "text-yellow-400 fill-current" : "text-white/30"}`}
                  />
                ))}
              </div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{stats.total}</div>
              <div className="text-white/60 text-sm">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-8">{item.star}&#9733;</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%`, backgroundColor: form.primaryColor }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-gray-400">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all animate-fadeIn">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {review.profileImage ? (
                      <img src={review.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">
                        {getRatingEmoji(review.rating)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.fullName}</span>
                      {review.companyName && (
                        <span className="text-xs text-gray-400">from {review.companyName}</span>
                      )}
                      <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <FiShield className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                          key={s}
                          className={`w-4 h-4 ${s <= review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })} &middot; {review.country}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.message}</p>

                    {/* Reference images */}
                    {review.referenceImages && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {JSON.parse(review.referenceImages).map((img: string, i: number) => (
                          <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                        ))}
                      </div>
                    )}

                    {/* Reply */}
                    {review.reply && (
                      <div className="mt-4 ml-4 pl-4 border-l-2 rounded-r-xl p-4" style={{ borderColor: form.primaryColor, backgroundColor: `${form.primaryColor}08` }}>
                        <div className="flex items-center gap-2 mb-1">
                          {form.user.businessLogo && (
                            <img src={form.user.businessLogo} alt="" className="w-5 h-5 rounded object-contain" />
                          )}
                          <span className="text-xs font-semibold" style={{ color: form.primaryColor }}>
                            {form.user.businessName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{review.reply}</p>
                      </div>
                    )}

                    {/* Like */}
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => likeReview(review.id)}
                        className={`flex items-center gap-1 text-sm transition-all ${
                          likedReviews.has(review.id)
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <FiHeart className={`w-4 h-4 ${likedReviews.has(review.id) ? "fill-current" : ""}`} />
                        {review.likes + (likedReviews.has(review.id) ? 1 : 0)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* See more / write review */}
        <div className="mt-8 text-center space-y-4">
          {!isEmbed && (
            <Link
              href={`/review/${form.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: form.primaryColor }}
            >
              Write a Review <FiArrowRight />
            </Link>
          )}
          {isEmbed && (
            <a
              href={`${typeof window !== "undefined" ? window.location.origin : ""}/reviews/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm"
            >
              See More Reviews <FiArrowRight />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Verified reviews collected by <span className="font-semibold text-indigo-500">ReviewHub</span>
          </p>
        </div>
      </div>
    </div>
  );
}
