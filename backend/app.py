from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_migrate import Migrate
from models import db
from models.product import Product
from models.category import Category
from models.customer import Customer
from models.inventory import Inventory
from models.order import Order
from models.order_item import OrderItem
from models.supplier import Supplier
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS to allow communication with the frontend

# Initialize SQLAlchemy
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)


@app.route("/")
def home():
    return jsonify({"message": "Welcome to the LowTech GmbH API!"})


# ------------------ Product Management Endpoints ------------------ #


# Read all products
@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        abort(500, description=str(e))


# Read a single product
@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if product:
            return jsonify(product.to_dict())
        abort(404, description="Product not found.")
    except Exception as e:
        abort(500, description=str(e))


# Create a new product
@app.route("/api/products", methods=["POST"])
def create_product():
    """
    Expects JSON:
    {
      "name": "Oak Dining Table",
      "description": "A sturdy oak dining table that seats six.",
      "price": 299.99,
      "category_id": 2,
    }
    """
    data = request.json

    # Validate required fields
    required_fields = [
        "name",
        "description",
        "price",
        "category_id",
    ]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        abort(400, description=f"Missing fields: {', '.join(missing_fields)}")

    try:
        # Extract data
        name = data["name"]
        description = data["description"]
        price = float(data["price"])
        category_id = int(data["category_id"])

        # Create new product
        new_product = Product(
            name=name, description=description, price=price, category_id=category_id
        )

        db.session.add(new_product)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Product created successfully",
                    "product": new_product.to_dict(),
                }
            ),
            201,
        )

    except ValueError:
        abort(400, description="Invalid data types provided.")
    except Exception as e:
        abort(500, description=str(e))


# Update a product
@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """
    Expects JSON with at least one of the following fields:
    {
      "name": "New Product Name",
      "description": "Updated description.",
      "price": 349.99,
      "category_id": 3,
      "inventory_count": 8,
      "supplier_id": 2
    }
    """
    data = request.json

    if not data:
        abort(400, description="No data provided for update")

    try:
        product = Product.query.get(product_id)
        if not product:
            abort(404, description="Product not found.")

        # Update fields if provided
        if "name" in data:
            product.name = data["name"]
        if "description" in data:
            product.description = data["description"]
        if "category_id" in data:
            category = Category.query.get(int(data["category_id"]))
            if not category:
                abort(400, description="Invalid category_id.")
            product.category_id = int(data["category_id"])
        if "price" in data:
            try:
                product.price = float(data["price"])
            except ValueError:
                abort(400, description="Invalid price value.")

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Product updated successfully",
                    "product": product.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))


# Delete a product
@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """
    Deletes a product by its ID.
    """
    try:
        product = Product.query.get(product_id)
        if not product:
            abort(404, description="Product not found.")

        db.session.delete(product)
        db.session.commit()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))


# ------------------ Order Management Endpoints ------------------ #


# Create a new order
@app.route("/api/orders", methods=["POST"])
def create_order():
    """
    Expects JSON:
    {
      "user_id": 1,
      "address": "123 Main St",
      "payment_method": "PayPal",
      "cart_items": [
        { "product_id": 1, "quantity": 2, "price": 12.99, "name": "Dining Table" },
        ...
      ]
    }
    """

    data = request.json
    user_id = data.get("user_id", 1)  # Default to 1 if not provided
    payment_method = data.get("payment_method")
    cart_items = data.get("cart_items", [])

    if not payment_method or not cart_items:
        abort(400, description="Missing required checkout data")

    # 1. Create a new Order record
    new_order = Order(
        customer_id=user_id,  # or user_id = 1 for tests
        status="Pending",
        total_amount=0,  # We'll sum up from cart_items
        payment_method=payment_method,
    )
    db.session.add(new_order)
    db.session.flush()  # Get the new order_id without committing yet

    # 2. Create OrderItem records from cart_items
    total = 0
    for item in cart_items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)
        price = item.get("price", 0)
        total += price * quantity

        new_item = OrderItem(
            order_id=new_order.order_id,
            product_id=product_id,
            quantity=quantity,
            price=price,
        )
        db.session.add(new_item)

    # 3. Update total_amount
    new_order.total_amount = total
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Order created",
                "order_id": new_order.order_id,
                "total": float(total),
            }
        ),
        201,
    )


# Read all orders
@app.route("/api/orders", methods=["GET"])
def list_orders():
    """
    Lists all orders with basic details.
    Supports pagination and search.
    Query Parameters:
      - page (int): Page number (default: 1)
      - per_page (int): Items per page (default: 10)
      - search (str): Search term to filter orders by order_id or customer_id
    """
    try:
        # Get query parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("search", "", type=str)

        query = Order.query

        if search:
            # Assuming search can be order_id or customer_id
            if search.isdigit():
                search_int = int(search)
                query = query.filter(
                    (Order.order_id == search_int) | (Order.customer_id == search_int)
                )
            else:
                # If search is not numeric, return no results or handle accordingly
                query = query.filter(False)  # No results

        pagination = query.order_by(Order.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        orders = pagination.items

        return (
            jsonify(
                {
                    "orders": [order.to_dict() for order in orders],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": pagination.page,
                    "per_page": pagination.per_page,
                }
            ),
            200,
        )
    except Exception as e:
        abort(500, description=str(e))


# Read a single order
@app.route("/api/orders/<int:order_id>", methods=["GET"])
def get_order_details(order_id):
    """
    Retrieves detailed information about a specific order.
    """
    try:
        order = Order.query.get(order_id)
        if not order:
            abort(404, description="Order not found.")
        return jsonify(order.to_dict()), 200
    except Exception as e:
        abort(500, description=str(e))


# Update status of an order
@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    """
    Updates the status of a specific order.
    Expects JSON:
    {
      "status": "Shipped"
    }
    """
    data = request.json
    new_status = data.get("status")

    if not new_status:
        abort(400, description="Status field is required.")

    allowed_statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
    if new_status not in allowed_statuses:
        abort(
            400,
            description=f"Invalid status. Allowed statuses: {', '.join(allowed_statuses)}.",
        )

    try:
        order = Order.query.get(order_id)
        if not order:
            abort(404, description="Order not found.")

        order.status = new_status
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Order status updated successfully.",
                    "order": order.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))


# Delete an order
@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    """
    Deletes a specific order.
    """
    try:
        order = Order.query.get(order_id)
        if not order:
            abort(404, description="Order not found.")

        db.session.delete(order)
        db.session.commit()

        return jsonify({"message": "Order deleted successfully."}), 200

    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))


# ------------------ Error Handlers ------------------ #


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": error.description}), 400


@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized", "message": error.description}), 401


@app.errorhandler(403)
def forbidden(error):
    return jsonify({"error": "Forbidden", "message": error.description}), 403


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": error.description}), 404


@app.errorhandler(500)
def internal_error(error):
    return (
        jsonify(
            {
                "error": "Internal Server Error",
                "message": error.description,
            }
        ),
        500,
    )


# Add other endpoints as needed (e.g., categories, customers, inventory, orders)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
