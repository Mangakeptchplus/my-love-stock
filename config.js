// script.js (อัปเดต)
const USD_TO_THB = 32.30; // จำลองค่าเงินบาท

// ราคาหุ้นจำลอง (คุณสามารถแก้เลขในนี้เพื่ออัปเดตราคาหลังบ้านได้ง่ายๆ)
const mockPrices = {
    "NVDA": 900.50,
    "MSFT": 425.20,
    "AAPL": 178.10,
    "AMZN": 189.50,
    "ALAB": 105.00
};

// ฟังก์ชันหลักในการสร้างพอร์ต
async function renderPortfolio() {
    const container = document.getElementById('stock-items-container');
    container.innerHTML = 'กำลังโหลดข้อมูล...';

    let totalValueUSD = 0;
    let totalCostBasis = 0;

    container.innerHTML = '';

    MY_PORTFOLIO.forEach(stock => {
        // 1. คำนวณกำไร/ขาดทุน (ใช้ Mock Price)
        const currentPrice = mockPrices[stock.symbol] || 0;
        const currentValue = currentPrice * stock.shares;
        const totalCost = stock.costBasis * stock.shares;
        const profitLossUSD = currentValue - totalCost;
        const profitLossPercent = ((currentPrice - stock.costBasis) / stock.costBasis) * 100;

        totalValueUSD += currentValue;
        totalCostBasis += totalCost;

        // 2. สร้าง HTML ของหุ้นแต่ละตัว (เพิ่มปุ่มและ Chart Container)
        const itemHTML = `
            <div class="stock-item">
                <div class="row" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong style="font-size:1.4em; color:#00ff41;">${stock.symbol}</strong><br>
                        <small style="color:#888;">${stock.shares} หุ้น (${stock.name})</small>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.2em; font-weight:bold;">$${currentValue.toFixed(2)}</div>
                        <div style="color:#888; font-size:0.9em;">฿${(currentValue * USD_TO_THB).toLocaleString()}</div>
                        <div class="${profitLossUSD >= 0 ? 'profit' : 'loss'}" style="font-weight:bold; font-size:1em;">
                            ${profitLossPercent.toFixed(2)}% (${profitLossUSD.toFixed(2)} USD)
                        </div>
                    </div>
                </div>

                <div class="row" style="text-align:right;">
                    <button id="btn-${stock.symbol}" class="chart-toggle-btn" onclick="toggleChart('${stock.symbol}')">
                        ดูกราฟ
                    </button>
                </div>

                <div id="tv-chart-${stock.symbol}" class="tradingview-chart-container">
                    <div id="tv-widget-${stock.symbol}" style="height:100%; width:100%;"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    updatePortfolioSummary(totalValueUSD, totalCostBasis);
}

// ฟังก์ชันอัปเดตสรุปพอร์ต (เหมือนเดิม)
function updatePortfolioSummary(totalUSD, totalCost) {
    const totalProfitUSD = totalUSD - totalCost;
    const totalProfitPercent = (totalProfitUSD / totalCost) * 100;

    document.getElementById('total-usd').innerText = `$${totalUSD.toFixed(2)}`;
    document.getElementById('total-thb').innerText = `฿${(totalUSD * USD_TO_THB).toLocaleString()} THB`;
    
    document.getElementById('total-percent-display').innerText = `${totalProfitPercent.toFixed(2)}%`;
    document.getElementById('total-percent-display').className = totalProfitUSD >= 0 ? 'profit' : 'loss';
    
    document.getElementById('total-profit-display').innerText = `${totalProfitUSD.toFixed(2)} USD`;
}

// *ฟังก์ชันสำคัญ* เปิด/ปิดกราฟ และโหลด Widget เมื่อเปิด
function toggleChart(symbol) {
    const btn = document.getElementById(`btn-${symbol}`);
    const chartContainer = document.getElementById(`tv-chart-${symbol}`);
    
    // สลับ Class active เพื่อเปิด/ปิดการแสดงผล
    btn.classList.toggle('active');
    chartContainer.classList.toggle('active');

    // ถ้ากดเปิด (มี class active) และยังไม่ได้สร้างกราฟ
    if (chartContainer.classList.contains('active') && !chartContainer.getAttribute('data-loaded')) {
        btn.innerText = 'ปิดกราฟ';
        loadTradingViewWidget(symbol); // โหลด Widget ของ TradingView
        chartContainer.setAttribute('data-loaded', 'true'); // ทำเครื่องหมายว่าโหลดแล้ว
    } else if (chartContainer.classList.contains('active')) {
        btn.innerText = 'ปิดกราฟ';
    } else {
        btn.innerText = 'ดูกราฟ';
    }
}

// ฟังก์ชันในการสร้าง TradingView Widget จริงๆ
function loadTradingViewWidget(symbol) {
    new TradingView.widget({
        "width": "100%", // ให้เต็มความกว้าง Container
        "height": "100%", // ให้เต็มความสูง Container
        "symbol": `NASDAQ:${symbol}`, // ส่วนใหญ่หุ้นที่คุณถืออยู่ใน NASDAQ
        "interval": "D", // กราฟรายวัน (เปลี่ยนเป็น 1, 60, W ได้)
        "timezone": "Asia/Bangkok",
        "theme": "dark", // ธีมมืด
        "style": "1", // 1 = แท่งเทียน
        "locale": "th", // เมนูภาษาไทย
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "allow_symbol_change": true,
        "container_id": `tv-widget-${symbol}` // **สำคัญ** ID ของ Div ที่จะเอาไปวาง
    });
}

// เริ่มต้นโหลด
renderPortfolio();