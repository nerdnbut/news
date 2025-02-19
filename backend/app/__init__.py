from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from app.utils import APIError

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='uploads', static_url_path='/uploads')
    app.config.from_object(config_class)
    
    # 简化 CORS 配置
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:4200"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }})

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # 注册蓝图
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

    return app 