from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import jsonify
import os
from werkzeug.utils import secure_filename
from flask import current_app
from datetime import datetime

def hash_password(password):
    return generate_password_hash(password)

def check_password(hash_value, password):
    return check_password_hash(hash_value, password)

class APIError(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv 

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, folder):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # 生成唯一文件名
        unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], folder, unique_filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        file.save(file_path)
        return f"/uploads/{folder}/{unique_filename}"
    return None 