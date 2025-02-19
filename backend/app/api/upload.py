from flask import request, jsonify
from app.api import bp
import os
from werkzeug.utils import secure_filename
from datetime import datetime

# 修改上传目录为绝对路径
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有文件'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400
            
        if file and allowed_file(file.filename):
            # 生成唯一文件名
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            new_filename = f"{timestamp}_{filename}"
            
            # 确保上传目录存在
            if not os.path.exists(UPLOAD_FOLDER):
                os.makedirs(UPLOAD_FOLDER)
                
            # 保存文件
            file_path = os.path.join(UPLOAD_FOLDER, new_filename)
            file.save(file_path)
            
            # 返回文件URL
            return jsonify({
                'url': f'/uploads/{new_filename}'
            })
            
        return jsonify({'error': '不支持的文件类型'}), 400
        
    except Exception as e:
        print("Upload error:", str(e))  # 添加错误日志
        return jsonify({'error': str(e)}), 500 