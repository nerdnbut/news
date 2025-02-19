from app import create_app, db
from app.models import User, Category, News, Comment  # 导入所有模型

def init_db():
    db.create_all()
    
    # 如果没有用户，创建默认管理员账号
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin')
        admin.set_password('admin123')
        admin.interests = '政治,经济,科技,体育'  # 设置默认兴趣
        db.session.add(admin)
        
        # 添加默认分类
        categories = ['政治', '经济', '科技', '体育']
        for name in categories:
            category = Category(
                name=name,
                level=0
            )
            db.session.add(category)
            
        db.session.commit()

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        init_db()  # 确保在启动前初始化数据库
    app.run(debug=True) 