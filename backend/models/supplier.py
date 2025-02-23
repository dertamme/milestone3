from . import db


class Supplier(db.Model):
    __tablename__ = "suppliers"
    __table_args__ = {"schema": "cloud"}

    supplier_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    contact_name = db.Column(db.Text)
    email = db.Column(db.Text, unique=True)
    phone = db.Column(db.Text)
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
