// Shared functionality across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize page-specific functionality
    if (currentPage === 'index.html') initHomePage();
    if (currentPage === 'prices.html') initPricesPage();
    if (currentPage === 'portfolio.html') initPortfolioPage();
    if (currentPage === 'news.html') initNewsPage();
});

function initHomePage() {
    // Mock data - in a real app you'd fetch from an API
    const topCryptos = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: '$29,450', change: '+2.3%' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: '$1,850', change: '+1.8%' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: '$0.30', change: '+5.2%' },
        { id: 'solana', name: 'Solana', symbol: 'SOL', price: '$24.50', change: '-0.5%' }
    ];

    const cryptoGrid = document.getElementById('top-crypto-list');
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

function initPortfolioPage() {
    // Load portfolio from localStorage or initialize
    let portfolio = JSON.parse(localStorage.getItem('cryptoPortfolio')) || [];
    
    // Populate coin selector
    const coinSelector = document.getElementById('coin-selector');
    const topCoins = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Polkadot', 'Dogecoin'];
    
    topCoins.forEach(coin => {
        const option = document.createElement('option');
        option.value = coin.toLowerCase();
        option.textContent = coin;
        coinSelector.appendChild(option);
    });
    
    // Add coin form handler
    document.getElementById('add-coin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const coinName = coinSelector.value;
        const amount = parseFloat(document.getElementById('coin-amount').value);
        const buyPrice = document.getElementById('buy-price').value || null;
        
        if (coinName && amount) {
            portfolio.push({
                id: coinName.toLowerCase(),
                name: coinName,
                amount: amount,
                buyPrice: buyPrice,
                added: new Date().toISOString()
            });
            
            localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
            updatePortfolioDisplay();
            this.reset();
        }
    });
    
    // Update portfolio display
    function updatePortfolioDisplay() {
        // In a real app, you would fetch current prices and calculate values
        const holdingsTable = document.querySelector('#holdings-table tbody');
        holdingsTable.innerHTML = portfolio.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.amount}</td>
                <td>$${(item.amount * 2000).toFixed(2)}</td> <!-- Mock value -->
                <td>+5%</td> <!-- Mock value -->
                <td><button class="delete-btn" data-id="${item.id}">Delete</button></td>
            </tr>
        `).join('');
        
        // Add delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const coinId = this.getAttribute('data-id');
                portfolio = portfolio.filter(item => item.id !== coinId);
                localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
                updatePortfolioDisplay();
            });
        });
        
        // Update summary
        document.getElementById('total-coins').textContent = portfolio.length;
    }
    
    updatePortfolioDisplay();
}

function initNewsPage() {
    // Mock news data - replace with API call
    const newsData = [
        { 
            title: 'Bitcoin Surges Past $30,000 Amid Banking Concerns', 
            source: 'CoinDesk', 
            date: '2 hours ago', 
            category: 'bitcoin',
            summary: 'Bitcoin price rallied sharply as investors seek alternatives to traditional banking systems.'
        },
        { 
            title: 'Ethereum Shanghai Upgrade Completed Successfully', 
            source: 'Decrypt', 
            date: '5 hours ago', 
            category: 'ethereum',
            summary: 'The long-awaited upgrade enables staked ETH withdrawals, marking a major milestone.'
        },
        { 
            title: 'SEC Delays Decision on Bitcoin ETF Applications', 
            source: 'Bloomberg Crypto', 
            date: '1 day ago', 
            category: 'regulation',
            summary: 'Regulators request more information from applicants, pushing decision timeline.'
        }
    ];
    
    const newsContainer = document.getElementById('news-container');
    
    function displayNews(filter = 'all') {
        const filteredNews = filter === 'all' 
            ? newsData 
            : newsData.filter(item => item.category === filter);
        
        newsContainer.innerHTML = filteredNews.map(item => `
            <article class="news-card" data-category="${item.category}">
                <h3>${item.title}</h3>
                <div class="meta">
                    <span class="source">${item.source}</span>
                    <span class="date">${item.date}</span>
                </div>
                <p>${item.summary}</p>
                <a href="#" class="read-more">Read more</a>
            </article>
        `).join('');
    }
    
    // Initial display
    displayNews();
    
    // Filter buttons
    document.querySelectorAll('.news-filters button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.news-filters button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            displayNews(category);
        });
    });
}
