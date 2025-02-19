# 新闻管理系统

一个基于 Angular + Flask 的新闻管理系统。

## 系统要求

- Python 3.8+
- Node.js 16+
- npm 8+

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd news
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 初始化并运行
python run.py
```

后端服务将在 http://localhost:5000 运行

### 3. 前端设置

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
ng serve
```

前端应用将在 http://localhost:4200 运行

### 4. 初始账号

系统会自动创建一个管理员账号：
- 用户名：admin
- 密码：admin123

## 项目结构

```
news/
├── backend/                # Flask 后端
│   ├── app/               # 应用代码
│   │   ├── api/          # API 路由
│   │   ├── models/       # 数据模型
│   │   └── utils/        # 工具函数
│   ├── requirements.txt   # Python 依赖
│   └── run.py            # 启动脚本
│
└── frontend/             # Angular 前端
    ├── src/             # 源代码
    │   ├── app/        # 应用组件
    │   ├── assets/     # 静态资源
    │   └── styles/     # 样式文件
    └── package.json    # Node.js 依赖
```

## 开发说明

1. 后端 API 文档可在运行后端服务后访问 http://localhost:5000/api/docs

2. 前端开发时支持热重载，修改代码后会自动编译

3. 数据库使用 SQLite，文件位于 backend/news.db

## 常见问题

1. 如果遇到数据库问题，可以删除 backend/news.db 文件并重启后端服务，系统会自动重新创建数据库

2. 前端依赖安装失败时，可以尝试：
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

## 许可证

[MIT License](LICENSE) 