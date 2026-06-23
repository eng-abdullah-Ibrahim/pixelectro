"use client";

import { useState, useEffect } from "react";
import { Heart, Eye, Share2, Check } from "lucide-react";
import styles from "./ProjectStats.module.css";
import { useTranslation } from "./TranslationProvider";

interface ProjectStatsProps {
  projectId: string; // Used as target ID, can be project ID or media ID depending on targetType
  targetType?: "PROJECT" | "MEDIA";
  serviceSlug: string;
  initialLikes: number;
  initialFakeLikes: number;
  initialViews: number;
  initialFakeViews: number;
  initialShares: number;
  initialFakeShares: number;
}

export default function ProjectStats({
  projectId,
  targetType = "PROJECT",
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

  const apiBasePath = targetType === "PROJECT" ? `/api/projects/${projectId}` : `/api/media/${projectId}`;
  const lsLikeKey = targetType === "PROJECT" ? `pxl_like_${projectId}` : `pxl_media_like_${projectId}`;
  const ssViewKey = targetType === "PROJECT" ? `pxl_viewed_${projectId}` : `pxl_media_viewed_${projectId}`;

  // Check localStorage on mount to restore liked state
  useEffect(() => {
    if (localStorage.getItem(lsLikeKey)) {
      setLiked(true);
    }
  }, [projectId, lsLikeKey]);

  // Track a real view when this component mounts (deep-link or fresh load)
  // Wait! The plan says we should remove the on-mount view tracking for Projects, because we'll trigger it explicitly on modal open!
  // But wait, what if the user hits the direct URL to the project? We need the View to count.
  // Actually, ProjectStats is ALWAYS rendered when the modal is open or when Flipbook is open.
  // If it's rendered on the main page grid, it will count a view for every card if we don't remove this.
  // BUT ProjectStats is NOT rendered on the grid, only inside ProjectViewerModal! So the on-mount logic is PERFECT because the modal only mounts on click!
  useEffect(() => {
    // Only count once per session — use sessionStorage as guard
    if (sessionStorage.getItem(ssViewKey)) return;
    sessionStorage.setItem(ssViewKey, "1");

    fetch(`${apiBasePath}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setViews(data.totalViews);
      })
      .catch(() => {});
  }, [apiBasePath, ssViewKey]);

  const handleLike = async () => {
    if (liked) return;
    
    // Optimistic UI update
    setLiked(true);
    setLikes((prev) => prev + 1);
    setLikeAnimate(true);
    setTimeout(() => setLikeAnimate(false), 1000); // Reset animation state
    
    localStorage.setItem(lsLikeKey, "1");

    try {
      const res = await fetch(`${apiBasePath}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLikes(data.totalLikes);
      }
    } catch (err) {
      console.error(err);
      // Revert if failed
      setLiked(false);
      setLikes((prev) => prev - 1);
      localStorage.removeItem(lsLikeKey);
    }
  };

  const handleShare = async () => {
    // Determine the deep-link URL. Depending on targetType, we might share a project or a direct link to the media (PDF)
    // For now, if it's a PDF we just share the project link with a hash, or just the project link.
    // The requirement says "شير لكل Pdf", let's append #pdf=mediaId or just share the project URL. 
    // Actually, sharing the project URL is fine, maybe we add ?pdf=id if we want.
    const urlToShare = targetType === "PROJECT" 
      ? `${window.location.origin}/${serviceSlug}#project=${projectId}`
      : `${window.location.origin}/${serviceSlug}#pdf=${projectId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("common.exploreOurWork"),
          url: urlToShare,
        });
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(urlToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    try {
      const res = await fetch(`${apiBasePath}/share`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setShares(data.totalShares);
      }
    } catch (err) {
      console.error(err);
    }
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
