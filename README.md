# 台股論文復刻與沈浸式翻譯｜混合方法研究 (MMR)

復刻 Raman et al. (2022)《Mixed Methods Research in the Age of Analytics》的台股教學平台。
AI 解析由 **Groq** 提供（Gemini 為備援），台股新聞與股價來自 **FinMind**。

## 本機執行

**需求：** Node.js（或 Bun）

1. 安裝套件：`npm install`（或 `bun install`）
2. 複製 `.env.example` 為 `.env`，填入金鑰：
   - `GROQ_API_KEY`：到 https://console.groq.com/keys 產生
   - `FINMIND_API_TOKEN`：到 https://finmindtrade.com/ 登入後取得
   - `GEMINI_API_KEY`（可選）：Groq 失敗時的備援，上傳 PDF 時優先使用
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

## 以真實新聞重算機器學習比較表

網頁上「台股機器學習預測精度對比」預設顯示原論文的示範數字（會標示「示範數字」）。
在 Cloud Shell 執行下列指令，就會用 FinMind 真實新聞（4 支股票 × 90 天，通常超過 500 則）重新計算：

```bash
cd ~/mmr && git pull
pip install --user pandas scikit-learn requests
export FINMIND_API_TOKEN=你的Token
export GROQ_API_KEY=你的Groq金鑰   # 可省略，省略則用關鍵詞判讀情緒
python3 news_ml_study.py --stocks 2330,2454,2317,2382 --days 90
bash deploy.sh
```

結果存在 `public/data/ml_results.json`，網頁會自動改顯示真實結果，並附上樣本數、期間與基準準確率。
抓過的新聞存在 `.cache/`，若碰到 FinMind 請求上限，一小時後重跑同一指令即可從中斷處繼續。

## AI 呼叫順序

Groq ➔ Gemini ➔ 本地知識庫備援。三者都沒有金鑰時仍可運作，只是回覆來自內建範本。
上傳 PDF 論文時：有 Gemini 金鑰就交給 Gemini 直接讀 PDF；只有 Groq 時，伺服器會先把 PDF 轉成文字再交給 Groq。

## API 一覽

| 路徑 | 說明 |
|---|---|
| `GET /api/ai/status` | 目前啟用的 AI 供應商與金鑰狀態 |
| `POST /api/groq/test` | 測試 Groq 連線 |
| `POST /api/gemini/test` | 測試 Gemini 連線 |
| `POST /api/finmind/test` | 驗證 FinMind Token（伺服器或使用者自填） |
| `POST /api/finmind/live-news` | 最近 7 天個股新聞＋情緒判讀（`days` 可調，上限 14） |
| `POST /api/finmind/ml-train` | 真實股價＋新聞：新聞情緒對隔日報酬的迴歸、方向命中率、AUC（`newsDays` 預設 20，上限 60） |
| `POST /api/sentiment/analyze-headline` | 單則標題情緒分析 |

## 資料真實性標示

- 有 FinMind Token：回傳 `isDemo: false` / `isSimulated: false`，數字由真實資料計算。
- 沒有 Token 或抓取失敗：回傳內建示範資料，並標示 `isDemo: true` / `isSimulated: true`，來源文字也會註明「示範資料（非即時）」。
- FinMind 新聞每次請求只回傳一天，`ml-train` 抓 20 天就會用掉約 21 次請求，請留意 FinMind 的每小時請求上限。
