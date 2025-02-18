from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import os

app = Flask(__name__)

# 配置
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///news.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev')

# 初始化扩展
db = SQLAlchemy(app)
jwt = JWTManager(app)

# 数据模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    news = db.relationship('News', backref='author_ref', lazy=True)
    comments = db.relationship('Comment', backref='author_ref', lazy=True)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))
    news = db.relationship('News', backref='category_ref', lazy=True)

class News(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(200))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    publish_date = db.Column(db.DateTime, default=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='news_ref', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    news_id = db.Column(db.Integer, db.ForeignKey('news.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    children = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]))

# 认证相关路由
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    user = User(username=data['username'], password=data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.password == data['password']:
        token = create_access_token(identity=user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

# 分类相关路由
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'level': c.level,
        'parentId': c.parent_id,
        'children': [{
            'id': child.id,
            'name': child.name,
            'level': child.level,
            'parentId': child.parent_id
        } for child in c.children]
    } for c in categories if c.parent_id is None])

@app.route('/api/categories', methods=['POST'])
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
    return jsonify({
        'id': category.id,
        'name': category.name,
        'level': category.level,
        'parentId': category.parent_id
    })

@app.route('/api/categories/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    category = Category.query.get_or_404(id)
    data = request.get_json()
    
    category.name = data.get('name', category.name)
    category.level = data.get('level', category.level)
    category.parent_id = data.get('parentId', category.parent_id)
    
    db.session.commit()
    return jsonify({
        'id': category.id,
        'name': category.name,
        'level': category.level,
        'parentId': category.parent_id
    })

@app.route('/api/categories/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    category = Category.query.get_or_404(id)
    db.session.delete(category)
    db.session.commit()
    return '', 204

# 新闻相关路由
@app.route('/api/news', methods=['GET'])
def get_news():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 10, type=int)
    sort = request.args.get('sort', 'publishDate')
    order = request.args.get('order', 'desc')
    
    query = News.query
    
    if order == 'desc':
        query = query.order_by(getattr(News, sort).desc())
    else:
        query = query.order_by(getattr(News, sort).asc())
    
    pagination = query.paginate(page=page, per_page=page_size)
    
    return jsonify({
        'items': [{
            'id': news.id,
            'title': news.title,
            'content': news.content,
            'coverImage': news.cover_image,
            'category': news.category_ref.name,
            'author': news.author_ref.username,
            'publishDate': news.publish_date.isoformat(),
            'views': news.views
        } for news in pagination.items],
        'total': pagination.total
    })

@app.route('/api/news', methods=['POST'])
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
    
    return jsonify({
        'id': news.id,
        'title': news.title,
        'content': news.content,
        'coverImage': news.cover_image,
        'category': news.category_ref.name,
        'author': news.author_ref.username,
        'publishDate': news.publish_date.isoformat(),
        'views': news.views
    })

@app.route('/api/news/<int:id>', methods=['PUT'])
@jwt_required()
def update_news(id):
    news = News.query.get_or_404(id)
    data = request.get_json()
    
    news.title = data.get('title', news.title)
    news.content = data.get('content', news.content)
    news.cover_image = data.get('coverImage', news.cover_image)
    news.category_id = data.get('category', news.category_id)
    
    db.session.commit()
    return jsonify({
        'id': news.id,
        'title': news.title,
        'content': news.content,
        'coverImage': news.cover_image,
        'category': news.category_ref.name,
        'author': news.author_ref.username,
        'publishDate': news.publish_date.isoformat(),
        'views': news.views
    })

@app.route('/api/news/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_news(id):
    news = News.query.get_or_404(id)
    db.session.delete(news)
    db.session.commit()
    return '', 204

# 评论相关路由
@app.route('/api/comments', methods=['GET'])
def get_comments():
    news_id = request.args.get('newsId', type=int)
    comments = Comment.query.filter_by(news_id=news_id, parent_id=None).all()
    
    return jsonify([{
        'id': c.id,
        'content': c.content,
        'author': {
            'id': c.author_ref.id,
            'name': c.author_ref.username,
            'avatar': ''  # 需要添加用户头像功能
        },
        'newsId': c.news_id,
        'parentId': c.parent_id,
        'children': [{
            'id': child.id,
            'content': child.content,
            'author': {
                'id': child.author_ref.id,
                'name': child.author_ref.username,
                'avatar': ''
            },
            'newsId': child.news_id,
            'parentId': child.parent_id,
            'likes': child.likes,
            'createdAt': child.created_at.isoformat(),
            'liked': False  # 需要添加用户点赞状态
        } for child in c.children],
        'likes': c.likes,
        'createdAt': c.created_at.isoformat(),
        'liked': False
    } for c in comments])

@app.route('/api/comments', methods=['POST'])
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
    
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'author': {
            'id': comment.author_ref.id,
            'name': comment.author_ref.username,
            'avatar': ''
        },
        'newsId': comment.news_id,
        'parentId': comment.parent_id,
        'likes': comment.likes,
        'createdAt': comment.created_at.isoformat(),
        'liked': False
    })

@app.route('/api/comments/<int:id>', methods=['PUT'])
@jwt_required()
def update_comment(id):
    comment = Comment.query.get_or_404(id)
    data = request.get_json()
    
    if comment.author_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
        
    comment.content = data['content']
    db.session.commit()
    
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'author': {
            'id': comment.author_ref.id,
            'name': comment.author_ref.username,
            'avatar': ''
        },
        'newsId': comment.news_id,
        'parentId': comment.parent_id,
        'likes': comment.likes,
        'createdAt': comment.created_at.isoformat(),
        'liked': False
    })

@app.route('/api/comments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_comment(id):
    comment = Comment.query.get_or_404(id)
    
    if comment.author_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(comment)
    db.session.commit()
    return '', 204

@app.route('/api/comments/<int:id>/like', methods=['POST'])
@jwt_required()
def like_comment(id):
    comment = Comment.query.get_or_404(id)
    comment.likes += 1
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 