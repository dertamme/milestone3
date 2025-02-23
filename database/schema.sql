-- DROP SCHEMA cloud;
CREATE SCHEMA cloud AUTHORIZATION postgres;

-- DROP SEQUENCE categories_category_id_seq;
CREATE SEQUENCE categories_category_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE customers_customer_id_seq;
CREATE SEQUENCE customers_customer_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE inventory_inventory_id_seq;
CREATE SEQUENCE inventory_inventory_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE order_items_order_item_id_seq;
CREATE SEQUENCE order_items_order_item_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE orders_order_id_seq;
CREATE SEQUENCE orders_order_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE products_product_id_seq;
CREATE SEQUENCE products_product_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- DROP SEQUENCE suppliers_supplier_id_seq;
CREATE SEQUENCE suppliers_supplier_id_seq INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE;

-- cloud.categories definition
-- Drop table
-- DROP TABLE categories;
CREATE TABLE categories (
    category_id serial4 NOT NULL,
    "name" text NOT NULL,
    description text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (category_id)
);

-- cloud.customers definition
-- Drop table
-- DROP TABLE customers;
CREATE TABLE customers (
    customer_id serial4 NOT NULL,
    "name" text NOT NULL,
    email text NOT NULL,
    phone text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT customers_email_key UNIQUE (email),
    CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
);

-- cloud.inventory definition
-- Drop table
-- DROP TABLE inventory;
CREATE TABLE inventory (
    inventory_id serial4 NOT NULL,
    product_id int4 NOT NULL,
    stock_level int4 NOT NULL,
    reorder_level int4 NOT NULL,
    supplier_id int4 NOT NULL,
    CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id),
    CONSTRAINT inventory_product_id_key UNIQUE (product_id),
    CONSTRAINT inventory_reorder_level_check CHECK ((reorder_level >= 0)),
    CONSTRAINT inventory_stock_level_check CHECK ((stock_level >= 0))
);

-- cloud.order_items definition
-- Drop table
-- DROP TABLE order_items;
CREATE TABLE order_items (
    order_item_id serial4 NOT NULL,
    order_id int4 NOT NULL,
    product_id int4 NOT NULL,
    quantity int4 NOT NULL,
    price numeric(10, 2) NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);

-- cloud.orders definition
-- Drop table
-- DROP TABLE orders;
CREATE TABLE orders (
    order_id serial4 NOT NULL,
    customer_id int4 NULL,
    order_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    status text NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    payment_method varchar(50) NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (order_id)
);

-- cloud.products definition
-- Drop table
-- DROP TABLE products;
CREATE TABLE products (
    product_id serial4 NOT NULL,
    "name" text NOT NULL,
    description text NULL,
    category_id int4 NOT NULL,
    price numeric(10, 2) NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT products_pkey PRIMARY KEY (product_id)
);

-- cloud.suppliers definition
-- Drop table
-- DROP TABLE suppliers;
CREATE TABLE suppliers (
    supplier_id serial4 NOT NULL,
    "name" text NOT NULL,
    contact_name text NULL,
    email text NULL,
    phone text NULL,
    address text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT suppliers_email_key UNIQUE (email),
    CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id)
);

-- Add foreign key for products.category_id -> categories.category_id
ALTER TABLE
    cloud.products
ADD
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES cloud.categories (category_id);

-- Add foreign key for inventory.product_id -> products.product_id
ALTER TABLE
    cloud.inventory
ADD
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES cloud.products (product_id);

-- Add foreign key for inventory.supplier_id -> suppliers.supplier_id
ALTER TABLE
    cloud.inventory
ADD
    CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id) REFERENCES cloud.suppliers (supplier_id);

-- Add foreign key for order_items.product_id -> products.product_id
ALTER TABLE
    cloud.order_items
ADD
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES cloud.products (product_id);

-- Add foreign key for order_items.order_id -> orders.order_id
ALTER TABLE
    cloud.order_items
ADD
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES cloud.orders (order_id);

-- Add foreign key for orders.customer_id -> customers.customer_id
ALTER TABLE
    cloud.orders
ADD
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES cloud.customers (customer_id);
