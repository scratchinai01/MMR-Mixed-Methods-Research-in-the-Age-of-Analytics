# Cloud Run 部署用映像檔
# 1. 安裝套件 2. 打包前端 (vite build → dist/) 3. 以正式模式啟動 server.ts
FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# 正式模式：server.ts 會直接提供 dist/ 的靜態檔案
ENV NODE_ENV=production
# Cloud Run 會自動注入 PORT（預設 8080），server.ts 會讀取它
EXPOSE 8080

CMD ["npx", "tsx", "server.ts"]
