from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app import db
from app.api import bp
from app.models import User
import traceback
from flask_cors import cross_origin

@bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received data:", data)
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
            
        user = User(username=data['username'])
        user.set_password(data['password'])
        print("Created user object:", user)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print("Error:", str(e))
        print("Traceback:", traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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
    
    return jsonify({'error': 'Invalid credentials'}), 401 