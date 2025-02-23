from . import db


class Customer(db.Model):
    __tablename__ = "customers"
    __table_args__ = {"schema": "cloud"}

    customer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    phone = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    orders = db.relationship("Order", backref="customer", lazy=True)
