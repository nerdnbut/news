from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

# 修改点赞关联表的外键引用
comment_likes = db.Table('comment_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('comment_id', db.Integer, db.ForeignKey('comments.id'))
)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))
    avatar = db.Column(db.String(200))
    # 添加role字段, 0为普通用户, 1为管理员
    role = db.Column(db.Integer, default=0)  
    news = relationship('News', back_populates='author')
    comments = db.relationship('Comment', backref='author_ref', lazy=True)
    interests = db.Column(db.String(200))  # 存储用户兴趣,以逗号分隔

    def __init__(self, username):
        self.username = username

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'role': self.role,  # 添加role到返回数据中
            'interests': self.interests.split(',') if self.interests else []
        }

    def __repr__(self):
        return f'<User {self.username}>'

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))

    def to_dict(self, include_children=True):
        data = {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'parentId': self.parent_id
        }
        if include_children:
            data['children'] = [child.to_dict(include_children=False) for child in self.children]
        return data

class News(db.Model):
    __tablename__ = 'news'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    coverImage = db.Column(db.String(500))
    category = db.Column(db.String(50))
    author_id = db.Column(db.Integer, ForeignKey('users.id'))
    author = relationship('User', back_populates='news')
    publishDate = db.Column(db.DateTime, default=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='news_ref', lazy=True)

    # 添加分类映射
    CATEGORY_MAP = {
        'politics': '政治',
        'economy': '经济',
        'technology': '科技',
        'sports': '体育'
    }
    
    CATEGORY_MAP_REVERSE = {
        '政治': 'politics',
        '经济': 'economy',
        '科技': 'technology',
        '体育': 'sports'
    }

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'coverImage': self.coverImage,
            'category': self.CATEGORY_MAP.get(self.category, self.category),  # 使用映射转换分类
            'author': self.author.username if self.author else 'Anonymous',
            'authorId': self.author_id,
            'publishDate': self.publishDate.isoformat() if self.publishDate else None,
            'views': self.views
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    news_id = db.Column(db.Integer, db.ForeignKey('news.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    children = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]))
    liked_by = db.relationship('User', 
                             secondary=comment_likes,
                             backref=db.backref('liked_comments', lazy='dynamic'))

    def to_dict(self, include_children=True, current_user_id=None):
        data = {
            'id': self.id,
            'content': self.content,
            'author': {
                'id': self.author_ref.id,
                'name': self.author_ref.username,
                'avatar': self.author_ref.avatar or ''
            },
            'newsId': self.news_id,
            'parentId': self.parent_id,
            'likes': self.likes,
            'createdAt': self.created_at.isoformat(),
            'liked': current_user_id in [user.id for user in self.liked_by] if current_user_id else False
        }
        if include_children:
            data['children'] = [child.to_dict(include_children=False, current_user_id=current_user_id) 
                              for child in self.children]
        return data 

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    news_id = db.Column(db.Integer, db.ForeignKey('news.id'), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
    news = db.relationship('News')
    
    def to_dict(self):
        return {
            'id': self.id,
            'newsId': self.news_id,
            'newsTitle': self.news.title,
            'newsCategory': self.news.category,
            'read': self.read,
            'createdAt': self.created_at.isoformat()
        } 