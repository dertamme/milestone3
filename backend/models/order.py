from . import db


class Order(db.Model):
    __tablename__ = "orders"
    __table_args__ = {"schema": "cloud"}

    order_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("cloud.customers.customer_id"))
    order_date = db.Column(db.DateTime, server_default=db.func.now())
    status = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    order_items = db.relationship("OrderItem", backref="order", lazy=True)
