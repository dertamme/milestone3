from flask import Flask, jsonify
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


# Add other endpoints as needed (e.g., categories, customers, inventory, orders)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
