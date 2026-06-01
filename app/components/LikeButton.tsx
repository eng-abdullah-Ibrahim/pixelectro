"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import styles from "./LikeButton.module.css";

export default function LikeButton({
  projectId,
  initialLikes,
  initialFakeLikes,
}: {
  projectId: string;
  initialLikes: number;
  initialFakeLikes: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes + initialFakeLikes);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Check local storage to see if visitor already liked this project
    const hasLiked = localStorage.getItem(`pxl_like_${projectId}`);
    if (hasLiked) {
      setLiked(true);
    }
  }, [projectId]);

  const handleLike = async () => {
    if (liked) return;

    // Optimistic UI updates
    setLiked(true);
    setLikes((prev) => prev + 1);
    setAnimate(true);
    
    // Save to local storage
    localStorage.setItem(`pxl_like_${projectId}`, "true");

    try {
      const res = await fetch(`/api/projects/${projectId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        // Sync with exact count from server (real + fake)
        setLikes(data.totalLikes);
      }
    } catch (err) {
      console.error("Failed to submit like:", err);
    }

    setTimeout(() => setAnimate(false), 600);
  };

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`${styles.likeBtn} ${liked ? styles.liked : ""} ${
        animate ? styles.pop : ""
      }`}
      aria-label="Like this project"
    >
      <Heart
        className={`${styles.heartIcon} ${liked ? styles.filled : ""}`}
        size={18}
      />
      <span className={styles.count}>{likes}</span>
    </button>
  );
}
