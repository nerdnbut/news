from flask import jsonify, request
from app import db
from app.api import bp
from app.models import Notification, User, News
from datetime import datetime

@bp.route('/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('userId', type=int)
    if not user_id:
        return jsonify({'error': 'Missing user ID'}), 400
        
    notifications = Notification.query.filter_by(
        user_id=user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return jsonify([n.to_dict() for n in notifications])

@bp.route('/notifications/<int:id>/read', methods=['PUT'])
def mark_notification_read(id):
    notification = Notification.query.get_or_404(id)
    notification.read = True
    db.session.commit()
    return '', 204

# 在创建新闻时调用此函数
def create_notifications(news):
    # 获取对该分类感兴趣的用户
    interested_users = User.query.filter(
        User.interests.like(f'%{news.category}%')
    ).all()
    
    # 为每个感兴趣的用户创建通知
    for user in interested_users:
        notification = Notification(
            user_id=user.id,
            news_id=news.id
        )
        db.session.add(notification)
    
    db.session.commit() 