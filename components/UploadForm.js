"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseZipFile } from "../lib/parseZip";
import { saveWork } from "../lib/db";

export default function UploadForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setStatus("error");
      setMessage(".zip ファイルを選択してください。");
      return;
    }
    setStatus("loading");
    setMessage("zipを読み込んでいます…");
    try {
      const work = await parseZipFile(file);
      await saveWork(work);
      router.push("/work");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "zipの読み込みに失敗しました。");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div
        className="upload-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <p>
          ここに zip ファイルをドラッグ＆ドロップ
          <br />
          またはクリックして選択
        </p>
      </div>
      {status === "loading" && <p className="upload-status">{message}</p>}
      {status === "error" && (
        <p className="upload-status upload-error">{message}</p>
      )}
    </div>
  );
}
