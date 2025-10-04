-- Seed data (users, categories, products)
INSERT INTO users (username, password_hash, role) VALUES ('admin@example.com', 'PLACEHOLDER', 'admin') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (username, password_hash, role) VALUES ('seller@example.com', 'PLACEHOLDER', 'seller') ON CONFLICT (username) DO NOTHING;
INSERT INTO users (username, password_hash, role) VALUES ('customer@example.com', 'PLACEHOLDER', 'customer') ON CONFLICT (username) DO NOTHING;

INSERT INTO categories (name, slug) VALUES ('Aquarium', 'aquarium') ON CONFLICT (slug) DO NOTHING;
INSERT INTO products (owner_id, name, description, price, stock_quantity, category_id, image_url, is_active) VALUES (2, 'Betta Splendid', 'Beautiful betta fish', 19.99, 50, 1, NULL, true) ON CONFLICT DO NOTHING;
