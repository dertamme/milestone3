from . import db


class OrderItem(db.Model):
    __tablename__ = "order_items"
    __table_args__ = {"schema": "cloud"}

    order_item_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(
        db.Integer, db.ForeignKey("cloud.orders.order_id"), nullable=False
    )
    product_id = db.Column(
        db.Integer, db.ForeignKey("cloud.products.product_id"), nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    product = db.relationship("Product", backref="order_items", lazy=True)
