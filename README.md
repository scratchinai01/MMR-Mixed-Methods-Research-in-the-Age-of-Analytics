# 台股論文復刻與沈浸式翻譯｜混合方法研究 (MMR)

復刻 Raman et al. (2022)《Mixed Methods Research in the Age of Analytics》的台股教學平台。
翻譯與 AI 解析由 **Gemini Flash-Lite** 提供（低成本設定），台股新聞與股價來自 **FinMind**。

## 本機執行

**需求：** Node.js（或 Bun）

1. 安裝套件：`npm install`（或 `bun install`）
2. 複製 `.env.example` 為 `.env`，填入金鑰：
   - `GEMINI_API_KEY`：到 https://aistudio.google.com/apikey 產生
   - `FINMIND_API_TOKEN`：到 https://finmindtrade.com/ 登入後取得
3. 啟動：`npm run dev`，開啟 http://localhost:3000

## 上架到 Google Cloud Run

1. 開啟 Google Cloud 主控台，確認專案是 `PayFireBase`，並已連結帳單帳戶（Cloud Run 需要，小流量通常在免費額度內）。
2. 按右上角「啟用 Cloud Shell」圖示，在下方終端機貼上：
   ```bash
   git clone https://github.com/scratchinai01/MMR-Mixed-Methods-Research-in-the-Age-of-Analytics.git mmr
   cd mmr && bash deploy.sh
   ```
3. 依提示貼上金鑰（畫面不會顯示），等待 3～6 分鐘，最後會印出網址。

更新版本：`cd mmr && git pull && bash deploy.sh`，金鑰直接按 Enter 會沿用上次設定。

### 自動更新（只需設定一次）

在 Cloud Shell 執行 `cd ~/mmr && git pull && bash setup-auto-deploy.sh`。
之後 GitHub 的 main 只要有新版本，GitHub Actions 就會自動重新部署（約 5 分鐘），進度在 GitHub 的「Actions」分頁。
金鑰沿用 Cloud Run 上的設定；要更換金鑰時再執行一次 `bash deploy.sh` 即可。

## 台股復刻（論文報告第二、三部分的真實數字）

「論文報告」為兩小時三段式簡報：原文報告 40 分、台股復刻 60 分、復刻後比較 20 分，每頁左邊是原著、右邊是台股復刻。
右邊的數字全部來自 `public/data/ml_results.json`，由 `news_ml_study.py` 以 FinMind 真實資料計算；沒有這個檔案時一律顯示「尚未計算」。

腳本會同時完成：
- **表 2 復刻（GEE）**：SCAR（新聞日後 5 日、相對 0050、以 60 日波動度標準化）對 Positive / Negative、PE、MB、月營收年增率、Prior_SCAR、Size 與 6 個交互作用項，三種相關結構（Independent / AR(1) / Exchangeable）
- **表 7–8 復刻（機器學習）**：預測 SCAR 是否為正，比較純財務與財務＋情緒，依時間切分並報告基準準確率

在 Cloud Shell 執行（預設台灣 50 前 10 大權值股 × 最近 365 天，約 3,700 次 FinMind 查詢）：

```bash
cd ~/mmr && git pull
pip install --user pandas scikit-learn statsmodels requests
export FINMIND_API_TOKEN=你的Token
export GEMINI_API_KEY=你的Gemini金鑰   # 可省略，省略則用關鍵詞判讀情緒
python3 news_ml_study.py
git add public/data/ml_results.json && git commit -m "更新台股復刻結果" && git push
```

推送後網站會自動重新部署（需先做過「自動更新」設定）。抓過的資料存在 `.cache/`，中斷後重跑同一指令會從中斷處繼續。
可用 `--stocks`、`--days`、`--max-per-day` 調整樣本範圍。

## AI 模型與成本

全部使用 Gemini，預設選最便宜的 Flash-Lite，並依工作調整思考程度：

| 工作 | 預設模型 | 思考程度 |
|---|---|---|
| 翻譯、新聞情緒判讀、追問題目 | `gemini-3.1-flash-lite` | MINIMAL |
| 學術解析、論文診斷 | `gemini-3.1-flash-lite` | LOW |

主要模型失敗時會改用 `gemini-3.5-flash-lite` 再試一次；都失敗時改用內建範本回覆。
可用 `GEMINI_TRANSLATE_MODEL`、`GEMINI_ANALYSIS_MODEL`、`GEMINI_ANALYSIS_THINKING` 調整（見 `.env.example`）。

## API 一覽

| 路徑 | 說明 |
|---|---|
| `GET /api/ai/status` | 目前啟用的 AI 供應商與金鑰狀態 |
| `POST /api/gemini/test` | 測試 Gemini 連線 |
| `POST /api/finmind/test` | 驗證 FinMind Token（伺服器或使用者自填） |
| `POST /api/finmind/live-news` | 最近 7 天個股新聞＋Gemini 情緒判讀（`days` 可調，上限 14） |
| `POST /api/finmind/ml-train` | 真實股價＋新聞：新聞情緒對隔日報酬的迴歸、方向命中率、AUC（`newsDays` 預設 20，上限 60） |
| `POST /api/sentiment/analyze-headline` | 單則標題情緒分析 |

## 資料真實性標示

- 有 FinMind Token：回傳 `isDemo: false` / `isSimulated: false`，數字由真實資料計算。
- 沒有 Token 或抓取失敗：回傳內建示範資料，並標示 `isDemo: true` / `isSimulated: true`，來源文字也會註明「示範資料（非即時）」。
- FinMind 新聞每次請求只回傳一天，`ml-train` 抓 20 天就會用掉約 21 次請求，請留意 FinMind 的每小時請求上限。
