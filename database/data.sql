INSERT INTO
    categories (name, description)
VALUES
    ('Tables', 'Different types of wooden tables.'),
    ('Chairs', 'Various wooden chairs.'),
    ('Cabinets', 'Wooden cabinets for storage.');

INSERT INTO
    products (name, description, category_id, price)
VALUES
    (
        'Dining Table',
        'Handcrafted oak dining table.',
        1,
        499.99
    ),
    (
        'Office Chair',
        'Ergonomic wooden office chair.',
        2,
        249.99
    ),
    (
        'Bookshelf Cabinet',
        'Spacious wooden bookshelf with multiple compartments.',
        3,
        399.99
    ),
    (
        'Coffee Table',
        'Compact wooden coffee table with a rustic finish.',
        1,
        199.99
    ),
    (
        'Bedside Table',
        'A small bedside table with a drawer.',
        1,
        149.99
    ),
    ('Bar Stool', 'High wooden bar stool.', 2, 119.99),
    (
        'Rocking Chair',
        'Comfortable rocking chair for the porch.',
        2,
        189.99
    ),
    (
        'Corner Cabinet',
        'Corner cabinet that fits in small spaces.',
        3,
        299.99
    ),
    (
        'TV Console Cabinet',
        'Wide cabinet for a TV and accessories.',
        3,
        359.99
    ),
    (
        'Conference Table',
        'Large table suitable for office meetings.',
        1,
        999.99
    );

INSERT INTO
    customers (name, email, phone)
VALUES
    (
        'Alice Walker',
        'alice.walker@example.com',
        '555-123-4567'
    ),
    (
        'Bob Carpenter',
        'bob.carpenter@example.com',
        '555-987-6543'
    ),
    (
        'Chris Wood',
        'chris.wood@example.com',
        '555-444-5555'
    ),
    (
        'Emily White',
        'emily.white@example.com',
        '555-777-8888'
    );

INSERT INTO
    orders (
        customer_id,
        order_date,
        status,
        total_amount,
        payment_method
    )
VALUES
    (
        1,
        '2025-01-25 14:30:00',
        'Pending',
        749.98,
        'Credit Card'
    ),
    (
        2,
        '2025-01-26 11:00:00',
        'Completed',
        199.99,
        'Bank Transfer'
    );

INSERT INTO
    order_items (order_id, product_id, quantity, price)
VALUES
    (1, 1, 1, 499.99),
    (1, 2, 1, 249.99),
    (2, 4, 1, 199.99);

INSERT INTO
    suppliers (name, contact_name, email, phone, address)
VALUES
    (
        'Wood Masters Ltd.',
        'Charles Oakwood',
        'charles@woodmasters.com',
        '555-1111',
        '123 Forest Ave, Lumber City'
    ),
    (
        'Rustic Creations Co.',
        'Diana Pine',
        'diana@rusticcreations.com',
        '555-2222',
        '789 Timber Lane, Woodville'
    );

INSERT INTO
    inventory (
        product_id,
        stock_level,
        reorder_level,
        supplier_id
    )
VALUES
    (1, 20, 5, 1),
    (2, 15, 3, 1),
    (3, 10, 2, 2),
    (4, 25, 7, 1),
    (5, 10, 2, 2),
    (6, 12, 4, 1),
    (7, 8, 3, 2),
    (8, 6, 2, 2),
    (9, 15, 5, 1),
    (10, 3, 1, 1);
