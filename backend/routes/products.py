from flask import Blueprint, jsonify, request, abort, current_app
from models.product import Product
from models.category import Category
from utils.upload_file_to_s3 import upload_file_to_s3
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
    Expects multipart/form-data:
      - name, description, price, category_id in request.form
      - optional 'img_url' in request.form
      - optional 'image' in request.files
    """
    if "name" not in request.form:
        abort(400, description="Missing field: name")
    # ... check for other required fields

    try:
        name = request.form["name"]
        description = request.form["description"]
        price = float(request.form["price"])
        category_id = int(request.form["category_id"])
        img_url = request.form.get("img_url")  # optional

        # Check if an image file is included
        image_file = request.files.get("image")
        uploaded_image_url = None

        if image_file:
            # 1) Upload image_file to S3 or local storage, get the final URL
            # For example, if using S3:
            uploaded_image_url = upload_file_to_s3(image_file)

            # 2) Or if storing locally:
            # image_file.save("/path/to/local.jpg")
            # uploaded_image_url = "http://yourdomain.com/static/local.jpg"

        # Decide final image link: user-defined URL or newly uploaded file
        final_img_url = img_url or uploaded_image_url

        # Create new product
        new_product = Product(
            name=name,
            description=description,
            price=price,
            category_id=category_id,
            img_url=final_img_url,
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

    except ValueError as e:
        abort(400, description=f"Invalid data: {str(e)}")
    except Exception as e:
        current_app.logger.error(f"Error creating product: {str(e)}")
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
    product = Product.query.get(product_id)
    if not product:
        abort(404, description="Product not found.")

    # The request could come in as multipart form data
    # Check if the required fields are present if you want to enforce them,
    # otherwise they can be optional for an update.
    try:
        # If the user updated "name"
        if "name" in request.form:
            product.name = request.form["name"]

        if "description" in request.form:
            product.description = request.form["description"]

        if "price" in request.form:
            try:
                product.price = float(request.form["price"])
            except ValueError:
                abort(400, description="Invalid price value.")

        if "category_id" in request.form:
            category_id = int(request.form["category_id"])
            # optional: validate that the category actually exists
            category = Category.query.get(category_id)
            if not category:
                abort(400, description="Invalid category_id.")
            product.category_id = category_id

        # If user typed a direct URL (overriding an existing image)
        new_img_url = request.form.get("img_url")  # optional
        if new_img_url:
            product.img_url = new_img_url

        # Check if an image file is included
        image_file = request.files.get("image")
        if image_file:
            # 1) Upload image_file to S3 (or local folder) and get final URL
            uploaded_image_url = upload_file_to_s3(image_file)

            # If you want to override any previously stored URL
            product.img_url = uploaded_image_url

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
