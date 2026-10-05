"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadWork } from "../../lib/db";

// 静的エクスポートでは話数ごとにページを事前生成できない(アップロードするまで
// 話数が分からないため)。そこで/read/[num]のような動的ルートは使わず、
// 単一の静的ページ(/read)にして、どの話を表示するかはURLのクエリパラメータ
// (?num=5)をクライアント側のJSで読み取って決める。これにより
// このページ自体は1種類しか存在しないため、一度オンラインで開けば
// どの話番号を指定されてもオフラインで表示できるようになる。
export default function ReadPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <ReadPageInner />
    </Suspense>
  );
}

function ReadPageInner() {
  const searchParams = useSearchParams();
  const num = parseInt(searchParams.get("num"), 10);

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
        <span>{prev ? <Link href={`/read?num=${prev.num}`}>← 前話</Link> : <span />}</span>
        <Link href="/work">目次</Link>
        <span>{next ? <Link href={`/read?num=${next.num}`}>次話 →</Link> : <span />}</span>
      </div>
    </div>
  );
}
