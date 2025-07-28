-- Create stock_pool table 
CREATE TABLE IF NOT EXISTS stock_pool (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    sector VARCHAR(50),
    description VARCHAR(255),
    current_price DECIMAL(10,2),
    last_updated DATE
);

-- Insert stock_pool data 
INSERT IGNORE INTO stock_pool (symbol, name, sector, description, current_price, last_updated)
VALUES
    ('AAPL', 'Apple Inc.', 'Technology', 'US - Consumer electronics, NASDAQ', 192.34, '2025-07-26'),
    ('BIDU', 'Baidu Inc.', 'Technology', 'China - Search and AI, NASDAQ ADR', 115.20, '2025-07-26'),
    ('JNJ', 'Johnson & Johnson', 'Healthcare', 'US - Pharmaceuticals & medical devices, NYSE', 158.45, '2025-07-26'),
    ('BYD', 'BYD Electronic', 'Healthcare', 'China - Medical electronics, HKEX', 28.10, '2025-07-26'),
    ('PLD', 'Prologis Inc.', 'Real Estate', 'US - Industrial REIT, NYSE', 121.60, '2025-07-26'),
    ('1109.HK', 'China Resources Land', 'Real Estate', 'China - Residential/commercial RE, HKEX', 32.70, '2025-07-26');

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    volume INT NOT NULL,
    FOREIGN KEY (symbol) REFERENCES stock_pool(symbol),
    CONSTRAINT check_volume CHECK (volume > 0)
);

-- Create portfolio_transactions table
CREATE TABLE IF NOT EXISTS portfolio_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id INT NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    volume INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE,
    CONSTRAINT check_transaction_volume CHECK (volume > 0),
    CONSTRAINT check_price CHECK (price >= 0)
);
    

