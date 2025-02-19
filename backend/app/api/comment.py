from flask import jsonify, request
from app import db
from app.api import bp
from app.models import Comment, User
from datetime import datetime

@bp.route('/comments/<int:news_id>', methods=['GET'])
def get_comments(news_id):
    comments = Comment.query.filter_by(
        news_id=news_id,
        parent_id=None
    ).order_by(Comment.created_at.desc()).all()
    
    current_user_id = None
    # if current_user:
    #     current_user_id = current_user.id
    
    return jsonify([
        comment.to_dict(include_children=True, current_user_id=current_user_id) 
        for comment in comments
    ])

@bp.route('/comments', methods=['POST'])
def create_comment():
    try:
        data = request.get_json()
        
        # 检查必要字段
        if not all(key in data for key in ['content', 'newsId', 'authorId']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        comment = Comment(
            content=data['content'],
            news_id=data['newsId'],
            author_id=data['authorId'],  # 必需的作者ID
            parent_id=data.get('parentId'),
            created_at=datetime.utcnow(),
            likes=0
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify(comment.to_dict()), 201
        
    except Exception as e:
        print("Error creating comment:", str(e))  # 添加错误日志
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/comments/<int:id>/like', methods=['POST'])
def like_comment(id):
    try:
        comment = Comment.query.get_or_404(id)
        # current_user_id = get_jwt_identity()
        # user = User.query.get_or_404(current_user_id)
        
        # if user not in comment.liked_by:
        #     comment.liked_by.append(user)
        comment.likes += 1  # 暂时简单处理
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/comments/<int:id>/like', methods=['DELETE'])
def unlike_comment(id):
    try:
        comment = Comment.query.get_or_404(id)
        # current_user_id = get_jwt_identity()
        # user = User.query.get_or_404(current_user_id)
        
        # if user in comment.liked_by:
        #     comment.liked_by.remove(user)
        comment.likes -= 1  # 暂时简单处理
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 