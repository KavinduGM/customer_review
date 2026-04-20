"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiStar, FiHeart, FiShield, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import {
  MdSentimentVerySatisfied,
  MdSentimentSatisfied,
  MdSentimentNeutral,
  MdSentimentDissatisfied,
  MdSentimentVeryDissatisfied,
} from "react-icons/md";
import type { IconType } from "react-icons";

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

const ratingMeta: Record<number, { label: string; Icon: IconType; color: string }> = {
  5: { label: "Excellent", Icon: MdSentimentVerySatisfied, color: "#16A34A" },
  4: { label: "Great", Icon: MdSentimentSatisfied, color: "#65A30D" },
  3: { label: "Good", Icon: MdSentimentNeutral, color: "#CA8A04" },
  2: { label: "Fair", Icon: MdSentimentDissatisfied, color: "#EA580C" },
  1: { label: "Poor", Icon: MdSentimentVeryDissatisfied, color: "#DC2626" },
};

function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          className={`${size} ${
            s <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-100"
          }`}
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ReviewsDisplayClient({ form, reviews, stats }: Props) {
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  const likeReview = async (id: string) => {
    if (likedReviews.has(id)) return;
    await fetch(`/api/reviews/${id}/like`, { method: "POST" });
    setLikedReviews(new Set([...likedReviews, id]));
  };

  const ratingDistribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
      }),
    [reviews]
  );

  const isEmbed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embed") === "true";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero — solid primary colour, no gradient blast */}
      <header
        className="px-4 pt-14 pb-24 text-center"
        style={{ backgroundColor: form.primaryColor }}
      >
        <div className="max-w-3xl mx-auto">
          {form.user.businessLogo && (
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-white shadow-sm">
              <img
                src={form.user.businessLogo}
                alt=""
                className="max-h-12 max-w-12 object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {form.user.businessName}
          </h1>
          <p className="text-white/75 text-sm mt-2">{form.title}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-16 pb-16">
        {/* Summary card — large, prominent rating */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] sm:gap-10 items-center">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-bold tracking-tight text-slate-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-lg text-slate-400 font-medium">/ 5</span>
              </div>
              <div className="mt-1">
                <Stars rating={stats.averageRating} size="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Based on <span className="font-semibold text-slate-700">{stats.total}</span>{" "}
                {stats.total === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="mt-8 sm:mt-0 space-y-2">
              {ratingDistribution.map((row) => (
                <div key={row.star} className="flex items-center gap-3">
                  <span className="flex items-center gap-1 w-10 text-sm font-medium text-slate-600">
                    {row.star}
                    <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${row.percentage}%`,
                        backgroundColor: form.primaryColor,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm tabular-nums text-slate-500">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews list */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Customer reviews</h2>
            {!isEmbed && (
              <Link
                href={`/review/${form.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Write a review <FiArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-slate-400">No reviews yet. Be the first!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => {
                const meta = ratingMeta[review.rating] ?? ratingMeta[3];
                const Icon = meta.Icon;
                return (
                  <li
                    key={review.id}
                    className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {review.profileImage ? (
                          <img
                            src={review.profileImage}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-slate-100 text-slate-600">
                            {initials(review.fullName) || (
                              <Icon className="w-6 h-6" style={{ color: meta.color }} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                          <span className="font-semibold text-slate-900">{review.fullName}</span>
                          {review.companyName && (
                            <span className="text-xs text-slate-400">from {review.companyName}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            <FiShield className="w-3 h-3" /> Verified
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Stars rating={review.rating} />
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${meta.color}14`, color: meta.color }}
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden /> {meta.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            &nbsp;&middot;&nbsp;{review.country}
                          </span>
                        </div>

                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {review.message}
                        </p>

                        {/* Reference images */}
                        {review.referenceImages && (
                          <div className="flex gap-2 mt-4 flex-wrap">
                            {(JSON.parse(review.referenceImages) as string[]).map((img, i) => (
                              <a
                                key={i}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-20 h-20 rounded-xl overflow-hidden border border-slate-100 hover:border-slate-300 transition-colors"
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Owner reply */}
                        {review.reply && (
                          <div
                            className="mt-4 p-4 rounded-xl border-l-2"
                            style={{
                              borderColor: form.primaryColor,
                              backgroundColor: `${form.primaryColor}0A`,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {form.user.businessLogo && (
                                <img
                                  src={form.user.businessLogo}
                                  alt=""
                                  className="w-5 h-5 rounded object-contain"
                                />
                              )}
                              <span
                                className="text-xs font-semibold"
                                style={{ color: form.primaryColor }}
                              >
                                {form.user.businessName}
                              </span>
                              <span className="text-[11px] text-slate-400">replied</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-line">
                              {review.reply}
                            </p>
                          </div>
                        )}

                        {/* Like */}
                        <div className="mt-4">
                          <button
                            onClick={() => likeReview(review.id)}
                            disabled={likedReviews.has(review.id)}
                            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                              likedReviews.has(review.id)
                                ? "text-rose-500"
                                : "text-slate-400 hover:text-rose-500"
                            }`}
                          >
                            <FiHeart
                              className={`w-4 h-4 ${likedReviews.has(review.id) ? "fill-current" : ""}`}
                            />
                            {review.likes + (likedReviews.has(review.id) ? 1 : 0)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* CTA */}
        <div className="mt-10 text-center">
          {!isEmbed ? (
            <Link
              href={`/review/${form.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: form.primaryColor,
                boxShadow: `0 12px 24px ${form.primaryColor}33`,
              }}
            >
              Write a review <FiArrowRight />
            </Link>
          ) : (
            <a
              href={`${typeof window !== "undefined" ? window.location.origin : ""}/reviews/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-white transition-all text-sm"
            >
              See more reviews <FiArrowRight />
            </a>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            Verified reviews collected by{" "}
            <span className="font-semibold text-slate-600">ReviewHub</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
