"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { loadWork } from "../../../lib/db";

export default function ReadPage() {
  const params = useParams();
  const num = parseInt(params.num, 10);
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

  const idx = work.episodes.findIndex((e) => e.num === num);
  const episode = work.episodes[idx];

  if (!episode) {
    return (
      <div>
        <p>指定された話が見つかりません。</p>
        <Link href="/work">目次へ戻る</Link>
      </div>
    );
  }

  const prev = work.episodes[idx - 1];
  const next = work.episodes[idx + 1];

  return (
    <div>
      <h1>{episode.title}</h1>
      <div className="body" dangerouslySetInnerHTML={{ __html: episode.bodyHtml }} />
      <div className="kkm-nav">
        <span>{prev ? <Link href={`/read/${prev.num}`}>← 前話</Link> : <span />}</span>
        <Link href="/work">目次</Link>
        <span>{next ? <Link href={`/read/${next.num}`}>次話 →</Link> : <span />}</span>
      </div>
    </div>
  );
}
