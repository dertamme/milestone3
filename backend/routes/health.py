from flask import Blueprint, jsonify

health_bp = Blueprint("health_bp", __name__)


@health_bp.route("/", methods=["GET"])
def health():
    """
    Simple health check endpoint returning a 200 status and
    a small JSON payload indicating the app is OK.
    """
    return jsonify({"status": "ok"}), 200
