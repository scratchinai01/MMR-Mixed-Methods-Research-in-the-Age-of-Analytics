#!/usr/bin/env bash
# =====================================================================
# 一次性設定：GitHub 有新版本 (push 到 main) 時，自動重新部署到 Cloud Run
# 用法（在 Cloud Shell，只需執行一次）：
#   cd ~/mmr && git pull && bash setup-auto-deploy.sh
#
# 原理：使用 Google 官方的 Workload Identity Federation，
#       讓 GitHub Actions 以「只限這個 repo」的身分登入 Google Cloud，
#       不需要建立或保存任何金鑰檔案。
# =====================================================================
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-payfirebase}"
REPO="${REPO:-scratchinai01/MMR-Mixed-Methods-Research-in-the-Age-of-Analytics}"
POOL="github"
PROVIDER="github"
SA_NAME="github-deployer"
SA="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT_ID" >/dev/null
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
echo "▶ 專案：$PROJECT_ID（編號 $PROJECT_NUMBER）｜GitHub repo：$REPO"

echo "▶ 啟用必要的 API..."
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com run.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com >/dev/null

echo "▶ 建立部署專用的服務帳戶..."
gcloud iam service-accounts describe "$SA" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "$SA_NAME" --display-name="GitHub 自動部署"

echo "▶ 給予部署所需權限..."
for ROLE in roles/run.admin roles/cloudbuild.builds.editor roles/artifactregistry.admin \
            roles/storage.admin roles/iam.serviceAccountUser roles/serviceusage.serviceUsageConsumer \
            roles/logging.viewer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$SA" \
    --role="$ROLE" --condition=None >/dev/null
done

echo "▶ 建立 GitHub 身分池（只信任 $REPO）..."
gcloud iam workload-identity-pools describe "$POOL" --location=global >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools create "$POOL" --location=global --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers describe "$PROVIDER" --location=global \
  --workload-identity-pool="$POOL" >/dev/null 2>&1 || \
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --location=global \
    --workload-identity-pool="$POOL" --display-name="GitHub" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository=='${REPO}'"

gcloud iam service-accounts add-iam-policy-binding "$SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${REPO}" \
  >/dev/null

PROVIDER_PATH="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"
echo ""
echo "✅ 設定完成！"
echo "   之後只要 GitHub 的 main 有新版本，約 5 分鐘內網站就會自動更新。"
echo "   進度可在 GitHub 頁面的「Actions」分頁查看。"
echo ""
echo "   （供核對）workload_identity_provider = $PROVIDER_PATH"
echo "   （供核對）service_account            = $SA"
