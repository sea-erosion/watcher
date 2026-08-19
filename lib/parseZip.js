import JSZip from "jszip";

// notebookが出力するファイル名 (001.html / 001.txt など、3〜4桁の連番) にマッチ
const EPISODE_RE = /(^|\/)(\d{3,4})\.(html|txt)$/i;

export async function parseZipFile(file) {
  const zip = await JSZip.loadAsync(file);

  const entries = Object.values(zip.files).filter(
    (f) => !f.dir && EPISODE_RE.test(f.name) && !/_all_part/i.test(f.name)
  );

  if (entries.length === 0) {
    throw new Error(
      "zip内に話数ファイル(001.html や 001.txt など)が見つかりませんでした。"
    );
  }

  const isHtml = entries[0].name.toLowerCase().endsWith(".html");

  const episodes = [];
  for (const entry of entries) {
    const match = entry.name.match(EPISODE_RE);
    const num = parseInt(match[2], 10);
    const text = await entry.async("string");

    if (isHtml) {
      episodes.push({ num, ...parseEpisodeHtml(text, num) });
    } else {
      episodes.push({ num, ...parseEpisodeTxt(text, num) });
    }
  }

  episodes.sort((a, b) => a.num - b.num);

  const workTitle = await guessWorkTitle(zip, entries, file.name);

  return { title: workTitle, episodes, savedAt: Date.now() };
}

function parseEpisodeHtml(text, num) {
  const doc = new DOMParser().parseFromString(text, "text/html");
  const titleEl =
    doc.querySelector(".kkm-reader h1") || doc.querySelector("h1");
  const bodyEl =
    doc.querySelector(".kkm-reader .body") || doc.querySelector(".body");
  return {
    title: titleEl ? titleEl.textContent.trim() : `第${num}話`,
    bodyHtml: bodyEl ? bodyEl.innerHTML.trim() : "",
  };
}

function parseEpisodeTxt(text, num) {
  const [titleLine, ...rest] = text.split("\n");
  const body = rest.join("\n").replace(/^\n+/, "");
  return {
    title: (titleLine || "").trim() || `第${num}話`,
    bodyHtml: textBodyToHtml(body),
  };
}

function textBodyToHtml(body) {
  return body
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      // 「｜土台《読み》」形式(notebookのscrape_episodeが出力する記法)からルビタグへ変換する。
      // ｜が土台の開始位置を明示しているため、土台の文字種によらず正しく変換できる。
      const withRuby = escaped.replace(
        /｜([^《》]+)《([^《》]+)》/g,
        "<ruby>$1<rt>$2</rt></ruby>"
      );
      const withBold = withRuby.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return withBold.trim() === "" ? "<p>&nbsp;</p>" : `<p>${withBold}</p>`;
    })
    .join("\n");
}

async function guessWorkTitle(zip, entries, fileName) {
  // 1. index.html があればそのタイトルを使う
  const indexEntries = zip.file(/index\.html$/i);
  if (indexEntries && indexEntries.length > 0) {
    try {
      const indexText = await indexEntries[0].async("string");
      const doc = new DOMParser().parseFromString(indexText, "text/html");
      const h1 = doc.querySelector(".kkm-reader h1") || doc.querySelector("h1");
      if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    } catch {
      // 失敗しても他の方法にフォールバック
    }
  }

  // 2. zip内のフォルダ名(作品名フォルダ)から推定
  const folderMatch = entries[0].name.match(
    /^(?:.*\/)?([^/]+)\/\d{3,4}\.(?:html|txt)$/
  );
  if (folderMatch) return folderMatch[1];

  // 3. zipファイル名から拡張子を除いたものを使う
  return fileName.replace(/\.zip$/i, "");
}
