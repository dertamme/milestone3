import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")  # Optional
    SQLALCHEMY_ECHO = False

    # Flask-Mail configurations
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")  # e.g., Gmail SMTP server
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))  # TLS port
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")  # Your email username
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")  # Your email password
    MAIL_DEFAULT_SENDER = os.getenv(
        "MAIL_DEFAULT_SENDER", MAIL_USERNAME
    )  # Default sender
