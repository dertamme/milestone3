from flask import Blueprint, jsonify, request, abort, current_app
from models.order import Order
from models.order_item import OrderItem
from models.customer import Customer
from models.inventory import Inventory
from utils.email_utils import (
    send_order_confirmation_email,
    send_shipping_notification_email,
)
from extensions import db

orders_bp = Blueprint("orders_bp", __name__)


# Create a new order
@orders_bp.route("/api/orders", methods=["POST"])
def create_order():
    """
    Creates a new order and updates inventory stock levels.
    Expected JSON structure:
    {
        "customer_id": 1,
        "payment_method": "Credit Card",
        "order_items": [
            {
                "product_id": 1,
                "quantity": 2
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="No input data provided.")

        print(data)

        customer_id = data.get("customer_id")
        payment_method = data.get("payment_method")
        order_items_data = data.get("order_items", [])

        if not customer_id or not payment_method or not order_items_data:
            abort(400, description="Missing required order fields.")

        # Fetch customer
        customer = Customer.query.get(customer_id)
        if not customer:
            abort(404, description="Customer not found.")

        # Create Order
        new_order = Order(
            customer_id=customer_id,
            payment_method=payment_method,
            status="Pending",  # Default status
            total_amount=0,  # Will calculate based on order items
        )
        db.session.add(new_order)
        db.session.flush()  # Flush to get order_id

        total_amount = 0
        for item in order_items_data:
            product_id = item.get("product_id")
            quantity = item.get("quantity")

            if not product_id or not quantity:
                abort(
                    400,
                    description="Missing product_id or quantity in order items.",
                )

            inventory_item = Inventory.query.get(product_id)
            if not inventory_item:
                abort(
                    404,
                    description=f"Inventory item with product_id {product_id} not found.",
                )

            if inventory_item.stock_level < quantity:
                abort(
                    400,
                    description=f"Insufficient stock for product_id {product_id}.",
                )

            # Decrement stock level
            inventory_item.stock_level -= quantity

            # Calculate total amount (assuming you have a way to get product price)
            product = inventory_item.product
            if not product:
                abort(
                    404,
                    description=f"Product with product_id {product_id} not found.",
                )

            item_total = float(product.price) * quantity
            total_amount += item_total

            # Create OrderItem
            order_item = OrderItem(
                order_id=new_order.order_id,
                product_id=product_id,
                quantity=quantity,
                price=product.price,
            )
            db.session.add(order_item)

        new_order.total_amount = total_amount

        db.session.commit()

        # Send Order Confirmation Email
        send_order_confirmation_email(
            customer_email=customer.email,
            customer_name=customer.name,
            order=new_order,
        )

        # Optionally, check for low stock and notify
        low_stock_items = Inventory.query.filter(
            Inventory.stock_level <= Inventory.reorder_level
        ).all()
        if low_stock_items:
            # Implement your notification logic here
            # For example, send an email or log a message
            for item in low_stock_items:
                current_app.logger.info(
                    f"Low stock alert for product_id {item.product_id}: Stock Level = {item.stock_level}"
                )

        return (
            jsonify(
                {
                    "message": "Order created successfully.",
                    "order_id": new_order.order_id,
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating order: {str(e)}")
        abort(500, description="An error occurred while creating the order.")


# Read all orders
@orders_bp.route("/api/orders", methods=["GET"])
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
@orders_bp.route("/api/orders/<int:order_id>", methods=["GET"])
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
@orders_bp.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    """
    Updates the status of an order and sends a status/shipping notification on
    every status change.

    Expected JSON structure:
    {
        "status": "Shipped",
        "shipping_details": {
            "shipping_date": "2025-01-31",
            "carrier": "UPS",
            "tracking_number": "1Z999AA10123456784",
            "tracking_url": "https://www.ups.com/track?loc=en_US&tracknum=1Z999AA10123456784"
        }
    }

    Note: shipping_details is optional but recommended if the status is "Shipped".
    """
    try:
        data = request.get_json()
        if not data:
            abort(400, description="No input data provided.")

        new_status = data.get("status")
        shipping_details = data.get("shipping_details", {})

        if not new_status:
            abort(400, description="Status field is required.")

        # Fetch the order
        order = Order.query.get(order_id)
        if not order:
            abort(404, description="Order not found.")

        previous_status = order.status

        # Update the status
        order.status = new_status
        db.session.commit()

        # If the status has changed, send a notification email
        if previous_status != new_status:
            # Get the associated customer
            customer = order.customer
            if not customer:
                abort(404, description="Associated customer not found.")

            # (Optional) If you want shipping_details to be mandatory only for "Shipped":
            # if new_status == "Shipped":
            #     required_fields = ["shipping_date", "carrier", "tracking_number", "tracking_url"]
            #     if not all(field in shipping_details for field in required_fields):
            #         abort(400, description="Missing shipping details fields for Shipped status.")

            send_shipping_notification_email(
                customer_email=customer.email,
                customer_name=customer.name,
                order=order,
                shipping_details=shipping_details,
            )

        return jsonify({"message": "Order status updated successfully."}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating order status: {str(e)}")
        abort(500, description="An error occurred while updating the order status.")


# Delete an order
@orders_bp.route("/api/orders/<int:order_id>", methods=["DELETE"])
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
