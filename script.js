// script.js
const USD_TO_THB = 32.30;

// ราคาปัจจุบัน (อัปเดตเองตรงนี้ได้เลย)
const mockPrices = {
    "NVDA": 880.20,
    "MSFT": 420.10,
    "AAPL": 175.50,
    "AMZN": 185.00,
    "ALAB": 98.00
};

function renderPortfolio() {
    const container = document.getElementById('stock-items-container');
    if (!container) return;
    
    // เช็กว่ามีข้อมูลหุ้นใน config.js หรือไม่
    if (typeof MY_PORTFOLIO === 'undefined') {
        container.innerHTML = '<p style="color:red;">ไม่พบข้อมูลใน config.js</p>';
        return;
    }

    container.innerHTML = '';
    let totalValueUSD = 0;
    let totalCostBasis = 0;

    MY_PORTFOLIO.forEach(stock => {
        const currentPrice = mockPrices[stock.symbol] || 0;
        const currentValue = currentPrice * stock.shares;
        const totalCost = stock.costBasis * stock.shares;
        const profitLossUSD = currentValue - totalCost;
        const profitLossPercent = ((currentPrice - stock.costBasis) / stock.costBasis) * 100;

        totalValueUSD += currentValue;
        totalCostBasis += totalCost;

        const itemHTML = `
            <div class="stock-item" style="border: 1px solid #333; padding: 15px; border-radius: 12px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between;">
                    <div>
                        <strong style="font-size:1.2em; color:#00ff41;">${stock.symbol}</strong><br>
                        <small>${stock.shares} หุ้น</small>
                    </div>
                    <div style="text-align:right;">
                        <strong>$${currentValue.toFixed(2)}</strong><br>
                        <span class="${profitLossUSD >= 0 ? 'profit' : 'loss'}">
                            ${profitLossPercent.toFixed(2)}% ($${profitLossUSD.toFixed(2)})
                        </span>
                    </div>
                </div>
                <button class="chart-toggle-btn" onclick="toggleChart('${stock.symbol}')" style="margin-top:10px; width:100%;">ดูกราฟ</button>
                <div id="tv-chart-${stock.symbol}" class="tradingview-chart-container" style="height:300px; display:none; margin-top:10px;">
                    <div id="tv-widget-${stock.symbol}" style="height:100%;"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    updateSummary(totalValueUSD, totalCostBasis);
}

function updateSummary(totalUSD, totalCost) {
    const profitUSD = totalUSD - totalCost;
    const profitPercent = (profitUSD / totalCost) * 100;

    document.getElementById('total-usd').innerText = `$${totalUSD.toFixed(2)}`;
    document.getElementById('total-thb').innerText = `฿${(totalUSD * USD_TO_THB).toLocaleString()}`;
    document.getElementById('total-percent-display').innerText = `${profitPercent.toFixed(2)}%`;
    document.getElementById('total-profit-display').innerText = `$${profitUSD.toFixed(2)}`;
}

function toggleChart(symbol) {
    const container = document.getElementById(`tv-chart-${symbol}`);
    const isVisible = container.style.display === 'block';
    container.style.display = isVisible ? 'none' : 'block';

    if (!isVisible && typeof TradingView !== 'undefined') {
        new TradingView.widget({
            "width": "100%", "height": "100%",
            "symbol": `NASDAQ:${symbol}`,
            "interval": "D", "theme": "dark", "style": "1",
            "locale": "th", "container_id": `tv-widget-${symbol}`
        });
    }
}

// รันทันทีที่โหลดเสร็จ
window.onload = renderPortfolio;
