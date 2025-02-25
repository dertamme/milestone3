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

    order_items = db.relationship(
        "OrderItem",
        backref="order",
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def to_dict(self):
        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "order_date": self.order_date,
            "status": self.status,
            "total_amount": float(self.total_amount),
            "payment_method": self.payment_method,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "order_items": [item.to_dict() for item in self.order_items],
        }
