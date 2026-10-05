import "./globals.css";
import Toolbar from "../components/Toolbar";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

export const metadata = {
  title: "カクヨムリーダー",
  description: "アップロードした小説zipをブラウザだけで読めるリーダーサイト",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#3b2f1c",
};

// テーマ適用前の白画面フラッシュを防ぐため、hydration前に即実行する
const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem('kkm_theme') || 'light';
    var fontSize = localStorage.getItem('kkm_fontsize') || '1.05';
    var width = localStorage.getItem('kkm_width') || 'normal';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--font-size', fontSize + 'em');
    document.documentElement.style.setProperty(
      '--kkm-width', width === 'wide' ? '60em' : (width === 'narrow' ? '28em' : '38em')
    );
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ServiceWorkerRegister />
        <Toolbar />
        <main className="kkm-reader">{children}</main>
      </body>
    </html>
  );
}
