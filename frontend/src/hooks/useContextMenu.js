import { useState, useCallback, useEffect } from "react";

/**
 * 우클릭 컨텍스트 메뉴 훅 (16번 기능)
 */
export function useContextMenu() {
  const [menu, setMenu] = useState(null); // { x, y, item }

  const openMenu = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!menu) return;
    const handler = () => closeMenu();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menu, closeMenu]);

  return { menu, openMenu, closeMenu };
}