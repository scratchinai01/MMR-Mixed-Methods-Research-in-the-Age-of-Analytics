// =====================================================================
// 三篇論文：原出處＋可下載的備份檔
// 備份檔在部署時上傳到 Firebase Storage（網址寫在 /data/paper_files.json）；
// 若 Firebase 尚未就緒，改用本站 /papers/ 的同一份檔案。
// 只放授權允許再散布的開放取用版本；非開放取用的論文只提供原出處連結。
// =====================================================================
import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, Lock, Flame } from 'lucide-react';

type PaperFile = { firebaseUrl?: string; localUrl?: string; bytes?: number };

const PAPERS = [
  {
    key: 'raman2022',
    cite: 'Raman, R., Aljafari, R., Venkatesh, V., & Richardson, V. (2022). Mixed-methods research in the age of analytics, an exemplar leveraging sentiments from news articles to predict firm performance. International Journal of Information Management, 64, 102451.',
    role: '主要復刻論文（判定：有爭議）',
    doi: 'https://doi.org/10.1016/j.ijinfomgt.2021.102451',
    license: 'CC BY-NC-ND 4.0 開放取用（可非商業再散布原檔）',
    local: '/papers/raman2022_ijim.pdf',
    shareable: true,
  },
  {
    key: 'afego2021',
    cite: 'Afego, P. N., & Alagidede, I. P. (2021). What does corporate social advocacy signal? Evidence from boycott participation decisions. Journal of Capital Markets Studies, 5(1), 49–68.',
    role: '對照論文（判定：屬於 MMR，整合偏弱）',
    doi: 'https://doi.org/10.1108/JCMS-10-2020-0040',
    license: 'CC BY 4.0 開放取用',
    local: '/papers/afego2021_jcms.pdf',
    shareable: true,
  },
  {
    key: 'wang2023',
    cite: 'Wang, X., Liu, H., & Chen, H. (2023). The impacts of logo dynamism and product types on brand market performance. Journal of Business Research, 166, 114060.',
    role: '對照論文',
    doi: 'https://doi.org/10.1016/j.jbusres.2023.114060',
    license: 'Elsevier 訂閱期刊：版權屬出版社，不提供檔案下載',
    local: '',
    shareable: false,
  },
];

export function PaperDownloads() {
  const [files, setFiles] = useState<Record<string, PaperFile>>({});
  const [localOk, setLocalOk] = useState<Record<string, boolean>>({});
  useEffect(() => {
    fetch('/data/paper_files.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((j: any) => setFiles(j && typeof j === "object" ? j : {}))
      .catch(() => setFiles({}));
    PAPERS.filter((p) => p.local).forEach((p) => {
      fetch(p.local, { method: 'HEAD' })
        .then((r) => setLocalOk((m) => ({ ...m, [p.key]: r.ok && (r.headers.get('content-type') || '').includes('pdf') })))
        .catch(() => setLocalOk((m) => ({ ...m, [p.key]: false })));
    });
  }, []);

  return (
    <div className="space-y-3">
      {PAPERS.map((p) => {
        const f = files[p.key] || {};
        const fb = f.firebaseUrl;
        const local = f.localUrl || (localOk[p.key] ? p.local : '');
        return (
          <div key={p.key} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">{p.role}</span>
              <span className="text-slate-500">{p.license}</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">{p.cite}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a href={p.doi} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700">
                <ExternalLink className="w-3.5 h-3.5" />原出處（DOI）
              </a>
              {p.shareable ? (
                <>
                  {fb && (
                    <a href={fb} target="_blank" rel="noreferrer" download
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold">
                      <Flame className="w-3.5 h-3.5" />Firebase 下載 PDF
                    </a>
                  )}
                  {local && (
                    <a href={local} target="_blank" rel="noreferrer" download
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      <Download className="w-3.5 h-3.5" />{fb ? '本站備份' : '下載 PDF'}
                    </a>
                  )}
                  {!fb && !local && <span className="text-slate-400">檔案準備中（下次部署後自動出現）</span>}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500"><Lock className="w-3.5 h-3.5" />請透過學校圖書館以原出處取得</span>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-slate-500">檔案為出版社開放取用的原版 PDF，未經修改；引用時請以原出處（DOI）為準。</p>
    </div>
  );
}
