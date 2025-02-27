from extensions import db


class Category(db.Model):
    __tablename__ = "categories"
    __table_args__ = {"schema": "cloud"}

    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
