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

# 遮罩顯示：只露出前 4 碼與後 4 碼，方便確認有沒有貼對
mask() {
  local v="$1"
  if [ -z "$v" ]; then echo "（未輸入，沿用上次設定）"
  elif [ ${#v} -le 10 ]; then echo "已輸入 ${#v} 個字元"
  else echo "${v:0:4}••••${v: -4}（${#v} 個字元）"; fi
}

while true; do
  echo ""
  echo "▶ 請輸入金鑰（貼上時畫面不會顯示，這是正常的；貼上後按 Enter）"
  echo "  不需要設定或要沿用上次設定的，直接按 Enter 跳過"
  read -rsp "  GROQ_API_KEY: " GROQ_API_KEY; echo
  read -rsp "  GROQ_API_KEYS（多把以逗號分隔，可留空）: " GROQ_API_KEYS; echo
  read -rsp "  FINMIND_API_TOKEN: " FINMIND_API_TOKEN; echo
  read -rsp "  GEMINI_API_KEY（可留空）: " GEMINI_API_KEY; echo

  # 去掉不小心貼進來的空白與換行
  for NAME in GROQ_API_KEY GROQ_API_KEYS FINMIND_API_TOKEN GEMINI_API_KEY; do
    printf -v "$NAME" '%s' "$(printf '%s' "${!NAME}" | tr -d '[:space:]')"
  done

  echo ""
  echo "▶ 請確認輸入內容："
  echo "  GROQ_API_KEY      ：$(mask "$GROQ_API_KEY")"
  echo "  GROQ_API_KEYS     ：$(mask "$GROQ_API_KEYS")"
  echo "  FINMIND_API_TOKEN ：$(mask "$FINMIND_API_TOKEN")"
  echo "  GEMINI_API_KEY    ：$(mask "$GEMINI_API_KEY")"
  read -rp "  正確請按 y 開始部署；要重新輸入請按 n：" OK
  case "$OK" in
    y|Y) break ;;
    *) echo "  ↺ 重新輸入" ;;
  esac
done

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
