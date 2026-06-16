# 🚀 StockVue Pro - 全球股票監控平台

即時全球股票監控，雙資料源架構，自由切換。

## ⚡ 快速啟動

### 方法 A：雙擊 BAT（一鍵啟動，推薦）

**雙擊 `start.bat`** → 自動啟動代理 + 開啟瀏覽器 → 全球即時數據

### 方法 B：直接開啟（無需伺服器）

直接打開 `index.html`，預設使用 Twelve Data 直接模式。

- 美股：Finnhub 即時報價（60 req/min，快速）
- 國際指數/股票：Twelve Data（8 req/min，前 8 個即時載入，其餘逐步顯示）
- 加密貨幣：CoinGecko
- 新聞：Finnhub

### 方法 C：雲端代理模式（推薦 — 不需本機伺服器）

將代理部署到免費雲端平台，獲得完整 Yahoo Finance 全球數據：

#### Render.com 部署（免費）

1. 把 `stock-monitor` 資料夾上傳到 GitHub
2. 到 [render.com](https://render.com) 註冊（用 GitHub 登入）
3. 點 **New + → Web Service**，選擇你的 repo
4. 設定：
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. 點 **Deploy Web Service**
6. 取得網址，如 `https://stockvue-proxy.onrender.com`
7. 修改 `index.html` 第 833 行的 `PROXY_URL` 為你的 Render 網址

#### 或者 Railway.app（免費）

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 📡 雙資料源架構

| | 🖥️ Yahoo (代理) | ☁️ 直接模式 |
|------|------|------|
| 需要伺服器 | ✅ 本機或雲端 | ❌ 無需 |
| 美股報價 | Finnhub WebSocket | Finnhub 直連 |
| 全球指數 | Yahoo Finance | Twelve Data (真實指數) |
| 台股/港股 | 2330.TW, 0700.HK 真實報價 | 2330.TW, 0700.HK 真實報價 |
| 圖表歷史 | Yahoo 真實 K 線 | Twelve Data 真實歷史 |
| 加密貨幣 | CoinGecko | CoinGecko |
| 新聞 | Finnhub | Finnhub 直連 |

## 🔄 切換資料來源

點右上角 ⚙️ 設定 → 點擊 `🖥️ 代理` 或 `☁️ 直接` → 即時切換

- **代理模式**：全球完整覆蓋，需代理伺服器（本機或雲端）
- **直接模式**：無伺服器，數據逐步載入，大部分即時顯示

## 🛠 技術棧

- **前端**: HTML5 / CSS3 / JavaScript ES6+
- **圖表**: Chart.js 4.4 (分段漲跌著色)
- **即時推送**: Finnhub WebSocket
- **代理伺服器**: Node.js + Express (localhost:3456 或雲端)
- **直接 API**: Finnhub + Twelve Data + CoinGecko
