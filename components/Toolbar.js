"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const THEMES = [
  { id: "light", label: "ライト" },
  { id: "sepia", label: "セピア" },
  { id: "dark", label: "ダーク" },
];

const WIDTHS = [
  { id: "narrow", label: "狭い", em: "28em" },
  { id: "normal", label: "標準", em: "38em" },
  { id: "wide", label: "広い", em: "60em" },
];

export default function Toolbar() {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(1.05);
  const [width, setWidth] = useState("normal");

  useEffect(() => {
    setTheme(localStorage.getItem("kkm_theme") || "light");
    setFontSize(parseFloat(localStorage.getItem("kkm_fontsize") || "1.05"));
    setWidth(localStorage.getItem("kkm_width") || "normal");
  }, []);

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("kkm_theme", t);
    setTheme(t);
  }

  function applyFont(delta) {
    setFontSize((cur) => {
      const next = Math.min(2.0, Math.max(0.7, Math.round((cur + delta) * 100) / 100));
      document.documentElement.style.setProperty("--font-size", next + "em");
      localStorage.setItem("kkm_fontsize", String(next));
      return next;
    });
  }

  function applyWidth(w) {
    const found = WIDTHS.find((x) => x.id === w);
    document.documentElement.style.setProperty("--kkm-width", found.em);
    localStorage.setItem("kkm_width", w);
    setWidth(w);
  }

  return (
    <div className="kkm-toolbar">
      <Link href="/" className="kkm-toolbar-brand">
        カクヨムリーダー
      </Link>
      <Link href="/work" className="kkm-toolbar-link">
        目次
      </Link>
      <div className="kkm-group">
        テーマ:
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={theme === t.id ? "kkm-active" : ""}
            onClick={() => applyTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="kkm-group">
        文字サイズ:
        <button onClick={() => applyFont(-0.1)}>－</button>
        <button onClick={() => applyFont(0.1)}>＋</button>
      </div>
      <div className="kkm-group">
        幅:
        {WIDTHS.map((w) => (
          <button
            key={w.id}
            className={width === w.id ? "kkm-active" : ""}
            onClick={() => applyWidth(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}
