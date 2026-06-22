"use client";

import { useState, useEffect } from "react";
import { Heart, Eye, Share2, Check } from "lucide-react";
import styles from "./ProjectStats.module.css";
import { useTranslation } from "./TranslationProvider";

interface ProjectStatsProps {
  projectId: string;
  serviceSlug: string; // e.g. "branding" — needed to build the share URL
  initialLikes: number;
  initialFakeLikes: number;
  initialViews: number;
  initialFakeViews: number;
  initialShares: number;
  initialFakeShares: number;
}

export default function ProjectStats({
  projectId,
  serviceSlug,
  initialLikes,
  initialFakeLikes,
  initialViews,
  initialFakeViews,
  initialShares,
  initialFakeShares,
}: ProjectStatsProps) {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes + initialFakeLikes);
  const [views, setViews] = useState(initialViews + initialFakeViews);
  const [shares, setShares] = useState(initialShares + initialFakeShares);
  const [likeAnimate, setLikeAnimate] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check localStorage on mount to restore liked state
  useEffect(() => {
    if (localStorage.getItem(`pxl_like_${projectId}`)) {
      setLiked(true);
    }
  }, [projectId]);

  // Track a real view when this component mounts (deep-link or fresh load)
  useEffect(() => {
    // Only count once per session — use sessionStorage as guard
    const sessionKey = `pxl_viewed_${projectId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    fetch(`/api/projects/${projectId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setViews(data.totalViews);
      })
      .catch(() => {});
  }, [projectId]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((v) => v + 1);
    setLikeAnimate(true);
    localStorage.setItem(`pxl_like_${projectId}`, "1");
    setTimeout(() => setLikeAnimate(false), 600);

    try {
      const res = await fetch(`/api/projects/${projectId}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) setLikes(data.totalLikes);
    } catch {}
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${serviceSlug}#project-${projectId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }

      // Log the share event
      const res = await fetch(`/api/projects/${projectId}/share`, { method: "POST" });
      const data = await res.json();
      if (data.success) setShares(data.totalShares);
    } catch {}
  };

  return (
    <div className={styles.statsRow}>
      {/* ── Heart / Like ── */}
      <button
        onClick={handleLike}
        disabled={liked}
        className={`${styles.statBtn} ${liked ? styles.likedBtn : ""} ${likeAnimate ? styles.pop : ""}`}
        aria-label={t('common.likeThisProject') || "Like this project"}
        title={liked ? (t('common.alreadyLiked') || "Already liked") : (t('common.likeThisProject') || "Like this project")}
      >
        <Heart
          className={`${styles.btnIcon} ${liked ? styles.heartFilled : ""}`}
          size={16}
        />
        <span className={styles.count}>{likes.toLocaleString()}</span>
      </button>

      {/* ── Eye / Views ── */}
      <div className={styles.statDisplay} title={t('common.totalViews') || "Total views"}>
        <Eye className={styles.btnIcon} size={16} />
        <span className={styles.count}>{views.toLocaleString()}</span>
      </div>

      {/* ── Share ── */}
      <button
        onClick={handleShare}
        className={`${styles.statBtn} ${styles.shareBtn} ${copied ? styles.copiedBtn : ""}`}
        aria-label={t('common.shareThisProject') || "Share this project"}
        title={t('common.shareThisProject') || "Share this project"}
      >
        {copied ? (
          <Check className={styles.btnIcon} size={16} />
        ) : (
          <Share2 className={styles.btnIcon} size={16} />
        )}
        <span className={styles.count}>
          {copied ? (t('common.copied') || "Copied!") : shares.toLocaleString()}
        </span>
      </button>
    </div>
  );
}
