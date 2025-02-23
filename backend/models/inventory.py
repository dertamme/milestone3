from . import db


class Inventory(db.Model):
    __tablename__ = "inventory"
    __table_args__ = {"schema": "cloud"}

    inventory_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("cloud.products.product_id"),
        unique=True,
        nullable=False,
    )
    stock_level = db.Column(db.Integer, nullable=False)
    reorder_level = db.Column(db.Integer, nullable=False)
    supplier_id = db.Column(
        db.Integer, db.ForeignKey("cloud.suppliers.supplier_id"), nullable=False
    )

    product = db.relationship("Product", backref="inventory", lazy=True)
    supplier = db.relationship("Supplier", backref="inventory", lazy=True)
