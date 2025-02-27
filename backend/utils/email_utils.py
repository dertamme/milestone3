from flask_mail import Message
from flask import render_template
from extensions import mail


def send_order_confirmation_email(customer_email, customer_name, order):
    """
    Sends an order confirmation email to the customer.
    """
    subject = f"Order Confirmation - Order #{order.order_id}"
    msg = Message(subject=subject, recipients=[customer_email])

    # Render HTML and plain-text templates
    msg.html = render_template(
        "emails/order_confirmation.html",
        customer_name=customer_name,
        order_id=order.order_id,
        order_date=order.order_date.strftime("%B %d, %Y"),
        order_items=[item.to_dict() for item in order.order_items],
        total_amount=order.total_amount,
    )
    msg.body = render_template(
        "emails/order_confirmation.txt",
        customer_name=customer_name,
        order_id=order.order_id,
        order_date=order.order_date.strftime("%B %d, %Y"),
        order_items=[item.to_dict() for item in order.order_items],
        total_amount=order.total_amount,
    )

    mail.send(msg)


def send_shipping_notification_email(
    customer_email, customer_name, order, shipping_details
):
    """
    Sends a notification email about the order status update (shipped or otherwise).
    shipping_details is optional or partially used depending on status.
    """
    subject = f"Your Order #{order.order_id} Status Update: {order.status}"
    msg = Message(subject=subject, recipients=[customer_email])

    # Render HTML template
    msg.html = render_template(
        "emails/shipping_notification.html",
        customer_name=customer_name,
        order_id=order.order_id,
        shipping_date=shipping_details.get("shipping_date", "N/A"),
        carrier=shipping_details.get("carrier", "N/A"),
        tracking_number=shipping_details.get("tracking_number", "N/A"),
        tracking_url=shipping_details.get("tracking_url", "N/A"),
    )

    # Render Plain-Text template
    msg.body = render_template(
        "emails/shipping_notification.txt",
        customer_name=customer_name,
        order_id=order.order_id,
        shipping_date=shipping_details.get("shipping_date", "N/A"),
        carrier=shipping_details.get("carrier", "N/A"),
        tracking_number=shipping_details.get("tracking_number", "N/A"),
        tracking_url=shipping_details.get("tracking_url", "N/A"),
    )

    mail.send(msg)
