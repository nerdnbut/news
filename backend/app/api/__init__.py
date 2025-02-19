from flask import Blueprint

bp = Blueprint('api', __name__)

# 在创建蓝图后导入路由
from app.api import auth, news, category, comment, notification, upload 