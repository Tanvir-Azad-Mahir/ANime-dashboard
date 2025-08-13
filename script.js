// Shared functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Highlight current page in navigation
    highlightActivePage();
    
    // Initialize page-specific functionality
    initPage();
});

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'prices.html':
            initPricesPage();
            break;
        case 'portfolio.html':
            initPortfolioPage();
            break;
        case 'news.html':
            initNewsPage();
            break;
    }
}

function initHomePage() {
    // Mock data - in a real app you'd fetch from an API
    const topCryptos = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: '$29,450', change: '+2.3%' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: '$1,850', change: '+1.8%' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: '$0.30', change: '+5.2%' },
        { id: 'solana', name: 'Solana', symbol: 'SOL', price: '$24.50', change: '-0.5%' }
    ];

    const cryptoGrid = document.getElementById('top-crypto-list');
    if (cryptoGrid) {
        cryptoGrid.innerHTML = topCryptos.map(crypto => `
            <div class="crypto-card">
                <h4>${crypto.name} (${crypto.symbol})</h4>
                <p class="price">${crypto.price}</p>
                <p class="change ${crypto.change.startsWith('+') ? 'positive' : 'negative'}">
                    ${crypto.change}
                </p>
            </div>
        `).join('');
    }
}

function initPricesPage() {
    // Mock data - replace with API call
    const cryptoData = [
        { rank: 1, id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: '$29,450', change: '+2.3%', marketCap: '$570B' },
        { rank: 2, id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: '$1,850', change: '+1.8%', marketCap: '$222B' },
        { rank: 3, id: 'tether', name: 'Tether', symbol: 'USDT', price: '$1.00', change: '0.0%', marketCap: '$83B' },
        { rank: 4, id: 'bnb', name: 'BNB', symbol: 'BNB', price: '$245', change: '-0.7%', marketCap: '$38B' },
        { rank: 5, id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', price: '$1.00', change: '0.0%', marketCap: '$28B' }
    ];

    const tableBody = document.querySelector('#crypto-table tbody');
    if (tableBody) {
        tableBody.innerHTML = cryptoData.map(crypto => `
            <tr>
                <td>${crypto.rank}</td>
                <td>${crypto.name} (${crypto.symbol})</td>
                <td>${crypto.price}</td>
                <td class="${crypto.change.startsWith('+') ? 'positive' : 'negative'}">
                    ${crypto.change}
                </td>
                <td>${crypto.marketCap}</td>
            </tr>
        `).join('');

        // Search functionality
        document.getElementById('search-crypto').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                row.style.display = name.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    highlightActivePage();
    initPage();
});
