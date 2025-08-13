// API Configuration
const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'YOUR_API_KEY'; // Register at coingecko.com for a free API key

// Cache DOM elements
const elements = {
    loadingIndicator: document.getElementById('loading-indicator'),
    errorContainer: document.getElementById('error-container')
};

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
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
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

// API Helper Functions
async function fetchData(endpoint, params = {}) {
    try {
        showLoading();
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}${endpoint}?${queryString}`);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        showError(error.message);
        return null;
    } finally {
        hideLoading();
    }
}

function showLoading() {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = 'block';
    }
}

function hideLoading() {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = 'none';
    }
}

function showError(message) {
    if (elements.errorContainer) {
        elements.errorContainer.textContent = message;
        elements.errorContainer.style.display = 'block';
        setTimeout(() => {
            elements.errorContainer.style.display = 'none';
        }, 5000);
    }
    console.error(message);
}

// Home Page Functions
async function initHomePage() {
    const data = await fetchData('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 4,
        page: 1,
        sparkline: false
    });

    if (data) {
        renderTopCryptos(data);
    }
}

function renderTopCryptos(cryptos) {
    const cryptoGrid = document.getElementById('top-crypto-list');
    if (!cryptoGrid) return;

    cryptoGrid.innerHTML = cryptos.map(crypto => `
        <div class="crypto-card">
            <img src="${crypto.image}" alt="${crypto.name}" width="40">
            <h4>${crypto.name} (${crypto.symbol.toUpperCase()})</h4>
            <p class="price">$${crypto.current_price.toLocaleString()}</p>
            <p class="change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%
            </p>
        </div>
    `).join('');
}

// Prices Page Functions
async function initPricesPage() {
    const data = await fetchData('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false
    });

    if (data) {
        renderCryptoTable(data);
        setupSearch();
        setupCurrencySelector();
    }
}

function renderCryptoTable(cryptos) {
    const tableBody = document.querySelector('#crypto-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = cryptos.map(crypto => `
        <tr>
            <td>${crypto.market_cap_rank || 'N/A'}</td>
            <td>
                <img src="${crypto.image}" alt="${crypto.name}" width="20">
                ${crypto.name} (${crypto.symbol.toUpperCase()})
            </td>
            <td>$${crypto.current_price.toLocaleString()}</td>
            <td class="${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${(crypto.market_cap / 1000000000).toFixed(2)}B</td>
        </tr>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('search-crypto');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#crypto-table tbody tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    });
}

async function setupCurrencySelector() {
    const selector = document.getElementById('currency-selector');
    if (!selector) return;

    selector.addEventListener('change', async function() {
        const vsCurrency = this.value;
        const data = await fetchData('/coins/markets', {
            vs_currency: vsCurrency,
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: false
        });

        if (data) {
            renderCryptoTable(data);
        }
    });
}

// Portfolio Page Functions
function initPortfolioPage() {
    loadPortfolio();
    setupCoinSelector();
    setupAddCoinForm();
}

async function loadPortfolio() {
    let portfolio = JSON.parse(localStorage.getItem('cryptoPortfolio')) || [];
    
    if (portfolio.length > 0) {
        // Get current prices for portfolio items
        const coinIds = portfolio.map(item => item.id).join(',');
        const prices = await fetchData('/coins/markets', {
            vs_currency: 'usd',
            ids: coinIds,
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: false
        });

        updatePortfolioDisplay(portfolio, prices);
    } else {
        document.getElementById('portfolio-empty').style.display = 'block';
    }
}

function updatePortfolioDisplay(portfolio, prices) {
    const holdingsTable = document.querySelector('#holdings-table tbody');
    const portfolioEmpty = document.getElementById('portfolio-empty');
    
    if (!holdingsTable) return;

    if (portfolio.length === 0) {
        portfolioEmpty.style.display = 'block';
        holdingsTable.innerHTML = '';
        updatePortfolioSummary(null);
        return;
    }

    portfolioEmpty.style.display = 'none';
    
    let totalValue = 0;
    let totalInvestment = 0;
    
    holdingsTable.innerHTML = portfolio.map(item => {
        const coinData = prices ? prices.find(coin => coin.id === item.id) : null;
        const currentPrice = coinData ? coinData.current_price : 0;
        const currentValue = item.amount * currentPrice;
        const investment = item.buyPrice ? item.amount * item.buyPrice : currentValue;
        const profitLoss = currentValue - investment;
        const profitLossPercent = investment > 0 ? (profitLoss / investment) * 100 : 0;

        totalValue += currentValue;
        totalInvestment += investment;

        return `
            <tr>
                <td>
                    ${coinData ? `<img src="${coinData.image}" alt="${item.name}" width="20">` : ''}
                    ${item.name}
                </td>
                <td>${item.amount}</td>
                <td>$${currentValue.toFixed(2)}</td>
                <td class="${profitLoss >= 0 ? 'positive' : 'negative'}">
                    ${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%
                    ($${Math.abs(profitLoss).toFixed(2)})
                </td>
                <td>
                    <button class="btn-delete" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    // Add delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const coinId = this.getAttribute('data-id');
            const portfolio = JSON.parse(localStorage.getItem('cryptoPortfolio')) || [];
            const updatedPortfolio = portfolio.filter(item => item.id !== coinId);
            localStorage.setItem('cryptoPortfolio', JSON.stringify(updatedPortfolio));
            loadPortfolio();
        });
    });

    updatePortfolioSummary({
        totalValue,
        totalInvestment,
        coins: portfolio.length
    });
}

function updatePortfolioSummary({ totalValue, totalInvestment, coins }) {
    if (totalValue === undefined) {
        document.getElementById('total-value').textContent = '$0.00';
        document.getElementById('daily-change').textContent = '+0.00%';
        document.getElementById('total-coins').textContent = '0';
        return;
    }

    const profitLoss = totalValue - totalInvestment;
    const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('daily-change').textContent = 
        `${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%`;
    document.getElementById('total-coins').textContent = coins;
}

async function setupCoinSelector() {
    const selector = document.getElementById('coin-selector');
    if (!selector) return;

    const data = await fetchData('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
    });

    if (data) {
        selector.innerHTML = `
            <option value="">Select a coin</option>
            ${data.map(coin => `
                <option value="${coin.id}" data-symbol="${coin.symbol}">
                    ${coin.name} (${coin.symbol.toUpperCase()})
                </option>
            `).join('')}
        `;
    }
}

function setupAddCoinForm() {
    const form = document.getElementById('add-coin-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const coinSelector = document.getElementById('coin-selector');
        const selectedOption = coinSelector.options[coinSelector.selectedIndex];
        const coinId = coinSelector.value;
        const coinName = selectedOption.text.split(' (')[0];
        const amount = parseFloat(document.getElementById('coin-amount').value);
        const buyPrice = document.getElementById('buy-price').value ? 
            parseFloat(document.getElementById('buy-price').value) : null;

        if (coinId && amount) {
            const portfolio = JSON.parse(localStorage.getItem('cryptoPortfolio')) || [];
            
            // Check if coin already exists in portfolio
            const existingIndex = portfolio.findIndex(item => item.id === coinId);
            
            if (existingIndex >= 0) {
                // Update existing entry
                portfolio[existingIndex].amount += amount;
                if (buyPrice) {
                    // Recalculate average buy price
                    const totalAmount = portfolio[existingIndex].amount;
                    const previousInvestment = (portfolio[existingIndex].amount - amount) * 
                        (portfolio[existingIndex].buyPrice || 0);
                    const newInvestment = amount * buyPrice;
                    portfolio[existingIndex].buyPrice = 
                        (previousInvestment + newInvestment) / totalAmount;
                }
            } else {
                // Add new entry
                portfolio.push({
                    id: coinId,
                    name: coinName,
                    amount: amount,
                    buyPrice: buyPrice,
                    added: new Date().toISOString()
                });
            }
            
            localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
            loadPortfolio();
            form.reset();
        }
    });
}

// News Page Functions
async function initNewsPage() {
    // Note: CoinGecko doesn't have a news API, so we'll use a mock
    const mockNews = [
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
        }
    ];
    
    renderNews(mockNews);
    setupNewsFilters();
}

function renderNews(newsItems) {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    newsContainer.innerHTML = newsItems.map(item => `
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

function setupNewsFilters() {
    const filterButtons = document.querySelectorAll('.news-filters button');
    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            const newsCards = document.querySelectorAll('.news-card');
            
            newsCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    highlightActivePage();
    initPage();
});
