#!/usr/bin/env bash
# 部署前執行：把開放取用的論文 PDF 放進 Firebase Storage，並寫出下載網址清單
#   public/papers/*.pdf          → 本站備份（一定會隨網站部署）
#   gs://<Firebase 預設 bucket>/papers/*.pdf → Firebase 下載（附 download token）
#   public/data/paper_files.json → 網頁讀取的下載網址
# 任何一步失敗都不會中斷部署；網頁會自動改用本站備份。
set +e
PROJECT="${GCP_PROJECT:-payfirebase}"
mkdir -p public/papers public/data

# Afego & Alagidede (2021)：CC BY 4.0，從 University of Pretoria 典藏下載原版 PDF
AFEGO=public/papers/afego2021_jcms.pdf
if [ ! -s "$AFEGO" ]; then
  curl -sSL -m 60 -o "$AFEGO" "https://repository.up.ac.za/bitstreams/042b533b-dd5f-4e90-95c1-f08075d3a710/download"
  head -c 4 "$AFEGO" | grep -q '%PDF' || { echo "Afego PDF 下載失敗，略過"; rm -f "$AFEGO"; }
fi

BUCKET=""
for b in "$PROJECT.firebasestorage.app" "$PROJECT.appspot.com"; do
  if gcloud storage buckets describe "gs://$b" --project "$PROJECT" >/dev/null 2>&1; then BUCKET="$b"; break; fi
done
echo "Firebase Storage bucket：${BUCKET:-（找不到，只使用本站備份）}"

json="{"
first=1
for f in public/papers/*.pdf; do
  [ -s "$f" ] || continue
  name=$(basename "$f")
  key="${name%%_*}"
  fburl=""
  if [ -n "$BUCKET" ]; then
    obj="gs://$BUCKET/papers/$name"
    token=$(gcloud storage objects describe "$obj" --format='value(metadata.firebaseStorageDownloadTokens)' 2>/dev/null | cut -d, -f1)
    [ -z "$token" ] && token=$(cat /proc/sys/kernel/random/uuid)
    if gcloud storage cp "$f" "$obj" --content-type=application/pdf \
         --custom-metadata="firebaseStorageDownloadTokens=$token" >/dev/null 2>&1; then
      fburl="https://firebasestorage.googleapis.com/v0/b/$BUCKET/o/papers%2F$name?alt=media&token=$token"
      echo "已上傳 $name"
    else
      echo "上傳 $name 失敗，改用本站備份"
    fi
  fi
  [ $first -eq 0 ] && json="$json,"
  first=0
  bytes=$(stat -c %s "$f")
  json="$json\"$key\":{\"localUrl\":\"/papers/$name\",\"bytes\":$bytes"
  [ -n "$fburl" ] && json="$json,\"firebaseUrl\":\"$fburl\""
  json="$json}"
done
json="$json}"
echo "$json" > public/data/paper_files.json
cat public/data/paper_files.json
exit 0
