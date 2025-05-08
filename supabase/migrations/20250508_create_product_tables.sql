-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES categories(id),
    condition VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year VARCHAR(4),
    color VARCHAR(50),
    size VARCHAR(50),
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('fixed_price', 'auction', 'both')),
    price DECIMAL(10,2),
    is_negotiable BOOLEAN,
    start_price DECIMAL(10,2),
    reserve_price DECIMAL(10,2),
    auction_duration INTEGER,
    end_time TIMESTAMP WITH TIME ZONE,
    quantity INTEGER NOT NULL DEFAULT 1,
    allow_offers BOOLEAN,
    location VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id)
);

-- Product images table
CREATE TABLE product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, order_index)
);

-- Product attributes table
CREATE TABLE product_attributes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipping options table
CREATE TABLE shipping_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    method VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product tags table
CREATE TABLE product_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_title ON products(title);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX idx_shipping_options_product ON shipping_options(product_id);
CREATE INDEX idx_product_tags_product ON product_tags(product_id);

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view products" ON products
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create products" ON products
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE
    USING (auth.uid() = user_id);
