#!/usr/bin/env python3
"""
台股新聞情緒 × 機器學習 實證腳本（Raman et al., 2022 台股復刻版）
=====================================================================
做什麼：
  1. 從 FinMind 抓多支股票、多天的「真實新聞」（目標 500 則以上）與日收盤價
  2. 用 Groq 判讀每則標題的情緒（沒有 Groq 金鑰時改用關鍵詞）
  3. 建立兩組特徵：
       - 純量化：過去 1/5/20 日報酬、20 日波動度、成交量比
       - 量化＋情緒：再加上當日平均情緒、正面／負面新聞則數
  4. 預測目標：新聞日 t 之後 5 個交易日，個股報酬是否「贏過大盤 0050」
  5. 依「時間」切分：前 70% 日期訓練、後 30% 日期測試（避免偷看未來）
  6. 跑 5 種模型，比較兩組特徵的準確率與 AUC
  7. 結果寫入 public/data/ml_results.json，網頁上的比較表會自動改用真實結果

在 Cloud Shell 執行：
  cd ~/mmr
  pip install --user pandas scikit-learn requests
  export FINMIND_API_TOKEN=你的Token
  export GROQ_API_KEY=你的Groq金鑰        # 可省略，省略則用關鍵詞判讀情緒
  python3 news_ml_study.py --stocks 2330,2454,2317,2382 --days 90
  bash deploy.sh                           # 重新上架，網頁就會顯示新結果

也可以餵入自己整理好的新聞 JSON（需含 date、title、stock_id 欄位）：
  python3 news_ml_study.py --input my_news.json

注意：抓到的資料會存在 .cache/ 資料夾，重跑時不必重抓。
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
import warnings
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
    sys.exit(f"缺少套件：{e.name}。請先執行：pip install --user pandas scikit-learn requests")

warnings.filterwarnings("ignore", category=FutureWarning)

FINMIND_URL = os.environ.get("FINMIND_BASE_URL", "https://api.finmindtrade.com/api/v4/data")
GROQ_URL = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1") + "/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL") or "llama-3.3-70b-versatile"
CACHE = ".cache"
BENCHMARK = "0050"
HORIZON = 5  # 預測未來幾個交易日

STOCK_NAMES = {"2330": "台積電", "2454": "聯發科", "2317": "鴻海", "2382": "廣達", "2308": "台達電",
               "2303": "聯電", "2881": "富邦金", "2882": "國泰金", "3711": "日月光投控", "2412": "中華電"}

POS_WORDS = ["成長", "突破", "獲利", "擴大", "優於預期", "大增", "新高", "樂觀", "強勁", "量產", "領先",
             "漲", "擴產", "買超", "上修", "調升", "看好", "利多", "創高", "攀升"]
NEG_WORDS = ["下修", "重挫", "衰退", "放緩", "暴跌", "虧損", "訴訟", "疲弱", "壓力", "承壓", "短缺", "保守",
             "跌", "賣超", "調降", "利空", "減少", "下滑", "砍單", "示警"]


def log(msg):
    print(msg, flush=True)


# ─────────────────────────── 1. FinMind 資料抓取（含快取） ───────────────────────────
def finmind(dataset, params, token, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(FINMIND_URL, params={"dataset": dataset, **params},
                             headers={"Authorization": f"Bearer {token}"} if token else {}, timeout=30)
            data = r.json()
        except Exception as e:  # 網路錯誤：稍等重試
            if attempt == retries - 1:
                raise
            time.sleep(2 * (attempt + 1))
            continue
        status = data.get("status", r.status_code)
        if status == 200:
            return data.get("data", [])
        msg = str(data.get("msg", ""))
        if status == 402 or "limit" in msg.lower() or "上限" in msg:
            sys.exit(f"\n⚠️ FinMind 回報已達請求上限：{msg}\n   已抓到的資料都存在 {CACHE}/，請等一小時後再執行同一個指令，會從中斷處繼續。")
        raise RuntimeError(f"FinMind {dataset} 錯誤 {status}：{msg}")
    return []


def cached(path, fn):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    data = fn()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    return data


def fetch_news(stocks, start, end, token):
    rows = []
    days = (end - start).days + 1
    for sid in stocks:
        count = 0
        for i in range(days):
            d = (start + timedelta(days=i)).isoformat()
            # 今天的新聞還會增加，不寫入快取
            path = f"{CACHE}/news/{sid}/{d}.json"
            fetch = lambda: finmind("TaiwanStockNews", {"data_id": sid, "start_date": d}, token)
            items = fetch() if d == date.today().isoformat() else cached(path, fetch)
            for it in items:
                rows.append({"stock_id": sid, "date": str(it.get("date", d))[:10], "title": it.get("title", ""),
                             "source": it.get("source", ""), "link": it.get("link", "")})
            count += len(items)
            print(f"\r  {sid} {STOCK_NAMES.get(sid, '')}：{i + 1}/{days} 天，累計 {count} 則", end="", flush=True)
        print()
    return rows


def fetch_prices(stocks, start, end, token):
    frames = []
    for sid in stocks + [BENCHMARK]:
        path = f"{CACHE}/price/{sid}_{start}_{end}.json"
        data = cached(path, lambda: finmind("TaiwanStockPrice", {"data_id": sid, "start_date": start.isoformat(),
                                                                  "end_date": end.isoformat()}, token))
        if not data:
            log(f"  ⚠️ {sid} 查無股價")
            continue
        df = pd.DataFrame(data)[["date", "stock_id", "close", "Trading_Volume"]]
        frames.append(df)
    px = pd.concat(frames)
    px["date"] = pd.to_datetime(px["date"])
    return px


# ─────────────────────────── 2. 情緒判讀（Groq 或關鍵詞，含快取） ───────────────────────────
def keyword_score(title):
    pos = sum(w in title for w in POS_WORDS)
    neg = sum(w in title for w in NEG_WORDS)
    return max(-0.95, min(0.95, (pos - neg) * 0.35))


def groq_keys():
    keys = [os.environ.get("GROQ_API_KEY", "")] + os.environ.get("GROQ_API_KEYS", "").split(",")
    return [k.strip() for k in keys if len(k.strip()) > 10]


def groq_batch(titles, keys):
    numbered = "\n".join(f"{i}. {t}" for i, t in enumerate(titles))
    body = {
        "model": GROQ_MODEL, "temperature": 0.1, "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": "你是台股財經新聞情緒分類器，依 Loughran-McDonald 金融情緒概念判斷每則標題對該公司股價的情緒。只輸出 JSON。"},
            {"role": "user", "content": '請逐一分類以下新聞標題，輸出 {"items":[{"i":編號,"score":-1到1的數字}]}，正面為正、負面為負、中性為 0。\n\n' + numbered},
        ],
    }
    for k in range(len(keys)):
        key = keys[(groq_batch.cursor + k) % len(keys)]
        r = requests.post(GROQ_URL, json=body, headers={"Authorization": f"Bearer {key}"}, timeout=60)
        if r.status_code in (401, 403, 429):
            time.sleep(1)
            continue
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"]
        text = re.sub(r"```(?:json)?", "", text).strip()
        items = json.loads(re.search(r"\{[\s\S]*\}", text).group(0)).get("items", [])
        groq_batch.cursor += 1
        return {int(it["i"]): max(-1.0, min(1.0, float(it.get("score", 0)))) for it in items if "i" in it}
    raise RuntimeError("所有 Groq 金鑰都無法使用（401/403/429）")


groq_batch.cursor = 0


def score_titles(titles):
    path = f"{CACHE}/sentiment.json"
    cache = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
    h = lambda t: hashlib.md5(t.encode("utf-8")).hexdigest()
    keys = groq_keys()
    engine = f"Groq {GROQ_MODEL}" if keys else "關鍵詞情緒詞典"
    todo = [t for t in dict.fromkeys(titles) if h(t) not in cache]
    if todo:
        log(f"  需判讀 {len(todo)} 則（已快取 {len(set(titles)) - len(todo)} 則），引擎：{engine}")
    for b in range(0, len(todo), 40):
        batch = todo[b:b + 40]
        scores = {}
        if keys:
            try:
                scores = groq_batch(batch, keys)
            except Exception as e:
                log(f"\n  ⚠️ Groq 失敗（{e}），此批改用關鍵詞")
        for i, t in enumerate(batch):
            cache[h(t)] = scores.get(i, keyword_score(t))
        print(f"\r  情緒判讀 {min(b + 40, len(todo))}/{len(todo)}", end="", flush=True)
        os.makedirs(CACHE, exist_ok=True)
        json.dump(cache, open(path, "w", encoding="utf-8"))
    if todo:
        print()
    return [cache[h(t)] for t in titles], engine


# ─────────────────────────── 3. 特徵與標籤 ───────────────────────────
def build_panel(news, px):
    bench = px[px.stock_id == BENCHMARK].set_index("date")["close"].sort_index()
    panels = []
    for sid, g in px[px.stock_id != BENCHMARK].groupby("stock_id"):
        g = g.set_index("date").sort_index()
        c, v = g["close"], g["Trading_Volume"].astype(float)
        b = bench.reindex(c.index).ffill()
        f = pd.DataFrame(index=c.index)
        f["ret_1d"] = c.pct_change(1)
        f["ret_5d"] = c.pct_change(5)
        f["ret_20d"] = c.pct_change(20)
        f["volatility_20d"] = c.pct_change().rolling(20).std()
        f["volume_ratio"] = v / v.rolling(20).mean()
        f["excess_5d_past"] = f["ret_5d"] - b.pct_change(5)
        fwd = (c.shift(-HORIZON) / c - 1) - (b.shift(-HORIZON) / b - 1)
        f["label"] = (fwd > 0).astype(float).where(fwd.notna())
        f["stock_id"] = sid

        # 新聞對應到「當天或之後的第一個交易日」
        n = news[news.stock_id == sid].copy()
        if n.empty:
            continue
        idx = c.index.searchsorted(pd.to_datetime(n["date"]))
        n = n[idx < len(c.index)]
        n["tday"] = c.index[idx[idx < len(c.index)]]
        agg = n.groupby("tday").agg(sent_mean=("score", "mean"), n_articles=("score", "size"),
                                    n_pos=("score", lambda s: (s > 0.15).sum()),
                                    n_neg=("score", lambda s: (s < -0.15).sum()))
        f = f.join(agg, how="inner")  # 只保留有新聞的交易日（事件樣本）
        panels.append(f)
    panel = pd.concat(panels).dropna()
    return panel.reset_index().rename(columns={"index": "date"})


QUANT = ["ret_1d", "ret_5d", "ret_20d", "volatility_20d", "volume_ratio", "excess_5d_past"]
SENT = ["sent_mean", "n_articles", "n_pos", "n_neg"]

MODELS = {
    "Boosted Decision Tree (梯度提升決策樹)": lambda: GradientBoostingClassifier(random_state=42),
    "Random Forest (隨機森林)": lambda: RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42),
    "Two-Class Logistic Regression (邏輯迴歸)": lambda: make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)),
    "Deep Neural Network (深度神經網路 MLP)": lambda: make_pipeline(StandardScaler(), MLPClassifier((32, 16), max_iter=2000, early_stopping=True, random_state=42)),
    "Support Vector Machine (支持向量機 SVM)": lambda: make_pipeline(StandardScaler(), CalibratedClassifierCV(SVC(random_state=42), cv=3, ensemble=False)),
}


def evaluate(panel):
    dates = np.sort(panel["date"].unique())
    cut = dates[int(len(dates) * 0.7)]
    # 訓練集最後一天之後 HORIZON 天的標籤會用到測試期股價，留出間隔避免偷看
    gap_end = dates[min(len(dates) - 1, int(len(dates) * 0.7) + HORIZON)]
    train, test = panel[panel.date < cut], panel[panel.date >= gap_end]
    if len(train) < 30 or len(test) < 15 or train.label.nunique() < 2 or test.label.nunique() < 2:
        sys.exit(f"樣本太少（訓練 {len(train)}、測試 {len(test)} 筆）。請增加 --days 或 --stocks。")
    rows = []
    for name, make in MODELS.items():
        res = {}
        for tag, cols in (("quant", QUANT), ("text", QUANT + SENT)):
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
    return rows, split


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
    ap = argparse.ArgumentParser(description="台股新聞情緒 × 機器學習實證")
    ap.add_argument("--stocks", default="2330,2454,2317,2382", help="股票代號，逗號分隔")
    ap.add_argument("--days", type=int, default=90, help="往回抓幾天新聞（預設 90）")
    ap.add_argument("--input", help="改用自備新聞 JSON，不從 FinMind 抓新聞")
    ap.add_argument("--out", default="public/data/ml_results.json")
    args = ap.parse_args()

    token = os.environ.get("FINMIND_API_TOKEN", "").strip()
    if not token:
        sys.exit("請先設定 FinMind Token：export FINMIND_API_TOKEN=你的Token")

    end = datetime.now(timezone(timedelta(hours=8))).date()
    log("▶ Step 1 新聞資料")
    if args.input:
        news_rows = load_input(args.input)
        stocks = sorted({r["stock_id"] for r in news_rows})
        start = min(date.fromisoformat(r["date"]) for r in news_rows)
        log(f"  自 {args.input} 讀入 {len(news_rows)} 則（{', '.join(stocks)}）")
    else:
        stocks = [s.strip() for s in args.stocks.split(",") if s.strip()]
        start = end - timedelta(days=args.days - 1)
        news_rows = fetch_news(stocks, start, end, token)
    news = pd.DataFrame(news_rows).drop_duplicates(["stock_id", "date", "title"])
    news = news[news.title.str.len() > 0]
    log(f"  共 {len(news)} 則不重複新聞")
    if len(news) < 100:
        log("  ⚠️ 新聞少於 100 則，結果會很不穩定，建議增加 --days 或 --stocks")

    log("▶ Step 2 情緒判讀")
    news["score"], engine = score_titles(news.title.tolist())

    log("▶ Step 3 股價與特徵")
    px = fetch_prices(stocks, start - timedelta(days=45), end, token)  # 多抓 45 天算 20 日指標
    panel = build_panel(news, px)
    log(f"  有新聞且可算出 {HORIZON} 日後超額報酬的樣本：{len(panel)} 筆（個股×交易日）")

    log("▶ Step 4 模型訓練（時間切分 70/30）")
    rows, split = evaluate(panel)
    for r in rows:
        log(f"  {r['algorithm']:<42} 準確率 {r['quantOnlyAcc']} → {r['quantTextAcc']}｜AUC {r['quantOnlyAuc']} → {r['quantTextAuc']}")
    log(f"  基準（全部猜多數類別）準確率：{split['baselineAcc']}")

    out = {
        "generatedAt": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="minutes"),
        "isDemo": False,
        "stocks": [{"id": s, "name": STOCK_NAMES.get(s, "")} for s in stocks],
        "period": {"start": start.isoformat(), "end": end.isoformat()},
        "articleCount": int(len(news)),
        "sampleCount": int(len(panel)),
        "sentimentEngine": engine,
        "target": f"新聞日後 {HORIZON} 個交易日，個股報酬是否贏過 {BENCHMARK}",
        "split": split,
        "features": {"quant": QUANT, "sentiment": SENT},
        "rows": rows,
        "articles": [{"stock_id": r.stock_id, "date": r.date, "title": r.title, "source": r.source, "link": r.link,
                      "score": round(float(r.score), 2)} for r in news.sort_values("date", ascending=False).itertuples()],
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    log(f"\n✅ 完成！結果已寫入 {args.out}")
    log("   執行 bash deploy.sh 重新上架後，網頁上的「台股機器學習預測精度對比」會改顯示這份結果。")


if __name__ == "__main__":
    main()
