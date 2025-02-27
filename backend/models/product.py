from extensions import db


class Product(db.Model):
    __tablename__ = "products"
    __table_args__ = {"schema": "cloud"}

    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(
        db.Integer, db.ForeignKey("cloud.categories.category_id"), nullable=False
    )
    price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "name": self.name,
            "description": self.description,
            "category_id": self.category_id,
            "price": float(self.price),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
