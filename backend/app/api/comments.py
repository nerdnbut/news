from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.api import bp
from app.models import Comment, User

@bp.route('/comments', methods=['GET'])
@jwt_required(optional=True)
def get_comments():
    news_id = request.args.get('newsId', type=int)
    current_user_id = get_jwt_identity()
    comments = Comment.query.filter_by(news_id=news_id, parent_id=None).all()
    return jsonify([comment.to_dict(current_user_id=current_user_id) for comment in comments])

@bp.route('/comments', methods=['POST'])
@jwt_required()
def add_comment():
    data = request.get_json()
    comment = Comment(
        content=data['content'],
        author_id=get_jwt_identity(),
        news_id=data['newsId'],
        parent_id=data.get('parentId')
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict())

@bp.route('/comments/<int:id>', methods=['PUT'])
@jwt_required()
def update_comment(id):
    comment = Comment.query.get_or_404(id)
    data = request.get_json()
    
    if comment.author_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
        
    comment.content = data['content']
    db.session.commit()
    return jsonify(comment.to_dict())

@bp.route('/comments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_comment(id):
    comment = Comment.query.get_or_404(id)
    
    if comment.author_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(comment)
    db.session.commit()
    return '', 204

@bp.route('/comments/<int:id>/like', methods=['POST'])
@jwt_required()
def like_comment(id):
    comment = Comment.query.get_or_404(id)
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user in comment.liked_by:
        comment.liked_by.remove(current_user)
        comment.likes -= 1
    else:
        comment.liked_by.append(current_user)
        comment.likes += 1
    
    db.session.commit()
    return jsonify({'likes': comment.likes, 'liked': current_user in comment.liked_by}) 