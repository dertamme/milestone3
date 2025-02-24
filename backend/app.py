from flask import Flask, jsonify, request
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


# Products endpoint example
@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if product:
            return jsonify(product.to_dict())
        return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

        return jsonify({"error": "Missing required checkout data"}), 400

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


# Add other endpoints as needed (e.g., categories, customers, inventory, orders)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
