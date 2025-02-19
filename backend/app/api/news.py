from flask import jsonify, request
from app import db
from app.api import bp
from app.models import News, User
# from flask_jwt_extended import jwt_required, get_jwt_identity  # 暂时注释掉
from datetime import datetime
import traceback
from app.api.notification import create_notifications  # 添加这行导入

@bp.route('/news', methods=['GET'])
def get_news_list():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('pageSize', 12, type=int)
    sort = request.args.get('sort', 'publishDate')
    order = request.args.get('order', 'desc')
    category = request.args.get('category')

    query = News.query

    # 添加分类筛选，将中文分类转换为英文
    if category and category.strip():
        # 使用 CATEGORY_MAP_REVERSE 将中文转换为英文
        english_category = News.CATEGORY_MAP_REVERSE.get(category)
        if english_category:
            query = query.filter(News.category == english_category)
    
    # 添加排序
    if sort == 'publishDate':
        query = query.order_by(News.publishDate.desc() if order == 'desc' else News.publishDate.asc())
    elif sort == 'views':
        query = query.order_by(News.views.desc() if order == 'desc' else News.views.asc())
    
    pagination = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total
    })

@bp.route('/news/<int:id>', methods=['GET'])
def get_news(id):
    news = News.query.get_or_404(id)
    return jsonify(news.to_dict())

@bp.route('/news', methods=['POST'])
def create_news():
    try:
        data = request.get_json()
        
        # 将中文分类转换为英文
        category = News.CATEGORY_MAP_REVERSE.get(data.get('category', '未分类'), data.get('category', '未分类'))
        
        news = News(
            title=data['title'],
            content=data['content'],
            category=category,  # 使用转换后的分类
            coverImage=data.get('coverImage'),
            author_id=data.get('authorId'),
            publishDate=datetime.utcnow(),
            views=0
        )
        
        db.session.add(news)
        db.session.commit()
        
        # 创建通知
        create_notifications(news)
        
        return jsonify(news.to_dict()), 201
        
    except Exception as e:
        print("Error creating news:", str(e))
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/news/<int:id>', methods=['PUT'])
# @jwt_required()  # 暂时注释掉
def update_news(id):
    news = News.query.get_or_404(id)
    # current_user_id = get_jwt_identity()  # 暂时注释掉
    
    # if news.author_id != current_user_id:  # 暂时注释掉权限检查
    #     return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    for field in ['title', 'content', 'category', 'coverImage']:
        if field in data:
            setattr(news, field, data[field])
    
    db.session.commit()
    return jsonify(news.to_dict())

@bp.route('/news/<int:id>', methods=['DELETE'])
# @jwt_required()  # 暂时注释掉
def delete_news(id):
    news = News.query.get_or_404(id)
    # current_user_id = get_jwt_identity()  # 暂时注释掉
    
    # if news.author_id != current_user_id:  # 暂时注释掉权限检查
    #     return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(news)
    db.session.commit()
    return '', 204 