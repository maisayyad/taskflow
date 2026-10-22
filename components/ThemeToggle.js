"use client";

"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // قراءة الوضع الحالي من صفحة HTML أو التخزين المحلي
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("taskflow-theme", nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        fontSize: "16px",
        backgroundColor: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s",
      }}
      title="Toggle theme"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
