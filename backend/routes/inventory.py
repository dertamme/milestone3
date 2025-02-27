from flask import Blueprint, jsonify, request, abort, current_app
from models.product import Product
from models.inventory import Inventory
from models.supplier import Supplier
from extensions import db

inventory_bp = Blueprint("inventory_bp", __name__)


@inventory_bp.route("/api/inventory", methods=["GET"])
def get_inventory():
    """
    Retrieves all inventory items.
    Supports optional search by product_id or product_name.
    """
    try:
        search = request.args.get("search", "", type=str)
        query = Inventory.query.join(Product).join(Supplier)

        if search:
            search = f"%{search}%"
            query = query.filter(
                (Inventory.product_id.ilike(search)) | (Product.name.ilike(search))
            )

        inventory_items = query.all()
        return jsonify([item.to_dict() for item in inventory_items]), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching inventory: {str(e)}")
        abort(500, description="An error occurred while fetching inventory.")


@inventory_bp.route("/api/inventory/<int:product_id>", methods=["PUT"])
def update_inventory(product_id):
    """
    Updates the stock_level and/or reorder_level for a specific product.
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="No input data provided.")

        inventory_item = Inventory.query.get(product_id)
        if not inventory_item:
            abort(404, description="Inventory item not found.")

        stock_level = data.get("stock_level")
        reorder_level = data.get("reorder_level")

        if stock_level is not None:
            if not isinstance(stock_level, int) or stock_level < 0:
                abort(400, description="Invalid stock_level provided.")
            inventory_item.stock_level = stock_level

        if reorder_level is not None:
            if not isinstance(reorder_level, int) or reorder_level < 0:
                abort(400, description="Invalid reorder_level provided.")
            inventory_item.reorder_level = reorder_level

        db.session.commit()
        return (
            jsonify(
                {
                    "message": "Inventory updated successfully.",
                    "inventory": inventory_item.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(
            f"Error updating inventory for product_id {product_id}: {str(e)}"
        )
        abort(500, description="An error occurred while updating inventory.")


@inventory_bp.route("/api/inventory/low_stock", methods=["GET"])
def get_low_stock_inventory():
    """
    Retrieves inventory items where stock_level <= reorder_level.
    """
    try:
        low_stock_items = Inventory.query.filter(
            Inventory.stock_level <= Inventory.reorder_level
        ).all()
        return jsonify([item.to_dict() for item in low_stock_items]), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching low stock inventory: {str(e)}")
        abort(500, description="An error occurred while fetching low stock inventory.")
