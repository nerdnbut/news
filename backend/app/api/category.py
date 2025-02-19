from flask import jsonify, request
from app import db
from app.api import bp
from app.models import Category

@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(parent_id=None).all()
    return jsonify([{
        'id': category.id,
        'name': category.name,
        'level': category.level,
        'parentId': category.parent_id
    } for category in categories])

@bp.route('/categories', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        
        category = Category(
            name=data['name'],
            parent_id=data.get('parentId'),
            level=0 if not data.get('parentId') else 
                  Category.query.get(data['parentId']).level + 1
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify(category.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/categories/<int:id>', methods=['PUT'])
def update_category(id):
    try:
        category = Category.query.get_or_404(id)
        data = request.get_json()
        
        if 'name' in data:
            category.name = data['name']
            
        if 'parentId' in data and data['parentId'] != category.parent_id:
            # 检查是否形成循环引用
            if data['parentId'] and category.id == data['parentId']:
                return jsonify({'error': '不能将分类设为自己的子分类'}), 400
                
            parent = Category.query.get(data['parentId']) if data['parentId'] else None
            if parent:
                # 检查新父分类是否是当前分类的子分类
                current = parent
                while current:
                    if current.id == category.id:
                        return jsonify({'error': '不能将分类设为其子分类的子分类'}), 400
                    current = current.parent
                    
            category.parent_id = data['parentId']
            category.level = 0 if not data['parentId'] else parent.level + 1
            
            # 更新所有子分类的level
            def update_children_level(cat):
                for child in cat.children:
                    child.level = cat.level + 1
                    update_children_level(child)
                    
            update_children_level(category)
        
        db.session.commit()
        return jsonify(category.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    try:
        category = Category.query.get_or_404(id)
        
        # 检查是否有子分类
        if category.children:
            return jsonify({'error': '无法删除含有子分类的分类'}), 400
            
        db.session.delete(category)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 