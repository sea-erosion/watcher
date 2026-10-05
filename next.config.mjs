/** @type {import('next').NextConfig} */
const nextConfig = {
  // サーバーサイドの処理(動的ルートのサーバーレス関数など)を一切使わず、
  // 完全な静的ファイル一式としてビルドする。これにより全ページがPWAとして
  // 事前キャッシュ可能になり、特定の話を事前に開いていなくてもオフラインで動く。
  output: "export",
};

export default nextConfig;
