import UploadForm from "../components/UploadForm";

export default function HomePage() {
  return (
    <div>
      <h1>カクヨムリーダー</h1>
      <p>
        スクレイピング用notebookで作成した「HTML版zip」または「txt版zip」をアップロードすると、
        このサイトでそのまま読めます。ファイルはサーバーには送信されず、
        ブラウザ内(IndexedDB)だけに保存されます。
      </p>
      <UploadForm />
    </div>
  );
}
