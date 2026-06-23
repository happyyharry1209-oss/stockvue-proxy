/**
 * StockVue Pro - CORS Proxy Server
 * Proxies Yahoo Finance API requests to bypass CORS restrictions.
 * Also handles Finnhub requests to avoid exposing API key in client.
 */

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
// Serve static frontend files (index.html, etc.)
app.use(express.static(path.join(__dirname)));

// ============ Yahoo Finance Proxy ============
app.get('/api/yahoo/chart/:symbol', (req, res) => {
    const { symbol } = req.params;
    const interval = req.query.interval || '1d';
    const range = req.query.range || '1mo';

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;

    console.log(`📊 Yahoo: ${symbol} (${range})`);

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        },
    };

    https.get(url, options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.chart?.error) {
                    console.log(`   ❌ Yahoo error: ${parsed.chart.error.description}`);
                    return res.status(404).json({ error: parsed.chart.error.description });
                }
                const result = parsed.chart?.result?.[0];
                if (!result) {
                    console.log('   ❌ No data');
                    return res.status(404).json({ error: 'No data' });
                }
                console.log(`   ✅ Price: ${result.meta?.regularMarketPrice}, Points: ${result.timestamp?.length || 0}`);
                res.json(parsed);
            } catch (e) {
                console.log(`   ❌ Parse error: ${e.message}`);
                res.status(500).json({ error: 'Parse error' });
            }
        });
    }).on('error', (err) => {
        console.log(`   ❌ Network error: ${err.message}`);
        res.status(502).json({ error: err.message });
    });
});

// ============ Finnhub Proxy (optional - hides API key) ============
const FINNHUB_KEY = 'd8onjgpr01qn89hseo7gd8onjgpr01qn89hseo80';

app.get('/api/finnhub/quote/:symbol', (req, res) => {
    const { symbol } = req.params;
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
    console.log(`💹 Finnhub Quote: ${symbol}`);

    https.get(url, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                    return res.status(404).json(parsed);
                }
                console.log(`   ✅ $${parsed.c}`);
                res.json(parsed);
            } catch (e) {
                res.status(500).json({ error: 'Parse error' });
            }
        });
    }).on('error', (err) => {
        res.status(502).json({ error: err.message });
    });
});

app.get('/api/finnhub/profile/:symbol', (req, res) => {
    const { symbol } = req.params;
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`;
    console.log(`🏢 Finnhub Profile: ${symbol}`);

    https.get(url, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log(`   ✅ ${parsed.name || 'Unknown'}`);
                res.json(parsed);
            } catch (e) {
                res.status(500).json({ error: 'Parse error' });
            }
        });
    }).on('error', (err) => {
        res.status(502).json({ error: err.message });
    });
});

app.get('/api/finnhub/news', (req, res) => {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
    console.log('📰 Finnhub News');

    https.get(url, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log(`   ✅ ${parsed.length} articles`);
                res.json(parsed);
            } catch (e) {
                res.status(500).json({ error: 'Parse error' });
            }
        });
    }).on('error', (err) => {
        res.status(502).json({ error: err.message });
    });
});

// ============ Health Check ============
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// ============ Start ============
const server = app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  🚀 StockVue Pro Proxy Server');
    console.log(`     http://localhost:${PORT}`);
    console.log('  📊 Yahoo Finance  → /api/yahoo/chart/:symbol');
    console.log('  💹 Finnhub Quotes  → /api/finnhub/quote/:symbol');
    console.log('  🏢 Finnhub Profile → /api/finnhub/profile/:symbol');
    console.log('  📰 Finnhub News    → /api/finnhub/news');
    console.log('═══════════════════════════════════════════');
    console.log('');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} 已被佔用。請關閉其他程式後重試。`);
        console.error(`   或執行: npx kill-port ${PORT}`);
        process.exit(1);
    }
    throw err;
});
