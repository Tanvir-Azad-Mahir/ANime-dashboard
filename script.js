document.addEventListener('DOMContentLoaded', function() {
    const coins = ['bitcoin', 'ethereum', 'solana'];
    const container = document.getElementById('crypto-container');
    
    function fetchPrices() {
        coins.forEach(coin => {
            fetch(`https://api.coingecko.com/api/v3/coins/${coin}`)
                .then(response => response.json())
                .then(data => {
                    updateCryptoCard(data);
                });
        });
    }
    
    function updateCryptoCard(data) {
        const priceChange = data.market_data.price_change_percentage_24h;
        const changeClass = priceChange >= 0 ? 'price-up' : 'price-down';
        
        let card = document.getElementById(`card-${data.id}`);
        if (!card) {
            card = document.createElement('div');
            card.className = 'col-md-4';
            card.id = `card-${data.id}`;
            card.innerHTML = `
                <div class="crypto-card">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${data.image.small}" alt="${data.name}" class="me-2">
                        <h3>${data.name}</h3>
                    </div>
                    <p>Price: $<span class="price">${data.market_data.current_price.usd.toLocaleString()}</span></p>
                    <p>24h Change: <span class="change ${changeClass}">${priceChange.toFixed(2)}%</span></p>
                    <p>Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}</p>
                </div>
            `;
            container.appendChild(card);
        } else {
            card.querySelector('.price').textContent = data.market_data.current_price.usd.toLocaleString();
            const changeElement = card.querySelector('.change');
            changeElement.textContent = `${priceChange.toFixed(2)}%`;
            changeElement.className = `change ${changeClass}`;
        }
    }
    
    // Initial load
    fetchPrices();
    
    // Refresh every 60 seconds
    setInterval(fetchPrices, 60000);
});
