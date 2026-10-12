#!/usr/bin/env python3
"""
台股復刻 Raman et al. (2022)：新聞情緒 × 財務指標 → 超額報酬
=====================================================================
這支腳本用 FinMind 的「真實資料」做兩件事，結果寫入 public/data/ml_results.json，
網頁「論文報告」與「台股復刻」會自動顯示（沒跑過時會標示「尚未計算」，不顯示假數字）。

  A. 表 2 復刻（GEE 計量模型）
     依變數：新聞日後 5 個交易日的「標準化累積超額報酬」(SCAR，相對 0050，除以該股 60 日波動度)
     自變數：Positive / Negative（當日正面、負面新聞比例）、PE_ratio、MB_ratio、Sales_growth（月營收年增率）、
            Prior_SCAR（前 5 日超額報酬）、Size（市值對數），以及論文的 6 個交互作用項
     三種相關結構：Independence / AR(1) / Exchangeable（與論文表 2 相同）

  B. 表 7–8 復刻（機器學習分類）
     預測 SCAR 是否為正；比較「純財務量化」與「量化＋新聞情緒」兩組特徵
     依時間切分：前 70% 日期訓練、後 30% 日期測試（避免偷看未來）

在 Cloud Shell 執行（FinMind Sponsor 每小時 6,000 次，10 檔 × 365 天約 3,700 次）：
  cd ~/mmr && git pull
  pip install --user pandas scikit-learn statsmodels requests
  export FINMIND_API_TOKEN=你的Token
  export GEMINI_API_KEY=你的Gemini金鑰    # 可省略，省略則用關鍵詞判讀情緒
  python3 news_ml_study.py                # 預設：台灣 50 前 10 大權值股 × 最近 365 天
  git add public/data/ml_results.json && git commit -m "更新台股復刻結果" && git push

也可以餵入自己整理好的新聞 JSON（需含 date、title、stock_id 欄位）：
  python3 news_ml_study.py --input my_news.json

抓到的資料存在 .cache/，中斷後重跑同一指令會從中斷處繼續。
"""
import argparse
import hashlib
import json
import os
import re
import sys
import threading
import time
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta, timezone

try:
    import numpy as np
    import pandas as pd
    import requests
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, roc_auc_score
    from sklearn.neural_network import MLPClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.svm import SVC
except ImportError as e:
    sys.exit(f"缺少套件：{e.name}。請先執行：pip install --user pandas scikit-learn statsmodels requests")

warnings.filterwarnings("ignore")

FINMIND_URL = os.environ.get("FINMIND_BASE_URL", "https://api.finmindtrade.com/api/v4/data")
GEMINI_URL = os.environ.get("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
# 情緒判讀是簡單分類，用最便宜的 Flash-Lite、最低思考程度即可
GEMINI_MODEL = os.environ.get("GEMINI_TRANSLATE_MODEL") or "gemini-3.1-flash-lite"
CACHE = ".cache"
BENCHMARK = "0050"
HORIZON = 5  # SCAR 視窗：新聞日後幾個交易日

# 預設樣本：台灣 50 市值前段班（跨半導體、電子代工、金融、電信）
DEFAULT_STOCKS = "2330,2317,2454,2308,2382,2891,2881,2412,3711,2882"
STOCK_NAMES = {"2330": "台積電", "2454": "聯發科", "2317": "鴻海", "2382": "廣達", "2308": "台達電",
               "2303": "聯電", "2881": "富邦金", "2882": "國泰金", "3711": "日月光投控", "2412": "中華電",
               "2891": "中信金", "2886": "兆豐金", "1301": "台塑", "2002": "中鋼", "3008": "大立光"}

POS_WORDS = ["成長", "突破", "獲利", "擴大", "優於預期", "大增", "新高", "樂觀", "強勁", "量產", "領先",
             "漲", "擴產", "買超", "上修", "調升", "看好", "利多", "創高", "攀升"]
NEG_WORDS = ["下修", "重挫", "衰退", "放緩", "暴跌", "虧損", "訴訟", "疲弱", "壓力", "承壓", "短缺", "保守",
             "跌", "賣超", "調降", "利空", "減少", "下滑", "砍單", "示警"]


def log(msg):
    print(msg, flush=True)


class RateLimitError(Exception):
    pass


# ─────────────────────────── 1. FinMind 資料抓取（含快取、可平行） ───────────────────────────
def finmind(dataset, params, token, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(FINMIND_URL, params={"dataset": dataset, **params},
                             headers={"Authorization": f"Bearer {token}"} if token else {}, timeout=30)
            data = r.json()
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 * (attempt + 1))
            continue
        status = data.get("status", r.status_code)
        if status == 200:
            return data.get("data", [])
        msg = str(data.get("msg", ""))
        if status == 402 or "limit" in msg.lower() or "上限" in msg:
            raise RateLimitError(msg)
        raise RuntimeError(f"FinMind {dataset} 錯誤 {status}：{msg}")
    return []


_cache_lock = threading.Lock()
# 執行紀錄：寫進結果檔，供報告「資料蒐集流程」頁使用
STATS = {"finmindNew": 0, "finmindCached": 0, "geminiCalls": 0, "steps": {}}


def cached(path, fn):
    if os.path.exists(path):
        with _cache_lock:
            STATS["finmindCached"] += 1
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    data = fn()
    with _cache_lock:
        STATS["finmindNew"] += 1
    with _cache_lock:
        os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    return data


def fetch_news(stocks, start, end, token, max_per_day, workers=8):
    """逐日抓新聞（FinMind 每次只回傳一天），8 條平行連線；每檔每天最多保留 max_per_day 則"""
    days = (end - start).days + 1
    jobs = [(sid, (start + timedelta(days=i)).isoformat()) for sid in stocks for i in range(days)]
    today = date.today().isoformat()

    def one(job):
        sid, d = job
        path = f"{CACHE}/news/{sid}/{d}.json"
        fetch = lambda: finmind("TaiwanStockNews", {"data_id": sid, "start_date": d}, token)
        if d == today:
            items = fetch()
            with _cache_lock:
                STATS["finmindNew"] += 1
        else:
            items = cached(path, fetch)
        seen, out = set(), []
        for it in items:
            t = str(it.get("title", "")).strip()
            if not t or t in seen:
                continue
            seen.add(t)
            out.append({"stock_id": sid, "date": str(it.get("date", d))[:10], "title": t,
                        "source": it.get("source", ""), "link": it.get("link", "")})
        return out[:max_per_day]

    rows, done = [], 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [ex.submit(one, j) for j in jobs]
        for fu in as_completed(futures):
            rows.extend(fu.result())  # RateLimitError 會在這裡拋出
            done += 1
            if done % 50 == 0 or done == len(jobs):
                print(f"\r  新聞：{done}/{len(jobs)} 次查詢，累計 {len(rows)} 則", end="", flush=True)
    print()
    return rows


def fetch_dataset(dataset, sid, start, end, token):
    path = f"{CACHE}/{dataset}/{sid}_{start}_{end}.json"
    return cached(path, lambda: finmind(dataset, {"data_id": sid, "start_date": start.isoformat(),
                                                  "end_date": end.isoformat()}, token))


def fetch_prices(stocks, start, end, token):
    frames = []
    for sid in stocks + [BENCHMARK]:
        data = fetch_dataset("TaiwanStockPrice", sid, start, end, token)
        if not data:
            log(f"  ⚠️ {sid} 查無股價")
            continue
        frames.append(pd.DataFrame(data)[["date", "stock_id", "close", "Trading_Volume"]])
    px = pd.concat(frames)
    px["date"] = pd.to_datetime(px["date"])
    return px


def fetch_fundamentals(stocks, start, end, token):
    """月營收（算年增率）、本益比/淨值比、市值；任一資料集抓不到時該變數改為缺漏並在結果中註明"""
    rev, per, mv, missing = [], [], [], set()
    for sid in stocks:
        for ds, bucket, s0 in (("TaiwanStockMonthRevenue", rev, start - timedelta(days=430)),
                               ("TaiwanStockPER", per, start - timedelta(days=10)),
                               ("TaiwanStockMarketValue", mv, start - timedelta(days=10))):
            try:
                data = fetch_dataset(ds, sid, s0, end, token)
            except RateLimitError:
                raise
            except Exception as e:
                missing.add(ds)
                log(f"  ⚠️ {sid} {ds} 無法取得（{e}）")
                continue
            if data:
                bucket.append(pd.DataFrame(data))
            else:
                missing.add(ds)
    cat = lambda xs: pd.concat(xs) if xs else pd.DataFrame()
    return cat(rev), cat(per), cat(mv), sorted(missing)


# ─────────────────────────── 2. 情緒判讀（Gemini 或關鍵詞，含快取） ───────────────────────────
def keyword_score(title):
    title = title.replace("買賣超", "")  # 「三大法人買賣超」是欄目名稱，避免同時算成買超與賣超
    pos = sum(w in title for w in POS_WORDS)
    neg = sum(w in title for w in NEG_WORDS)
    return max(-0.95, min(0.95, (pos - neg) * 0.35))


def gemini_batch(titles, key):
    numbered = "\n".join(f"{i}. {t}" for i, t in enumerate(titles))
    body = {
        "systemInstruction": {"parts": [{"text": "你是台股財經新聞情緒分類器，依 Loughran-McDonald 金融情緒概念判斷每則標題對該公司股價的情緒。只輸出 JSON。"}]},
        "contents": [{"role": "user", "parts": [{"text": '請逐一分類以下新聞標題，輸出 {"items":[{"i":編號,"score":-1到1的數字}]}，正面為正、負面為負、中性為 0。\n\n' + numbered}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json",
                             "thinkingConfig": {"thinkingLevel": "MINIMAL"}},
    }
    for attempt in range(6):
        try:
            r = requests.post(f"{GEMINI_URL}/models/{GEMINI_MODEL}:generateContent", json=body,
                              headers={"x-goog-api-key": key}, timeout=90)
        except requests.RequestException:
            time.sleep(5 * (attempt + 1))
            continue
        if r.status_code in (429, 500, 503):  # 每分鐘額度上限或暫時性錯誤：等一下再試
            time.sleep(min(60, 10 * (attempt + 1)))
            continue
        r.raise_for_status()
        parts = r.json()["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
        text = re.sub(r"```(?:json)?", "", text).strip()
        items = json.loads(re.search(r"\{[\s\S]*\}", text).group(0)).get("items", [])
        return {int(it["i"]): max(-1.0, min(1.0, float(it.get("score", 0)))) for it in items if "i" in it}
    raise RuntimeError("Gemini 多次重試仍失敗（可能超過額度）")


def score_titles(titles):
    path = f"{CACHE}/sentiment.json"
    cache = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    h = lambda t: hashlib.md5(t.encode("utf-8")).hexdigest()
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    engine = f"Gemini {GEMINI_MODEL}" if key else "關鍵詞情緒詞典"
    fallback_n = 0
    temp = {}  # API 失敗改用關鍵詞的結果不寫入快取，下次執行會再用 Gemini 重試
    todo = [t for t in dict.fromkeys(titles) if h(t) not in cache]
    if todo:
        log(f"  需判讀 {len(todo)} 則（已快取 {len(set(titles)) - len(todo)} 則），引擎：{engine}")
    for b in range(0, len(todo), 80):
        batch = todo[b:b + 80]
        scores = {}
        if key:
            try:
                STATS["geminiCalls"] += 1
                scores = gemini_batch(batch, key)
            except Exception as e:
                log(f"\n  ⚠️ Gemini 失敗（{e}），此批改用關鍵詞")
        for i, t in enumerate(batch):
            if i in scores:
                cache[h(t)] = scores[i]
            else:
                fallback_n += 1
                (temp if key else cache)[h(t)] = keyword_score(t)
        print(f"\r  情緒判讀 {min(b + 80, len(todo))}/{len(todo)}", end="", flush=True)
        os.makedirs(CACHE, exist_ok=True)
        json.dump(cache, open(path, "w", encoding="utf-8"))
    if todo:
        print()
    if key and fallback_n:
        engine += f"（其中 {fallback_n} 則因 API 失敗改用關鍵詞）"
    return [cache.get(h(t), temp.get(h(t), 0.0)) for t in titles], engine


# ─────────────────────────── 3. 建立「個股 × 新聞交易日」面板 ───────────────────────────
def build_panel(news, px, rev, per, mv):
    bench = px[px.stock_id == BENCHMARK].set_index("date")["close"].sort_index()
    panels = []
    for sid, g in px[px.stock_id != BENCHMARK].groupby("stock_id"):
        g = g.set_index("date").sort_index()
        c = g["close"].astype(float)
        b = bench.reindex(c.index).ffill()
        ex_daily = c.pct_change() - b.pct_change()          # 每日超額報酬（相對 0050）
        sigma = ex_daily.rolling(60, min_periods=40).std()   # 60 日波動度，用來標準化
        f = pd.DataFrame(index=c.index)
        fwd = (c.shift(-HORIZON) / c - 1) - (b.shift(-HORIZON) / b - 1)
        f["SCAR"] = fwd / (sigma * np.sqrt(HORIZON))
        prior = (c / c.shift(HORIZON) - 1) - (b / b.shift(HORIZON) - 1)
        f["Prior_SCAR"] = prior / (sigma * np.sqrt(HORIZON))
        f["stock_id"] = sid

        # 月營收年增率：第 m 月營收在次月 10 日前公布，之後才能使用（避免偷看未來）
        if not rev.empty and sid in set(rev.stock_id):
            r = rev[rev.stock_id == sid].copy()
            r["ym"] = r["revenue_year"].astype(int) * 12 + r["revenue_month"].astype(int)
            r = r.drop_duplicates("ym").set_index("ym").sort_index()
            r["yoy"] = r["revenue"].astype(float) / r["revenue"].reindex(r.index - 12).values - 1
            r["avail"] = [pd.Timestamp(year=int(ym // 12) if ym % 12 else int(ym // 12) - 1,
                                       month=int(ym % 12) or 12, day=1) + pd.DateOffset(months=1, days=9)
                          for ym in r.index]
            r = r.dropna(subset=["yoy"]).sort_values("avail")
            f = pd.merge_asof(f.reset_index().rename(columns={"index": "date"}).sort_values("date"),
                              r[["avail", "yoy"]].rename(columns={"avail": "date", "yoy": "Sales_growth"}),
                              on="date", direction="backward").set_index("date")
        else:
            f["Sales_growth"] = np.nan

        if not per.empty and sid in set(per.stock_id):
            pp = per[per.stock_id == sid].copy()
            pp["date"] = pd.to_datetime(pp["date"])
            pp = pp.set_index("date").sort_index()
            f["PE_ratio"] = pp["PER"].astype(float).reindex(f.index).ffill()
            f["MB_ratio"] = pp["PBR"].astype(float).reindex(f.index).ffill()
        else:
            f["PE_ratio"] = np.nan
            f["MB_ratio"] = np.nan

        if not mv.empty and sid in set(mv.stock_id):
            m = mv[mv.stock_id == sid].copy()
            m["date"] = pd.to_datetime(m["date"])
            m = m.set_index("date").sort_index()
            f["Size"] = np.log(m["market_value"].astype(float)).reindex(f.index).ffill()
        else:
            f["Size"] = np.nan

        # 新聞對應到「當天或之後的第一個交易日」；Positive / Negative = 當日正面 / 負面新聞比例
        n = news[news.stock_id == sid].copy()
        if n.empty:
            continue
        idx = c.index.searchsorted(pd.to_datetime(n["date"]))
        n = n[idx < len(c.index)]
        n["tday"] = c.index[idx[idx < len(c.index)]]
        agg = n.groupby("tday").agg(n_articles=("score", "size"), sent_mean=("score", "mean"),
                                    Positive=("score", lambda s: (s > 0.15).mean()),
                                    Negative=("score", lambda s: (s < -0.15).mean()))
        f = f.join(agg, how="inner")  # 只保留有新聞的交易日（事件樣本）
        panels.append(f)
    panel = pd.concat(panels)
    panel = panel.reset_index().rename(columns={"index": "date"})
    # 本益比為負或極端值很常見：截尾 1% / 99% 降低離群值影響
    for col in ("PE_ratio", "MB_ratio", "Sales_growth", "SCAR", "Prior_SCAR"):
        if panel[col].notna().any():
            lo, hi = panel[col].quantile([0.01, 0.99])
            panel[col] = panel[col].clip(lo, hi)
    return panel


# ─────────────────────────── 4. 表 2 復刻：GEE ───────────────────────────
MAIN_TERMS = ["Prior_SCAR", "Size", "Positive", "Negative", "PE_ratio", "Sales_growth", "MB_ratio"]
INTERACTIONS = [("PE_ratio", "Positive"), ("Sales_growth", "Positive"), ("MB_ratio", "Positive"),
                ("PE_ratio", "Negative"), ("Sales_growth", "Negative"), ("MB_ratio", "Negative")]


def stars(p):
    return "***" if p < 0.001 else "**" if p < 0.01 else "*" if p < 0.05 else "+" if p < 0.1 else ""


def run_gee(panel):
    try:
        import statsmodels.api as sm
        from statsmodels.genmod.cov_struct import Autoregressive, Exchangeable, Independence
    except ImportError:
        log("  ⚠️ 未安裝 statsmodels，略過表 2 復刻（pip install --user statsmodels）")
        return None
    base = panel[panel.SCAR.notna()]
    terms = [t for t in MAIN_TERMS if base[t].notna().mean() > 0.8]  # 缺漏太多的變數（例如抓不到市值）才排除
    dropped = [t for t in MAIN_TERMS if t not in terms]
    d = base.dropna(subset=terms).sort_values(["stock_id", "date"]).copy()
    if len(d) < 60 or d.stock_id.nunique() < 3:
        log(f"  ⚠️ GEE 樣本不足（{len(d)} 筆、{d.stock_id.nunique()} 檔），略過表 2 復刻")
        return None
    # 論文做法：交互作用項的變數先做平均數中心化
    X = pd.DataFrame(index=d.index)
    for t in terms:
        X[t] = d[t] - d[t].mean()
    inter_names = []
    for a, b in INTERACTIONS:
        if a in terms and b in terms:
            name = f"{a} X {b}"
            X[name] = X[a] * X[b]
            inter_names.append(name)
    X = sm.add_constant(X)
    groups = d["stock_id"].astype("category").cat.codes.values
    time_idx = d.groupby("stock_id").cumcount().values
    models = {}
    for key, label, cs in (("independence", "Model 1 (Independent)", Independence()),
                           ("ar1", "Model 2 (AR(1))", Autoregressive(grid=True)),
                           ("exchangeable", "Model 3 (Exchangeable)", Exchangeable())):
        try:
            kw = {"time": time_idx} if key == "ar1" else {}
            res = sm.GEE(d["SCAR"].values, X, groups=groups, cov_struct=cs,
                         family=sm.families.Gaussian(), **kw).fit()
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    qic = float(res.qic(scale=float(res.scale))[0])
            except Exception:
                qic = None
            rows = []
            for t in [*terms, *inter_names]:
                coef, se, p = float(res.params[t]), float(res.bse[t]), float(res.pvalues[t])
                rows.append({"term": t, "coef": coef, "se": se, "p": p, "stars": stars(p),
                             "display": f"{coef:.3f}{stars(p)} ({se:.3f})"})
            models[key] = {"label": label, "rows": rows, "qic": qic}
        except Exception as e:
            log(f"  ⚠️ {label} 無法估計：{e}")
    if not models:
        return None
    return {
        "n": int(len(d)), "firms": int(d.stock_id.nunique()),
        "period": {"start": str(d.date.min().date()), "end": str(d.date.max().date())},
        "dv": f"SCAR：新聞日後 {HORIZON} 個交易日相對 0050 的累積超額報酬，除以該股 60 日超額報酬波動度 × √{HORIZON}",
        "droppedTerms": dropped,
        "models": models,
        "descriptives": {t: {"mean": float(d[t].mean()), "sd": float(d[t].std())} for t in ["SCAR", *terms]},
    }


# ─────────────────────────── 5. 表 7–8 復刻：機器學習分類 ───────────────────────────
QUANT_BASE = ["Prior_SCAR", "Size", "PE_ratio", "Sales_growth", "MB_ratio"]
SENT = ["Positive", "Negative", "sent_mean", "n_articles"]

MODELS = {
    "Boosted Decision Tree (梯度提升決策樹)": lambda: GradientBoostingClassifier(random_state=42),
    "Random Forest (隨機森林)": lambda: RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42),
    "Two-Class Logistic Regression (邏輯迴歸)": lambda: make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)),
    "Deep Neural Network (深度神經網路 MLP)": lambda: make_pipeline(StandardScaler(), MLPClassifier((32, 16), max_iter=2000, early_stopping=True, random_state=42)),
    "Support Vector Machine (支持向量機 SVM)": lambda: make_pipeline(StandardScaler(), CalibratedClassifierCV(SVC(random_state=42), cv=3, ensemble=False)),
}


def evaluate(panel):
    base = panel[panel.SCAR.notna()]
    quant = [t for t in QUANT_BASE if base[t].notna().mean() > 0.8]
    d = panel.dropna(subset=["SCAR"] + quant + SENT).copy()
    d["label"] = (d["SCAR"] > 0).astype(int)
    dates = np.sort(d["date"].unique())
    cut = dates[int(len(dates) * 0.7)]
    # 訓練集最後一天之後 HORIZON 天的標籤會用到測試期股價，留出間隔避免偷看
    gap_end = dates[min(len(dates) - 1, int(len(dates) * 0.7) + HORIZON)]
    train, test = d[d.date < cut], d[d.date >= gap_end]
    if len(train) < 30 or len(test) < 15 or train.label.nunique() < 2 or test.label.nunique() < 2:
        sys.exit(f"樣本太少（訓練 {len(train)}、測試 {len(test)} 筆）。請增加 --days 或 --stocks。")
    rows = []
    for name, make in MODELS.items():
        res = {}
        for tag, cols in (("quant", quant), ("text", quant + SENT)):
            m = make().fit(train[cols], train.label)
            p = m.predict_proba(test[cols])[:, 1]
            res[tag] = (accuracy_score(test.label, p > 0.5), roc_auc_score(test.label, p))
        d_acc = (res["text"][0] - res["quant"][0]) * 100
        rows.append({
            "algorithm": name,
            "quantOnlyAcc": f"{res['quant'][0]:.1%}", "quantTextAcc": f"{res['text'][0]:.1%}",
            "quantOnlyAuc": f"{res['quant'][1]:.1%}", "quantTextAuc": f"{res['text'][1]:.1%}",
            "note": f"加入情緒後準確率 {'+' if d_acc >= 0 else ''}{d_acc:.1f} 個百分點",
            "raw": {"quantAcc": res["quant"][0], "textAcc": res["text"][0], "quantAuc": res["quant"][1], "textAuc": res["text"][1]},
        })
    base = max(test.label.mean(), 1 - test.label.mean())
    split = {"trainStart": str(pd.Timestamp(dates[0]).date()), "trainEnd": str(pd.Timestamp(train.date.max()).date()),
             "testStart": str(pd.Timestamp(test.date.min()).date()), "testEnd": str(pd.Timestamp(dates[-1]).date()),
             "trainN": int(len(train)), "testN": int(len(test)), "baselineAcc": f"{base:.1%}"}
    return rows, split, quant


# ─────────────────────────── 4. 讀入自備 JSON（含假資料檢查） ───────────────────────────
def load_input(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    items = data.get("finmindCorpusArticles") or data.get("articles") or data.get("news") if isinstance(data, dict) else data
    if not items:
        sys.exit("JSON 內找不到新聞清單（需要 finmindCorpusArticles、articles、news 或直接是陣列）")
    target = re.search(r"\((\d{4})\)", data.get("targetStock", "")) if isinstance(data, dict) else None
    rows = []
    for it in items:
        title = re.sub(r"^\[第 \d+ 篇\]\s*", "", str(it.get("title", "")))
        sid = str(it.get("stock_id") or (target.group(1) if target else "")).strip()
        try:
            d = datetime.strptime(str(it.get("date", ""))[:10], "%Y-%m-%d").date()
        except ValueError:
            continue  # 例如 2026-13-28 這種不存在的日期
        rows.append({"stock_id": sid, "date": d.isoformat(), "title": title, "source": it.get("source", ""), "link": it.get("link", "")})
    uniq = len({r["title"] for r in rows})
    if rows and uniq / len(rows) < 0.3:
        sys.exit(f"⚠️ 這份檔案有 {len(rows)} 則新聞，但只有 {uniq} 種不同標題，看起來是模擬產生的資料，不是真實新聞。\n"
                 "   請改用 --stocks 讓腳本直接從 FinMind 抓取真實新聞。")
    if any(not r["stock_id"] for r in rows):
        sys.exit("有新聞缺少 stock_id（股票代號），無法對應股價")
    return rows


# ─────────────────────────── 主程式 ───────────────────────────
def main():
    ap = argparse.ArgumentParser(description="台股復刻 Raman et al. (2022)：新聞情緒 × 財務指標 → 超額報酬")
    ap.add_argument("--stocks", default=DEFAULT_STOCKS, help="股票代號，逗號分隔（預設台灣 50 前 10 大權值股）")
    ap.add_argument("--days", type=int, default=365, help="往回抓幾天新聞（預設 365）")
    ap.add_argument("--max-per-day", type=int, default=8, help="每檔每天最多採用幾則新聞（預設 8，控制情緒判讀成本）")
    ap.add_argument("--input", help="改用自備新聞 JSON，不從 FinMind 抓新聞")
    ap.add_argument("--out", default="public/data/ml_results.json")
    args = ap.parse_args()

    token = os.environ.get("FINMIND_API_TOKEN", "").strip()
    if not token:
        sys.exit("請先設定 FinMind Token：export FINMIND_API_TOKEN=你的Token")

    end = datetime.now(timezone(timedelta(hours=8))).date()
    t_start = time.time()
    started_at = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
    mark = {"t": time.time()}

    def step_done(name):
        STATS["steps"][name] = round(time.time() - mark["t"], 1)
        mark["t"] = time.time()

    try:
        log("▶ Step 1 新聞資料")
        if args.input:
            news_rows = load_input(args.input)
            stocks = sorted({r["stock_id"] for r in news_rows})
            start = min(date.fromisoformat(r["date"]) for r in news_rows)
            log(f"  自 {args.input} 讀入 {len(news_rows)} 則（{', '.join(stocks)}）")
        else:
            stocks = [s.strip() for s in args.stocks.split(",") if s.strip()]
            start = end - timedelta(days=args.days - 1)
            log(f"  {len(stocks)} 檔 × {args.days} 天 = {len(stocks) * args.days} 次查詢（已快取的不會重抓）")
            news_rows = fetch_news(stocks, start, end, token, args.max_per_day)
        news = pd.DataFrame(news_rows).drop_duplicates(["stock_id", "date", "title"])
        news = news[news.title.str.len() > 0]
        log(f"  共 {len(news)} 則不重複新聞")
        step_done("news")

        log("▶ Step 2 情緒判讀")
        news["score"], engine = score_titles(news.title.tolist())
        step_done("sentiment")

        log("▶ Step 3 股價、月營收、本益比/淨值比、市值")
        px = fetch_prices(stocks, start - timedelta(days=120), end, token)
        rev, per, mv, missing = fetch_fundamentals(stocks, start - timedelta(days=120), end, token)
        step_done("financials")
    except RateLimitError as e:
        sys.exit(f"\n⚠️ FinMind 回報已達請求上限：{e}\n   已抓到的資料都存在 {CACHE}/，請等一小時後再執行同一個指令，會從中斷處繼續。")

    panel = build_panel(news, px, rev, per, mv)
    log(f"  有新聞且可算出 {HORIZON} 日 SCAR 的樣本：{panel.SCAR.notna().sum()} 筆（個股 × 交易日）")

    log("▶ Step 4 表 2 復刻（GEE）")
    gee = run_gee(panel)
    step_done("gee")
    if gee:
        m = gee["models"].get("exchangeable") or next(iter(gee["models"].values()))
        for r in m["rows"]:
            log(f"  {r['term']:<28} {r['display']}")

    log("▶ Step 5 表 7–8 復刻（機器學習，時間切分 70/30）")
    rows, split, quant = evaluate(panel)
    step_done("ml")
    for r in rows:
        log(f"  {r['algorithm']:<42} 準確率 {r['quantOnlyAcc']} → {r['quantTextAcc']}｜AUC {r['quantOnlyAuc']} → {r['quantTextAuc']}")
    log(f"  基準（全部猜多數類別）準確率：{split['baselineAcc']}")

    per_stock = news.groupby("stock_id").agg(articles=("title", "size"), sentiment=("score", "mean"))
    out = {
        "generatedAt": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="minutes"),
        "isDemo": False,
        "stocks": [{"id": s, "name": STOCK_NAMES.get(s, ""),
                    "articles": int(per_stock.articles.get(s, 0)),
                    "meanSentiment": round(float(per_stock.sentiment.get(s, 0) or 0), 3)} for s in stocks],
        "period": {"start": start.isoformat(), "end": end.isoformat()},
        "articleCount": int(len(news)),
        "sentimentShare": {"positive": float((news.score > 0.15).mean()), "negative": float((news.score < -0.15).mean())},
        "sampleCount": int(panel.SCAR.notna().sum()),
        "sentimentEngine": engine,
        "maxPerDay": args.max_per_day,
        "missingDatasets": missing,
        "target": f"新聞日後 {HORIZON} 個交易日的標準化累積超額報酬 (SCAR) 是否為正",
        "split": split,
        "features": {"quant": quant, "sentiment": SENT},
        "rows": rows,
        "gee": gee,
        "runLog": {
            "startedAt": started_at,
            "totalSeconds": round(time.time() - t_start, 1),
            "stepSeconds": STATS["steps"],
            "finmindQueries": {"new": STATS["finmindNew"], "fromCache": STATS["finmindCached"]},
            "newsQueriesPlanned": len(stocks) * ((end - start).days + 1) if not args.input else 0,
            "geminiCalls": STATS["geminiCalls"],
            "datasets": ["TaiwanStockNews", "TaiwanStockPrice", "TaiwanStockMonthRevenue", "TaiwanStockPER", "TaiwanStockMarketValue"],
            "runner": "GitHub Actions" if os.environ.get("GITHUB_ACTIONS") else "本機／Cloud Shell",
            "runUrl": (f"{os.environ.get('GITHUB_SERVER_URL')}/{os.environ.get('GITHUB_REPOSITORY')}/actions/runs/{os.environ.get('GITHUB_RUN_ID')}"
                       if os.environ.get("GITHUB_RUN_ID") else None),
        },
        "articles": [{"stock_id": r.stock_id, "date": r.date, "title": r.title, "source": r.source, "link": r.link,
                      "score": round(float(r.score), 2)} for r in news.sort_values("date", ascending=False).head(3000).itertuples()],
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    # 執行歷史（保留最近 60 次），報告可呈現「首次完整抓取」與每日更新的紀錄
    hist_path = os.path.join(os.path.dirname(args.out), "run_history.json")
    try:
        history = json.load(open(hist_path, encoding="utf-8"))
    except Exception:
        history = []
    history.append({
        "startedAt": out["runLog"]["startedAt"], "totalSeconds": out["runLog"]["totalSeconds"],
        "finmindNew": STATS["finmindNew"], "finmindFromCache": STATS["finmindCached"],
        "geminiCalls": STATS["geminiCalls"], "articles": out["articleCount"], "samples": out["sampleCount"],
        "runner": out["runLog"]["runner"], "runUrl": out["runLog"]["runUrl"],
    })
    with open(hist_path, "w", encoding="utf-8") as f:
        json.dump(history[-60:], f, ensure_ascii=False, indent=1)
    log(f"\n✅ 完成！結果已寫入 {args.out}")
    log("   推送到 GitHub 後（git add / commit / push），網站會自動更新「論文報告」與「台股復刻」的真實結果。")


if __name__ == "__main__":
    main()
