from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import bp
from app.utils import save_file
from app.models import User
from app import db

@bp.route('/uploads/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    file_path = save_file(file, 'avatars')
    if not file_path:
        return jsonify({'error': 'Invalid file type'}), 400
        
    current_user = User.query.get(get_jwt_identity())
    current_user.avatar = file_path
    db.session.commit()
    
    return jsonify({'avatar': file_path})

@bp.route('/uploads/news', methods=['POST'])
@jwt_required()
def upload_news_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    file_path = save_file(file, 'news')
    if not file_path:
        return jsonify({'error': 'Invalid file type'}), 400
        
    return jsonify({'url': file_path}) 