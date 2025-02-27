from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import mail, db
from routes import *
from models import *


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # Enable CORS to allow communication with the frontend

    # Initialize extensions with the app
    db.init_app(app)
    mail.init_app(app)
    # migrate = Migrate(app, db)

    # Use Blueprints for better organization
    app.register_blueprint(orders_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(inventory_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
