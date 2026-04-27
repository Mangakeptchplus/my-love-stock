// script.js

// ฟังก์ชันดึงข้อมูลราคาหุ้นล่าสุด
async function fetchStockPrice(symbol) {
    if (!API_KEY || API_KEY.startsWith("ใส่_")) {
        console.error("Please add your API key in config.js");
        return null;
    }
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.c; // ส่งคืนราคาปัจจุบัน (current price)
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return null;
    }
}

// ฟังก์ชันสร้างรายการหุ้นใน HTML
async function renderPortfolio() {
    const container = document.getElementById('stock-items-container');
    container.innerHTML = 'กำลังโหลดข้อมูล...';

    let totalValueUSD = 0;
    let totalCostBasis = 0;

    // เคลียร์ข้อมูลก่อนเพื่อป้องกันการซ้อนทับเมื่อรีเฟรช
    container.innerHTML = '';

    for (const stock of MY_PORTFOLIO) {
        const currentPrice = await fetchStockPrice(stock.symbol);
        
        if (currentPrice === null) continue;

        const currentValue = currentPrice * stock.shares;
        const totalCost = stock.costBasis * stock.shares;
        const profitLossUSD = currentValue - totalCost;
        const profitLossPercent = ((currentPrice - stock.costBasis) / stock.costBasis) * 100;

        totalValueUSD += currentValue;
        totalCostBasis += totalCost;

        const itemHTML = `
            <div class="stock-item" onclick="toggleChart('${stock.symbol}')">
                <div class="stock-info">
                    <strong>${stock.symbol}</strong>
                    <span>${stock.shares} หุ้น (${stock.name})</span>
                </div>
                <div class="stock-value">
                    <span>${currentPrice.toFixed(2)} USD</span>
                    <span>${(currentPrice * USD_TO_THB).toFixed(2)} THB</span>
                    <span class="${profitLossUSD >= 0 ? 'profit' : 'loss'}">
                        ${profitLossPercent.toFixed(2)}% (${profitLossUSD.toFixed(2)} USD)
                    </span>
                </div>
                <div id="chart-container-${stock.symbol}" class="chart-container">
                    <canvas id="chart-${stock.symbol}"></canvas>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
        
        // สร้างกราฟแยกสำหรับหุ้นนี้
        createChart(stock.symbol, stock.costBasis, currentPrice);
    }

    // อัปเดตส่วนหัวพอร์ต
    updatePortfolioSummary(totalValueUSD, totalCostBasis);
}

// ฟังก์ชันอัปเดตสรุปพอร์ต
function updatePortfolioSummary(totalUSD, totalCost) {
    const totalProfitUSD = totalUSD - totalCost;
    const totalProfitPercent = (totalProfitUSD / totalCost) * 100;

    document.getElementById('total-usd').innerText = `$${totalUSD.toFixed(2)}`;
    document.getElementById('total-thb').innerText = `฿${(totalUSD * USD_TO_THB).toLocaleString()} THB`;
    
    document.getElementById('total-percent-display').innerText = `${totalProfitPercent.toFixed(2)}%`;
    document.getElementById('total-profit-display').innerText = `${totalProfitUSD.toFixed(2)} USD`;
    
    // ตั้งค่าสีเขียว/แดง
    document.getElementById('total-percent-display').className = totalProfitUSD >= 0 ? 'profit' : 'loss';
}

// ฟังก์ชันสร้างกราฟ
function createChart(symbol, cost, current) {
    const ctx = document.getElementById(`chart-${symbol}`).getContext('2d');
    new Chart(ctx, {
        type: 'bar', // เปลี่ยนเป็น line ได้ตามชอบ
        data: {
            labels: ['ต้นทุน', 'ปัจจุบัน'],
            datasets: [{
                label: symbol,
                data: [cost, current],
                backgroundColor: ['#333', '#00ff41'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });
}

// ฟังก์ชันเปิด/ปิดกราฟ
function toggleChart(symbol) {
    const container = document.getElementById(`chart-container-${symbol}`);
    container.classList.toggle('active');
}

// เริ่มการทำงาน
renderPortfolio();