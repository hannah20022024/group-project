
CREATE TABLE cash_balance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(12, 2) NOT NULL
);

INSERT INTO cash_balance (amount) VALUES
(7366.84),
(5696.36),
(12183.12),
(6658.49),
(19640.6),
(12050.7),
(11211.2),
(10941.85),
(16568.89),
(15801.39);


CREATE TABLE holdings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    avg_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE,
    sector VARCHAR(50),
    notes TEXT
);

INSERT INTO holdings (symbol, quantity, avg_price, purchase_date, sector, notes) VALUES
('SYM1', 9, 949.05, '2025-02-13', 'AI & Chips', 'Note 1'),
('SYM2', 96, 757.55, '2025-03-30', 'Technology', 'Note 2'),
('SYM3', 44, 367.26, '2025-03-21', 'AI & Chips', 'Note 3'),
('SYM4', 93, 687.82, '2025-04-07', 'AI & Chips', 'Note 4'),
('SYM5', 56, 267.19, '2025-07-22', 'Healthcare', 'Note 5'),
('SYM6', 32, 661.7, '2025-03-08', 'EV', 'Note 6'),
('SYM7', 54, 554.99, '2025-07-09', 'Healthcare', 'Note 7'),
('SYM8', 41, 69.76, '2025-07-14', 'AI & Chips', 'Note 8'),
('SYM9', 53, 878.66, '2025-06-06', 'Technology', 'Note 9'),
('SYM10', 27, 881.43, '2025-06-27', 'Healthcare', 'Note 10'),
('SYM11', 28, 111.76, '2025-03-01', 'Technology', 'Note 11'),
('SYM12', 100, 780.67, '2025-02-14', 'EV', 'Note 12'),
('SYM13', 42, 889.21, '2025-07-11', 'Technology', 'Note 13'),
('SYM14', 99, 186.87, '2025-03-16', 'EV', 'Note 14'),
('SYM15', 74, 477.95, '2025-06-10', 'AI & Chips', 'Note 15');


CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(10) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    note TEXT
);

INSERT INTO transactions (symbol, type, quantity, price, date, note) VALUES
('SYM1', 'buy', 43, 782.7, '2025-03-12', 'Transaction 1'),
('SYM2', 'sell', 25, 506.79, '2025-03-24', 'Transaction 2'),
('SYM3', 'sell', 19, 885.59, '2025-02-24', 'Transaction 3'),
('SYM4', 'sell', 41, 658.43, '2025-01-10', 'Transaction 4'),
('SYM5', 'buy', 49, 643.38, '2025-04-22', 'Transaction 5'),
('SYM6', 'buy', 19, 216.56, '2025-05-04', 'Transaction 6'),
('SYM7', 'buy', 20, 60.59, '2025-04-20', 'Transaction 7'),
('SYM8', 'buy', 7, 967.08, '2025-01-20', 'Transaction 8'),
('SYM9', 'buy', 20, 849.37, '2025-01-05', 'Transaction 9'),
('SYM10', 'buy', 38, 196.09, '2025-04-16', 'Transaction 10'),
('SYM11', 'buy', 37, 360.21, '2025-06-10', 'Transaction 11'),
('SYM12', 'buy', 46, 609.65, '2025-01-06', 'Transaction 12'),
('SYM13', 'sell', 50, 499.94, '2025-07-15', 'Transaction 13'),
('SYM14', 'buy', 6, 102.95, '2025-05-25', 'Transaction 14'),
('SYM15', 'sell', 48, 172.54, '2025-01-27', 'Transaction 15');


CREATE TABLE recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(10) NOT NULL,
    suggestion ENUM('buy', 'sell', 'hold') NOT NULL,
    current_price DECIMAL(10, 2),
    target_price DECIMAL(10, 2),
    confidence DECIMAL(3,2),
    risk_level ENUM('Low', 'Medium', 'High'),
    sector VARCHAR(50),
    reasons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO recommendations (symbol, suggestion, current_price, target_price, confidence, risk_level, sector, reasons) VALUES
('SYM1', 'hold', 497.65, 572.85, 0.57, 'Low', 'AI & Chips', 'Reason 1'),
('SYM2', 'buy', 79.05, 278.96, 0.65, 'Medium', 'AI & Chips', 'Reason 2'),
('SYM3', 'hold', 211.77, 85.01, 0.52, 'Low', 'Finance', 'Reason 3'),
('SYM4', 'hold', 340.73, 346.56, 0.71, 'Low', 'Technology', 'Reason 4'),
('SYM5', 'hold', 335.18, 500.05, 0.78, 'Low', 'AI & Chips', 'Reason 5'),
('SYM6', 'hold', 322.56, 745.59, 0.84, 'Medium', 'Finance', 'Reason 6'),
('SYM7', 'hold', 599.67, 306.29, 0.81, 'High', 'Finance', 'Reason 7'),
('SYM8', 'hold', 818.11, 421.66, 0.83, 'Medium', 'Technology', 'Reason 8'),
('SYM9', 'hold', 434.79, 1135.57, 0.66, 'Medium', 'AI & Chips', 'Reason 9'),
('SYM10', 'buy', 658.47, 93.05, 0.97, 'Medium', 'Technology', 'Reason 10'),
('SYM11', 'hold', 631.57, 427.93, 0.65, 'High', 'Finance', 'Reason 11'),
('SYM12', 'buy', 546.47, 511.73, 0.93, 'Low', 'Finance', 'Reason 12'),
('SYM13', 'hold', 485.71, 980.74, 0.85, 'Medium', 'AI & Chips', 'Reason 13'),
('SYM14', 'sell', 745.4, 302.72, 0.55, 'Low', 'Finance', 'Reason 14'),
('SYM15', 'buy', 331.99, 1184.83, 0.85, 'Low', 'AI & Chips', 'Reason 15');


CREATE TABLE strategy_simulations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    strategy_name VARCHAR(50),
    start_date DATE,
    end_date DATE,
    initial_cash DECIMAL(10,2),
    total_return DECIMAL(10,2),
    return_percent DECIMAL(5,2),
    trades TEXT,
    chart_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO strategy_simulations (strategy_name, start_date, end_date, initial_cash, total_return, return_percent, trades, chart_data) VALUES
('strategy_1', '2025-04-25', '2025-01-03', 10000.00, 9874.22, -3.27, '[{"symbol": "SYM1", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 472.36}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 12217.55}]'),
('strategy_2', '2025-02-02', '2025-06-01', 10000.00, 11382.41, 12.35, '[{"symbol": "SYM2", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 310.83}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 11765.76}]'),
('strategy_3', '2025-01-29', '2025-05-17', 10000.00, 9925.86, -4.0, '[{"symbol": "SYM3", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 165.46}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 12036.02}]'),
('strategy_4', '2025-03-11', '2025-02-28', 10000.00, 11481.08, 26.88, '[{"symbol": "SYM4", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 176.38}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 10485.36}]'),
('strategy_5', '2025-07-10', '2025-01-07', 10000.00, 11066.56, 13.41, '[{"symbol": "SYM5", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 457.04}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 11409.58}]'),
('strategy_6', '2025-06-10', '2025-07-21', 10000.00, 10841.39, 12.74, '[{"symbol": "SYM6", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 262.88}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 11385.06}]'),
('strategy_7', '2025-02-07', '2025-01-26', 10000.00, 12583.4, 9.89, '[{"symbol": "SYM7", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 165.56}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 12720.95}]'),
('strategy_8', '2025-03-18', '2025-05-17', 10000.00, 11410.65, 1.13, '[{"symbol": "SYM8", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 341.03}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 11198.44}]'),
('strategy_9', '2025-06-29', '2025-01-08', 10000.00, 11013.41, 2.97, '[{"symbol": "SYM9", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 115.44}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 10731.78}]'),
('strategy_10', '2025-03-31', '2025-01-15', 10000.00, 12731.92, 25.7, '[{"symbol": "SYM10", "buy_date": "2025-01-01", "sell_date": "2025-03-01", "profit": 101.27}]', '[{"date": "2025-01-01", "value": 10000}, {"date": "2025-07-01", "value": 11811.64}]');