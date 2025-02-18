from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

# 新增点赞关联表
comment_likes = db.Table('comment_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('comment_id', db.Integer, db.ForeignKey('comment.id'))
)

class User(db.Model):
    __tablename__ = 'users'  # 明确指定表名
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    avatar = db.Column(db.String(200))
    news = db.relationship('News', backref='author_ref', lazy=True)
    comments = db.relationship('Comment', backref='author_ref', lazy=True)

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
            'avatar': self.avatar or ''
        }

    def __repr__(self):
        return f'<User {self.username}>'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))
    news = db.relationship('News', backref='category_ref', lazy=True)

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
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(200))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    publish_date = db.Column(db.DateTime, default=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='news_ref', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'coverImage': self.cover_image,
            'category': self.category_ref.name,
            'author': self.author_ref.username,
            'publishDate': self.publish_date.isoformat(),
            'views': self.views
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    news_id = db.Column(db.Integer, db.ForeignKey('news.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
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