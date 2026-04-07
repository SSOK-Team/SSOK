import { useState, useCallback } from "react";

/**
 * 즐겨찾기 훅 + UI (18번 기능)
 * useFavorites() — favorites Set, toggleFavorite, isFavorite
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => favorites.has(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}

/**
 * 즐겨찾기 별표 버튼
 */
export function FavoriteButton({ id, isFavorite, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(id); }}
      title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      style={{
        position: "absolute", top: 4, right: 4,
        background: "none", border: "none",
        cursor: "pointer", fontSize: 14, lineHeight: 1,
        color: isFavorite ? "#f59e0b" : "#ccc",
        zIndex: 2,
        transition: "color 0.15s",
      }}
    >★</button>
  );
}