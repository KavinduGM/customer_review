"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCopy, FiLink, FiCode, FiMaximize, FiMessageCircle, FiStar, FiEye, FiEyeOff } from "react-icons/fi";

export default function EmbedFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<{ title: string; slug: string; primaryColor: string } | null>(null);
  const [activeCollectTab, setActiveCollectTab] = useState<"link" | "button" | "popup-full" | "popup-chat">("link");
  const [activeDisplayTab, setActiveDisplayTab] = useState<"button" | "popup-full" | "popup-chat">("button");
  const [showReviewCount, setShowReviewCount] = useState(true);
  const [showScore, setShowScore] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((r) => r.json())
      .then(setForm);
  }, [id]);

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${baseUrl}/review/${form.slug}`;
  const reviewsUrl = `${baseUrl}/reviews/${form.slug}`;
  const apiUrl = `${baseUrl}/api/public/reviews/${form.slug}`;
  const color = form.primaryColor || "#4F46E5";

  // --- Collect Reviews embed codes ---
  const collectCodes = {
    link: formUrl,
    button: `<!-- ReviewHub Review Collection Button -->
<div id="reviewhub-collect-btn"></div>
<script>
(function() {
  var btn = document.createElement('a');
  btn.href = '${formUrl}';
  btn.target = '_blank';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:${color};color:#fff;border-radius:12px;font-family:system-ui;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s';
  btn.innerHTML = '&#9733; Write a Review';
  btn.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
  btn.onmouseout = function() { this.style.transform = 'scale(1)'; };
  document.getElementById('reviewhub-collect-btn').appendChild(btn);
})();
</script>`,
    "popup-full": `<!-- ReviewHub Review Collection Popup -->
<div id="reviewhub-popup-btn"></div>
<script>
(function() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;justify-content:center;align-items:center;backdrop-filter:blur(4px)';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#fff;border-radius:20px;width:90%;max-width:600px;max-height:90vh;overflow:hidden;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)';

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;background:rgba(0,0,0,0.1);border:none;font-size:24px;cursor:pointer;z-index:10;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#666';
  closeBtn.onclick = function() { overlay.style.display = 'none'; };

  var iframe = document.createElement('iframe');
  iframe.src = '${formUrl}?embed=true';
  iframe.style.cssText = 'width:100%;height:80vh;border:none';

  modal.appendChild(closeBtn);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  overlay.onclick = function(e) { if(e.target === overlay) overlay.style.display = 'none'; };
  document.body.appendChild(overlay);

  var btn = document.createElement('button');
  btn.innerHTML = '&#9733; Write a Review';
  btn.style.cssText = 'padding:12px 24px;background:${color};color:#fff;border:none;border-radius:12px;font-family:system-ui;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  btn.onclick = function() { overlay.style.display = 'flex'; };
  document.getElementById('reviewhub-popup-btn').appendChild(btn);
})();
</script>`,
    "popup-chat": `<!-- ReviewHub Review Collection Chat Widget -->
<script>
(function() {
  var widget = document.createElement('div');
  widget.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999';

  var panel = document.createElement('div');
  panel.style.cssText = 'display:none;width:400px;height:600px;background:#fff;border-radius:20px;box-shadow:0 25px 60px rgba(0,0,0,0.2);overflow:hidden;margin-bottom:16px;position:relative';

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;background:rgba(0,0,0,0.1);border:none;font-size:20px;cursor:pointer;z-index:10;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#666';
  closeBtn.onclick = function() { panel.style.display = 'none'; };

  var iframe = document.createElement('iframe');
  iframe.src = '${formUrl}?embed=true';
  iframe.style.cssText = 'width:100%;height:100%;border:none';

  panel.appendChild(closeBtn);
  panel.appendChild(iframe);

  var fab = document.createElement('button');
  fab.innerHTML = '&#9733;';
  fab.style.cssText = 'width:60px;height:60px;border-radius:50%;background:${color};color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s';
  fab.onmouseover = function() { this.style.transform = 'scale(1.1)'; };
  fab.onmouseout = function() { this.style.transform = 'scale(1)'; };
  fab.onclick = function() { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };

  widget.appendChild(panel);
  widget.appendChild(fab);
  document.body.appendChild(widget);
})();
</script>`,
  };

  // --- Shared review rendering helper used by all display widgets ---
  const reviewRendererFn = `
  function renderStars(rating) {
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      stars += '<span style="color:' + (i <= rating ? '#F59E0B' : '#D1D5DB') + ';font-size:14px;">&#9733;</span>';
    }
    return stars;
  }
  function renderReviewCard(r) {
    var initials = r.fullName.charAt(0).toUpperCase();
    var card = document.createElement('div');
    card.style.cssText = 'padding:16px;border:1px solid #F3F4F6;border-radius:12px;margin-bottom:10px;background:#fff';
    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">' + initials + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-weight:600;font-size:13px;color:#111827">' + r.fullName + (r.companyName ? ' <span style="font-weight:400;color:#9CA3AF;font-size:12px">from ' + r.companyName + '</span>' : '') + '</div>' +
          '<div style="display:flex;align-items:center;gap:6px">' + renderStars(r.rating) + '<span style="font-size:11px;color:#9CA3AF">' + new Date(r.createdAt).toLocaleDateString("en-US") + '</span></div>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:13px;color:#374151;line-height:1.5;margin:0">' + r.message.substring(0, 150) + (r.message.length > 150 ? '...' : '') + '</p>';
    return card;
  }`;

  // --- Header with optional score and count ---
  const headerFn = `
  function renderHeader(stats, container) {
    var header = document.createElement('div');
    header.style.cssText = 'padding:16px 20px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;justify-content:space-between';
    var left = document.createElement('div');
    left.innerHTML = '<div style="font-weight:700;font-size:16px;color:#111827">Customer Reviews</div>';
    var info = [];
    ${showScore ? `info.push('<span style="color:#F59E0B;font-size:18px;font-weight:700">' + (stats.averageRating || 0).toFixed(1) + '</span><span style="font-size:13px;color:#6B7280">/5 &#9733;</span>');` : ''}
    ${showReviewCount ? `info.push('<span style="font-size:13px;color:#6B7280">' + stats.total + ' review' + (stats.total !== 1 ? 's' : '') + '</span>');` : ''}
    if (info.length) {
      var right = document.createElement('div');
      right.style.cssText = 'display:flex;align-items:center;gap:8px';
      right.innerHTML = info.join('<span style="color:#E5E7EB">|</span>');
      header.appendChild(left);
      header.appendChild(right);
    } else {
      header.appendChild(left);
    }
    container.appendChild(header);
  }`;

  // --- See More button ---
  const seeMoreFn = `
  function renderSeeMore(container) {
    var seeMore = document.createElement('a');
    seeMore.href = '${reviewsUrl}';
    seeMore.target = '_blank';
    seeMore.style.cssText = 'display:block;text-align:center;padding:14px;background:${color};color:#fff;text-decoration:none;font-family:system-ui;font-size:14px;font-weight:600;border-radius:0 0 16px 16px;transition:opacity 0.2s';
    seeMore.innerHTML = 'See More Reviews &rarr;';
    seeMore.onmouseover = function() { this.style.opacity = '0.9'; };
    seeMore.onmouseout = function() { this.style.opacity = '1'; };
    container.appendChild(seeMore);
  }`;

  // --- Display Reviews embed codes ---
  const displayCodes = {
    button: `<!-- ReviewHub Reviews Display Button -->
<div id="reviewhub-reviews-btn"></div>
<script>
(function() {
  var btn = document.createElement('a');
  btn.href = '${reviewsUrl}';
  btn.target = '_blank';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:${color};color:#fff;border-radius:14px;font-family:system-ui;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.15);transition:transform 0.2s,box-shadow 0.2s';
  btn.onmouseover = function() { this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'; };
  btn.onmouseout = function() { this.style.transform='scale(1)'; this.style.boxShadow='0 4px 14px rgba(0,0,0,0.15)'; };

  var starSpan = document.createElement('span');
  starSpan.innerHTML = '&#9733;';
  starSpan.style.cssText = 'font-size:18px';
  btn.appendChild(starSpan);

  var text = document.createElement('span');
  text.textContent = 'See Our Reviews';
  btn.appendChild(text);

  document.getElementById('reviewhub-reviews-btn').appendChild(btn);

  ${showReviewCount || showScore ? `fetch('${apiUrl}')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var badge = document.createElement('span');
      badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(255,255,255,0.2);border-radius:8px;font-size:12px;font-weight:500';
      var parts = [];
      ${showScore ? `if(data.stats && data.stats.averageRating) parts.push(data.stats.averageRating.toFixed(1) + ' &#9733;');` : ''}
      ${showReviewCount ? `if(data.stats) parts.push(data.stats.total + ' reviews');` : ''}
      badge.innerHTML = parts.join(' &middot; ');
      if(parts.length) btn.appendChild(badge);
    });` : ''}
})();
</script>`,

    "popup-full": `<!-- ReviewHub Reviews Display Popup -->
<!-- Auto-loads as a popup after the website loads -->
<script>
(function() {
  ${reviewRendererFn}
  ${headerFn}
  ${seeMoreFn}

  var overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;justify-content:center;align-items:center;backdrop-filter:blur(4px);opacity:0;transition:opacity 0.3s';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#FAFAFA;border-radius:20px;width:92%;max-width:520px;max-height:85vh;overflow:hidden;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3);display:flex;flex-direction:column;transform:translateY(20px);transition:transform 0.3s';

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:14px;right:16px;background:rgba(0,0,0,0.08);border:none;font-size:22px;cursor:pointer;z-index:10;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#666;transition:background 0.2s';
  closeBtn.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.15)'; };
  closeBtn.onmouseout = function() { this.style.background = 'rgba(0,0,0,0.08)'; };
  closeBtn.onclick = function() {
    overlay.style.opacity = '0';
    modal.style.transform = 'translateY(20px)';
    setTimeout(function() { overlay.style.display = 'none'; }, 300);
  };

  modal.appendChild(closeBtn);

  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px';

  var loading = document.createElement('div');
  loading.style.cssText = 'text-align:center;padding:40px;color:#9CA3AF;font-family:system-ui;font-size:14px';
  loading.textContent = 'Loading reviews...';
  body.appendChild(loading);

  modal.appendChild(body);

  overlay.appendChild(modal);
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.style.opacity = '0';
      modal.style.transform = 'translateY(20px)';
      setTimeout(function() { overlay.style.display = 'none'; }, 300);
    }
  };
  document.body.appendChild(overlay);

  // Auto-open after 2 seconds
  setTimeout(function() {
    overlay.style.display = 'flex';
    setTimeout(function() {
      overlay.style.opacity = '1';
      modal.style.transform = 'translateY(0)';
    }, 10);
  }, 2000);

  // Fetch and render reviews
  fetch('${apiUrl}')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      body.innerHTML = '';
      renderHeader(data.stats || { total: 0, averageRating: 0 }, modal.insertBefore(document.createElement('div'), body).parentElement === modal ? modal.children[0] === closeBtn ? modal : modal : modal);
      // Re-insert header properly
      var headerWrap = document.createElement('div');
      renderHeader(data.stats || { total: 0, averageRating: 0 }, headerWrap);
      modal.insertBefore(headerWrap.firstChild, body);

      var reviews = data.reviews || [];
      if (reviews.length === 0) {
        body.innerHTML = '<div style="text-align:center;padding:40px;color:#9CA3AF;font-family:system-ui">No reviews yet</div>';
      } else {
        reviews.slice(0, 5).forEach(function(r) {
          body.appendChild(renderReviewCard(r));
        });
      }
      renderSeeMore(modal);
    })
    .catch(function() {
      body.innerHTML = '<div style="text-align:center;padding:40px;color:#EF4444;font-family:system-ui">Failed to load reviews</div>';
    });
})();
</script>`,

    "popup-chat": `<!-- ReviewHub Reviews Chat Widget -->
<!-- Small widget on the right side like a chatbot -->
<script>
(function() {
  ${reviewRendererFn}
  ${headerFn}
  ${seeMoreFn}

  var widget = document.createElement('div');
  widget.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;font-family:system-ui';

  var panel = document.createElement('div');
  panel.style.cssText = 'display:none;width:380px;max-height:520px;background:#FAFAFA;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,0.2);overflow:hidden;margin-bottom:14px;flex-direction:column;transform:translateY(10px) scale(0.95);opacity:0;transition:transform 0.25s,opacity 0.25s';

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:14px;right:16px;background:rgba(0,0,0,0.08);border:none;font-size:18px;cursor:pointer;z-index:10;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#666;transition:background 0.2s';
  closeBtn.onmouseover = function() { this.style.background = 'rgba(0,0,0,0.15)'; };
  closeBtn.onmouseout = function() { this.style.background = 'rgba(0,0,0,0.08)'; };
  closeBtn.onclick = function() {
    panel.style.transform = 'translateY(10px) scale(0.95)';
    panel.style.opacity = '0';
    setTimeout(function() { panel.style.display = 'none'; }, 250);
  };

  var panelInner = document.createElement('div');
  panelInner.style.cssText = 'position:relative;display:flex;flex-direction:column;max-height:520px';

  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:14px 16px';

  var loading = document.createElement('div');
  loading.style.cssText = 'text-align:center;padding:30px;color:#9CA3AF;font-size:13px';
  loading.textContent = 'Loading reviews...';
  body.appendChild(loading);

  panelInner.appendChild(closeBtn);
  panelInner.appendChild(body);
  panel.appendChild(panelInner);

  // FAB button
  var fab = document.createElement('button');
  fab.style.cssText = 'display:flex;align-items:center;gap:8px;padding:14px 22px;border-radius:50px;background:${color};color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s,box-shadow 0.2s;font-family:system-ui;margin-left:auto';
  fab.innerHTML = '<span style="font-size:18px">&#9733;</span> Reviews';
  fab.onmouseover = function() { this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 24px rgba(0,0,0,0.25)'; };
  fab.onmouseout = function() { this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.2)'; };

  var isOpen = false;
  var loaded = false;

  fab.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.style.display = 'flex';
      setTimeout(function() {
        panel.style.transform = 'translateY(0) scale(1)';
        panel.style.opacity = '1';
      }, 10);
      if (!loaded) { loaded = true; loadReviews(); }
    } else {
      panel.style.transform = 'translateY(10px) scale(0.95)';
      panel.style.opacity = '0';
      setTimeout(function() { panel.style.display = 'none'; }, 250);
    }
  };

  function loadReviews() {
    fetch('${apiUrl}')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        body.innerHTML = '';
        renderHeader(data.stats || { total: 0, averageRating: 0 }, panelInner.insertBefore(document.createElement('div'), body) ? panelInner : panelInner);
        // Proper header insert
        var headerWrap = document.createElement('div');
        renderHeader(data.stats || { total: 0, averageRating: 0 }, headerWrap);
        panelInner.insertBefore(headerWrap.firstChild, body);

        var reviews = data.reviews || [];
        if (reviews.length === 0) {
          body.innerHTML = '<div style="text-align:center;padding:30px;color:#9CA3AF;font-size:13px">No reviews yet</div>';
        } else {
          reviews.slice(0, 4).forEach(function(r) {
            body.appendChild(renderReviewCard(r));
          });
        }
        renderSeeMore(panelInner);

        ${showReviewCount || showScore ? `
        // Update FAB with stats
        var badge = document.createElement('span');
        badge.style.cssText = 'font-size:11px;opacity:0.85;margin-left:2px';
        var parts = [];
        ${showScore ? `if(data.stats && data.stats.averageRating) parts.push(data.stats.averageRating.toFixed(1));` : ''}
        ${showReviewCount ? `if(data.stats) parts.push(data.stats.total);` : ''}
        if (parts.length) {
          badge.textContent = '(' + parts.join(' | ') + ')';
          fab.appendChild(badge);
        }` : ''}
      })
      .catch(function() {
        body.innerHTML = '<div style="text-align:center;padding:30px;color:#EF4444;font-size:13px">Failed to load</div>';
      });
  }

  widget.appendChild(panel);
  widget.appendChild(fab);
  document.body.appendChild(widget);
})();
</script>`,
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const collectTabs = [
    { id: "link" as const, label: "Direct Link", icon: FiLink },
    { id: "button" as const, label: "Button Widget", icon: FiCode },
    { id: "popup-full" as const, label: "Full Popup", icon: FiMaximize },
    { id: "popup-chat" as const, label: "Chat Widget", icon: FiMessageCircle },
  ];

  const displayTabs = [
    { id: "button" as const, label: "Button Widget", icon: FiCode, desc: "A button that links to your full reviews page" },
    { id: "popup-full" as const, label: "Popup Widget", icon: FiMaximize, desc: "Auto-opens a review popup after the page loads" },
    { id: "popup-chat" as const, label: "Chat Widget", icon: FiMessageCircle, desc: "A small floating widget on the right side" },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/forms" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Share & Embed</h1>
          <p className="text-gray-500 mt-1">{form.title}</p>
        </div>
      </div>

      {/* ========== Collect Reviews Section ========== */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Collect Reviews</h2>
        <p className="text-sm text-gray-500 mb-5">Embed a form to collect reviews from your customers</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {collectTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCollectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCollectTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {activeCollectTab === "link" ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">Share this link directly with your customers:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                />
                <button
                  onClick={() => copyCode(formUrl)}
                  className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
                >
                  <FiCopy className="w-4 h-4" /> Copy
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">The link will show your form title and description as meta tags when shared on social media.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">Copy this code and paste it into your website&apos;s HTML:</p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-64 leading-relaxed">
                  {collectCodes[activeCollectTab]}
                </pre>
                <button
                  onClick={() => copyCode(collectCodes[activeCollectTab])}
                  className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs hover:bg-gray-600 transition-all"
                >
                  <FiCopy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== Display Reviews Section ========== */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Display Reviews</h2>
        <p className="text-sm text-gray-500 mb-5">Embed your approved reviews on your website to build trust</p>

        {/* Toggle Options */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiStar className="w-4 h-4 text-indigo-500" /> Widget Display Options
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowReviewCount(!showReviewCount)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                showReviewCount
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
            >
              {showReviewCount ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
              Review Count
            </button>
            <button
              onClick={() => setShowScore(!showScore)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                showScore
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
            >
              {showScore ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
              Average Score
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Toggle which stats to display in the embedded widgets. The embed code below updates automatically.
          </p>
        </div>

        {/* Display Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {displayTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDisplayTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeDisplayTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Active Display Widget Code */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                {displayTabs.find((t) => t.id === activeDisplayTab)?.label}
              </h3>
              <p className="text-sm text-gray-500">
                {displayTabs.find((t) => t.id === activeDisplayTab)?.desc}
              </p>
            </div>
            <button
              onClick={() => copyCode(displayCodes[activeDisplayTab])}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
            >
              <FiCopy className="w-4 h-4" /> Copy Code
            </button>
          </div>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-72 leading-relaxed">
              {displayCodes[activeDisplayTab]}
            </pre>
          </div>

          {/* Features list */}
          <div className="mt-4 flex flex-wrap gap-2">
            {showScore && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <FiEye className="w-3 h-3" /> Score visible
              </span>
            )}
            {showReviewCount && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <FiEye className="w-3 h-3" /> Count visible
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              &#10003; See More button included
            </span>
            {activeDisplayTab !== "button" && (
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                &#10003; Close button included
              </span>
            )}
          </div>
        </div>

        {/* Reviews Page Link */}
        <div className="mt-6 bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <p className="text-sm text-indigo-700">
            <strong>Reviews Page URL:</strong>{" "}
            <a href={reviewsUrl} target="_blank" className="underline hover:text-indigo-900 transition-colors">{reviewsUrl}</a>
          </p>
          <p className="text-xs text-indigo-500 mt-2">
            All embedded widgets include a &ldquo;See More&rdquo; button that redirects visitors to your full reviews page.
          </p>
        </div>
      </div>
    </div>
  );
}
