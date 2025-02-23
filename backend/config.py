import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "default-secret-key")  # Optional
    SQLALCHEMY_ECHO = False
