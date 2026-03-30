// FurnitureList.jsx
// 가구 데이터 상수 모음 – 필요 시 다른 컴포넌트에서 import해 사용

export const FURNITURE_CATEGORIES = [
  {
    category: "침실",
    icon: "🛏",
    items: [
      { name: "싱글 침대",  emoji: "🛏", w: 100, h: 200, color: "#d4b896" },
      { name: "더블 침대",  emoji: "🛏", w: 140, h: 200, color: "#c9a87c" },
      { name: "옷장",       emoji: "🪞", w: 100, h: 60,  color: "#b8a898" },
      { name: "서랍장",     emoji: "🗄",  w: 80,  h: 50,  color: "#b8a898" },
      { name: "책상",       emoji: "🖥",  w: 120, h: 60,  color: "#c8b89a" },
      { name: "의자",       emoji: "🪑", w: 50,  h: 50,  color: "#d4a96e" },
    ],
  },
  {
    category: "거실",
    icon: "🛋",
    items: [
      { name: "2인 소파",     emoji: "🛋", w: 160, h: 80, color: "#c5b9a8" },
      { name: "3인 소파",     emoji: "🛋", w: 200, h: 80, color: "#b9ac9c" },
      { name: "TV장",         emoji: "📺", w: 140, h: 40, color: "#9a9a9a" },
      { name: "커피 테이블",  emoji: "🪵", w: 100, h: 60, color: "#c8a87c" },
    ],
  },
  {
    category: "주방",
    icon: "🍳",
    items: [
      { name: "냉장고",      emoji: "🧊", w: 60,  h: 70, color: "#c0c8d0" },
      { name: "식탁 (2인)",  emoji: "🍽", w: 80,  h: 80, color: "#d4c4a0" },
      { name: "식탁 (4인)",  emoji: "🍽", w: 120, h: 80, color: "#d4c4a0" },
    ],
  },
  {
    category: "수납/기타",
    icon: "📦",
    items: [
      { name: "책장",   emoji: "📚", w: 80, h: 30, color: "#b8a88a" },
      { name: "세탁기", emoji: "🫧", w: 60, h: 60, color: "#d0d8e0" },
      { name: "화장대", emoji: "🪞", w: 80, h: 50, color: "#e0d4c0" },
    ],
  },
];