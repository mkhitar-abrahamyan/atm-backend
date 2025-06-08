CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username TEXT UNIQUE NOT NULL,
                                     balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS transactions (
                                            id SERIAL PRIMARY KEY,
                                            user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer_in', 'transfer_out')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    target_user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO users (username, balance) VALUES
                                          ('alice', 1000.00),
                                          ('bob', 500.00),
                                          ('charlie', 0.00),
                                          ('david', 250.50),
                                          ('eve', 1200.75);

-- SELECT * FROM users;
-- SELECT * FROM transactions;
