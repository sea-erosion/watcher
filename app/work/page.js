"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadWork } from "../../lib/db";

export default function WorkPage() {
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWork().then((w) => {
      setWork(w);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>読み込み中…</p>;

  if (!work) {
    return (
      <div>
        <p>まだ作品がアップロードされていません。</p>
        <Link href="/">アップロードページへ</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{work.title}</h1>
      <ol>
        {work.episodes.map((ep) => (
          <li key={ep.num}>
            <Link href={`/read/${ep.num}`}>{ep.title}</Link>
          </li>
        ))}
      </ol>
      <p>
        <Link href="/">別の作品をアップロードする</Link>
      </p>
    </div>
  );
}
