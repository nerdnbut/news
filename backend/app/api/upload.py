from flask import request, jsonify, current_app
from app.api import bp
import os
from werkzeug.utils import secure_filename
from datetime import datetime

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
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
            # 安全处理文件名
            original_filename = secure_filename(file.filename)
            # 获取文件扩展名
            if '.' in original_filename:
                ext = original_filename.rsplit('.', 1)[1].lower()
            else:
                ext = 'png'  # 默认扩展名
                
            # 生成新文件名
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            new_filename = f"{timestamp}.{ext}"
            
            # 确保上传目录存在
            upload_folder = current_app.config['UPLOAD_FOLDER']
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
                
            # 保存文件
            file_path = os.path.join(upload_folder, new_filename)
            file.save(file_path)
            
            # 返回文件URL
            return jsonify({
                'url': f'/uploads/{new_filename}'
            })
            
        return jsonify({'error': '不支持的文件类型'}), 400
        
    except Exception as e:
        print("Upload error:", str(e))  # 添加错误日志
        return jsonify({'error': str(e)}), 500 