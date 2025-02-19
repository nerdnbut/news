from flask import jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity
from app import db
from app.api import bp
from app.models import User
import traceback
# from flask_jwt_extended import jwt_required  # 暂时注释掉

@bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received registration data:", data)
        
        # 检查必要字段
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': '用户名和密码不能为空'}), 400
            
        # 检查用户名是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': '该用户名已被注册'}), 400
            
        # 创建新用户
        user = User(username=data['username'])
        user.set_password(data['password'])
        
        # 可选字段
        if 'email' in data:
            user.email = data['email']
        if 'interests' in data:
            if isinstance(data['interests'], list):
                user.interests = ','.join(data['interests'])
            else:
                user.interests = data['interests']
        
        db.session.add(user)
        db.session.commit()
        
        token = create_access_token(identity=user.id)
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        print("Registration error:", str(e))
        db.session.rollback()
        return jsonify({'error': '注册失败，请稍后重试'}), 500

@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        token = create_access_token(identity=user.id)
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })
    
    return jsonify({'error': '用户名或密码错误'}), 401

@bp.route('/auth/profile', methods=['PUT'])
# @jwt_required()  # 暂时注释掉
def update_profile():
    data = request.get_json()
    
    # 检查是否提供了用户ID
    user_id = data.get('id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']
    
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 