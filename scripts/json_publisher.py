import os
import json
import time
import random
import requests
from datetime import datetime

# 配置参数
BASE_URL = "http://localhost:3000"  # 你的项目 URL，根据实际情况修改
API_URL = f"{BASE_URL}/api/projects"

# 登录凭据
EMAIL = "157272235@qq.com"  # 替换为你的管理员账号
PASSWORD = "111111"  # 替换为你的密码

# 项目类别映射
CATEGORY_MAPPING = {
    "Web Development": "网站开发",
    "Mobile Development": "移动应用开发",
    "Desktop Software": "桌面软件开发",
    "Game Development": "游戏开发",
    "AI & Machine Learning": "人工智能",
    "Data Science": "数据科学",
    "DevOps": "DevOps",
    "QA & Testing": "测试与质量保证",
    "Other": "其他"
}

# 登录并获取认证会话
def login():
    session = requests.Session()
    
    try:
        # 第一步：获取CSRF令牌
        csrf_response = session.get(f"{BASE_URL}/api/auth/csrf")
        csrf_data = csrf_response.json()
        csrf_token = csrf_data.get("csrfToken")
        
        if not csrf_token:
            print("无法获取CSRF令牌")
            return None
        
        # 第二步：使用CSRF令牌进行登录
        login_data = {
            "email": EMAIL,
            "password": PASSWORD,
            "csrfToken": csrf_token,
            "callbackUrl": BASE_URL,
            "json": True
        }
        
        # 使用正确的登录端点
        signin_response = session.post(f"{BASE_URL}/api/auth/callback/credentials", json=login_data)
        
        if signin_response.status_code != 200:
            print(f"登录失败: {signin_response.status_code}")
            print(f"错误详情: {signin_response.text}")
            return None
        
        # 第三步：验证会话是否有效
        session_response = session.get(f"{BASE_URL}/api/auth/session")
        session_data = session_response.json()
        
        if session_data.get("user"):
            print(f"登录成功，用户: {session_data['user'].get('email')}")
            return session
        else:
            print("登录失败，未获取到用户信息")
            print(f"会话响应: {session_data}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"登录失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"错误详情: {e.response.text}")
        return None

# 从JSON文件加载项目数据
def load_projects_from_json(json_file_path):
    try:
        if not os.path.exists(json_file_path):
            print(f"错误: 文件 {json_file_path} 不存在")
            return []
            
        with open(json_file_path, 'r', encoding='utf-8') as file:
            projects = json.load(file)
            
        if not isinstance(projects, list):
            print("错误: JSON文件应包含项目列表")
            return []
            
        print(f"从JSON文件加载了 {len(projects)} 个项目")
        return projects
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return []
    except Exception as e:
        print(f"加载JSON文件时出错: {e}")
        return []

# 处理预算字段，移除货币符号并转换为浮点数
def process_budget(budget_value):
    if budget_value is None or budget_value == "":
        return 1000.0  # 默认预算
    
    if isinstance(budget_value, (int, float)):
        return float(budget_value)
    
    # 处理字符串类型的预算
    if isinstance(budget_value, str):
        # 移除货币符号、逗号和空格
        cleaned_value = budget_value.replace("$", "").replace("¥", "").replace("€", "").replace("£", "")\
                                    .replace(",", "").replace(" ", "")
        
        # 如果清理后为空字符串，返回默认值
        if not cleaned_value:
            return 1000.0
        
        try:
            return float(cleaned_value)
        except ValueError:
            print(f"无法解析预算值: {budget_value}，使用默认值")
            return 1000.0
    
    return 1000.0  # 默认预算

# 验证和格式化项目数据
def validate_and_format_projects(projects):
    valid_projects = []
    
    for i, project in enumerate(projects):
        try:
            # 检查必要字段
            if 'title' not in project or not project['title']:
                print(f"项目 #{i+1} 缺少标题，跳过")
                continue
                
            if 'description' not in project or not project['description']:
                print(f"项目 #{i+1} '{project['title']}' 缺少描述，跳过")
                continue
            
            # 格式化项目数据
            formatted_project = {
                "title": project['title'],
                "description": project['description'],
                "budget": process_budget(project.get('budget')),  # 使用新函数处理预算
                "category": CATEGORY_MAPPING.get(project.get('category', 'Other'), "其他")
            }
            
            # 处理截止日期
            if 'deadline' in project and project['deadline']:
                formatted_project["deadline"] = project['deadline']
            else:
                # 默认截止日期为45天后
                formatted_project["deadline"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
            
            # 处理技能
            if 'skills' in project and project['skills']:
                if isinstance(project['skills'], list):
                    formatted_project["skills"] = ",".join(project['skills'][:5])  # 最多取5个技能
                else:
                    formatted_project["skills"] = project['skills']
            else:
                formatted_project["skills"] = "Web Development,JavaScript,React"
            
            valid_projects.append(formatted_project)
            
        except Exception as e:
            print(f"处理项目 #{i+1} 时出错: {e}")
            continue
    
    return valid_projects

# 发布项目到系统
def post_projects(session, projects):
    success_count = 0
    
    for i, project in enumerate(projects):
        try:
            print(f"正在发布项目 {i+1}/{len(projects)}: {project['title']}")
            response = session.post(API_URL, json=project)
            response.raise_for_status()
            success_count += 1
            print(f"成功发布项目: {project['title']}")
            # 添加随机延迟，避免请求过于频繁
            time.sleep(random.uniform(0.5, 2))
        except requests.exceptions.RequestException as e:
            print(f"发布项目失败: {e}")
            if hasattr(e, 'response') and e.response is not None and hasattr(e.response, 'text'):
                print(f"错误详情: {e.response.text}")
    
    return success_count

# 主函数
def main(json_file_path):
    print(f"开始从 {json_file_path} 加载项目数据并发布到系统...")
    
    # 登录获取会话
    session = login()
    if not session:
        print("登录失败，无法继续")
        return
    
    # 加载项目数据
    projects = load_projects_from_json(json_file_path)
    if not projects:
        print("未加载到任何项目数据")
        return
    
    # 验证和格式化项目数据
    valid_projects = validate_and_format_projects(projects)
    if not valid_projects:
        print("没有有效的项目数据可发布")
        return
    
    print(f"共有 {len(valid_projects)}/{len(projects)} 个有效项目")
    
    # 发布项目到系统
    success_count = post_projects(session, valid_projects)
    
    print(f"发布完成! 成功发布 {success_count}/{len(valid_projects)} 个项目")

if __name__ == "__main__":
    json_file_path = "/Users/always_day_1/Downloads/upwork_jobs_2025-06-12T09-27-03-044Z.json"
    main(json_file_path)