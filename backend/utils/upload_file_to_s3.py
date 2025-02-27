import boto3
from flask import current_app  # To access current_app.config
from werkzeug.utils import secure_filename


def upload_file_to_s3(file):
    s3 = boto3.client("s3")
    folder = "images"
    bucket_name = current_app.config["IMAGE_BUCKET"]

    # Generate a safe filename
    filename = secure_filename(file.filename)
    s3_key = f"{folder}/{filename}"

    s3.upload_fileobj(
        file,
        bucket_name,
        s3_key,
        ExtraArgs={
            "ACL": "public-read",  # or remove if you want private
            "ContentType": file.content_type,
        },
    )

    # Return the public URL
    url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
    return url
