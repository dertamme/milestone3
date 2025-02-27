# syntax=docker/dockerfile:1
FROM python:3.10.2

# Create a working directory
WORKDIR /app

# Install any system dependencies if needed
# e.g. libpq-dev for psycopg2 compilation
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy your Flask code
COPY . .

# Set environment variables (if any)
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose port for Flask (Gunicorn listens on 8000 internally)
EXPOSE 8000

# Start the app with Gunicorn (bind to 0.0.0.0:8000 for ECS)
CMD ["gunicorn", "--workers=4", "--bind=0.0.0.0:8000", "app:app"]
