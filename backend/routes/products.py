from flask import Blueprint, jsonify, request, abort, current_app
from models.product import Product
from models.category import Category
from extensions import db

products_bp = Blueprint("products_bp", __name__)

# ------------------ Product Management Endpoints ------------------ #


# Read all products
@products_bp.route("/api/products", methods=["GET"])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        abort(500, description=str(e))


# Read a single product
@products_bp.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if product:
            return jsonify(product.to_dict())
        abort(404, description="Product not found.")
    except Exception as e:
        abort(500, description=str(e))


# Create a new product
@products_bp.route("/api/products", methods=["POST"])
def create_product():
    """
    Expects JSON:
    {
    "name": "Oak Dining Table",
    "description": "A sturdy oak dining table that seats six.",
    "price": 299.99,
    "category_id": 2,
    "img_url": "https://example-bucket.s3.amazonaws.com/mytable.jpg"  <-- optional
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
        img_url = data.get("img_url")

        # Create new product
        new_product = Product(
            name=name,
            description=description,
            price=price,
            category_id=category_id,
            img_url=img_url,
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
@products_bp.route("/api/products/<int:product_id>", methods=["PUT"])
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

        if "img_url" in data:
            product.img_url = data["img_url"]

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
@products_bp.route("/api/products/<int:product_id>", methods=["DELETE"])
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
