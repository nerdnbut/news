from app import create_app, db
from app.models import User, Category, News, Comment  # 导入所有模型

app = create_app()

def init_db():
    with app.app_context():
        print("Creating database tables...")  # 调试日志
        db.create_all()
        print("Database tables created successfully!")  # 调试日志

if __name__ == '__main__':
    init_db()  # 确保在启动前初始化数据库
    app.run(debug=True) 