#!/usr/bin/env bash
# =====================================================================
# 一鍵上架到 Google Cloud Run
# 用法（在 Google Cloud 主控台右上角的 Cloud Shell 執行）：
#   git clone https://github.com/scratchinai01/MMR-Mixed-Methods-Research-in-the-Age-of-Analytics.git mmr
#   cd mmr && bash deploy.sh
# 之後更新：cd mmr && git pull && bash deploy.sh（金鑰直接按 Enter 會沿用上次設定）
# =====================================================================
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-payfirebase}"
REGION="${REGION:-asia-east1}"          # 台灣（彰化）機房
SERVICE="${SERVICE:-mmr-analytics}"

echo "▶ 專案：$PROJECT_ID｜地區：$REGION｜服務名稱：$SERVICE"
gcloud config set project "$PROJECT_ID" >/dev/null

echo "▶ 啟用必要的 Google Cloud API（第一次約需 1 分鐘）..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo ""
echo "▶ 請輸入金鑰（輸入時不會顯示在畫面上；直接按 Enter 表示沿用上次設定或不設定）"
read -rsp "  GROQ_API_KEY: " GROQ_API_KEY; echo
read -rsp "  GROQ_API_KEYS（多把以逗號分隔，可留空）: " GROQ_API_KEYS; echo
read -rsp "  FINMIND_API_TOKEN: " FINMIND_API_TOKEN; echo
read -rsp "  GEMINI_API_KEY（可留空）: " GEMINI_API_KEY; echo

# 只更新有填寫的變數；用 | 當分隔符號，避免 GROQ_API_KEYS 裡的逗號被拆開
ENV_ARGS=()
PAIRS=""
for NAME in GROQ_API_KEY GROQ_API_KEYS FINMIND_API_TOKEN GEMINI_API_KEY; do
  VALUE="${!NAME}"
  if [ -n "$VALUE" ]; then PAIRS="${PAIRS:+$PAIRS|}$NAME=$VALUE"; fi
done
if [ -n "$PAIRS" ]; then ENV_ARGS=(--update-env-vars "^|^$PAIRS"); fi

echo ""
echo "▶ 開始建置與部署（約 3～6 分鐘）..."
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --timeout 120 \
  "${ENV_ARGS[@]}"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
echo ""
echo "✅ 上架完成！網址：$URL"
echo "   檢查 AI 與 FinMind 設定：$URL/api/ai/status"
