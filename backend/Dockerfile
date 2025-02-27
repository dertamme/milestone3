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

# Expose the port your Flask app runs on (e.g. 5000)
EXPOSE 5000

# Command to run Flask
CMD ["python", "app.py"]
