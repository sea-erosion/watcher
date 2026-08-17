import "./globals.css";
import Toolbar from "../components/Toolbar";

export const metadata = {
  title: "カクヨムリーダー",
  description: "アップロードした小説zipをブラウザだけで読めるリーダーサイト",
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
        <Toolbar />
        <main className="kkm-reader">{children}</main>
      </body>
    </html>
  );
}
