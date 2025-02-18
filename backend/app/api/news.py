from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.api import bp
from app.models import News

@bp.route('/news', methods=['GET'])
def get_news():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 10, type=int)
    sort = request.args.get('sort', 'publish_date')
    order = request.args.get('order', 'desc')
    
    query = News.query
    
    if order == 'desc':
        query = query.order_by(getattr(News, sort).desc())
    else:
        query = query.order_by(getattr(News, sort).asc())
    
    pagination = query.paginate(page=page, per_page=page_size)
    
    return jsonify({
        'items': [news.to_dict() for news in pagination.items],
        'total': pagination.total
    })

@bp.route('/news', methods=['POST'])
@jwt_required()
def create_news():
    data = request.get_json()
    news = News(
        title=data['title'],
        content=data['content'],
        cover_image=data.get('coverImage'),
        category_id=data['category'],
        author_id=get_jwt_identity()
    )
    db.session.add(news)
    db.session.commit()
    return jsonify(news.to_dict())

@bp.route('/news/<int:id>', methods=['PUT'])
@jwt_required()
def update_news(id):
    news = News.query.get_or_404(id)
    data = request.get_json()
    
    news.title = data.get('title', news.title)
    news.content = data.get('content', news.content)
    news.cover_image = data.get('coverImage', news.cover_image)
    news.category_id = data.get('category', news.category_id)
    
    db.session.commit()
    return jsonify(news.to_dict())

@bp.route('/news/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_news(id):
    news = News.query.get_or_404(id)
    db.session.delete(news)
    db.session.commit()
    return '', 204 