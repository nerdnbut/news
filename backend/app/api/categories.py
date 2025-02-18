from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app import db
from app.api import bp
from app.models import Category

@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(parent_id=None).all()
    return jsonify([category.to_dict() for category in categories])

@bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    category = Category(
        name=data['name'],
        level=data['level'],
        parent_id=data.get('parentId')
    )
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict())

@bp.route('/categories/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    category = Category.query.get_or_404(id)
    data = request.get_json()
    
    category.name = data.get('name', category.name)
    category.level = data.get('level', category.level)
    category.parent_id = data.get('parentId', category.parent_id)
    
    db.session.commit()
    return jsonify(category.to_dict())

@bp.route('/categories/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    db.session.commit()
    return '', 204 