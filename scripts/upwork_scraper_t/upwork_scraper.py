import os
import time
import json
import random
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# 配置参数
BASE_URL = "http://localhost:3000"  # 你的项目 URL，根据实际情况修改
API_URL = f"{BASE_URL}/api/projects"
LOGIN_URL = f"{BASE_URL}/api/auth/signin"
UPWORK_URL = "https://www.upwork.com/nx/jobs/search/?q=web%20development&sort=recency"

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

# 设置 Chrome 选项
def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 无头模式
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

# 登录并获取认证令牌
def login():
    session = requests.Session()
    login_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "callbackUrl": BASE_URL
    }
    
    try:
        response = session.post(LOGIN_URL, json=login_data)
        response.raise_for_status()
        print("登录成功")
        return session
    except requests.exceptions.RequestException as e:
        print(f"登录失败: {e}")
        return None

# 爬取 Upwork 项目数据
def scrape_upwork_projects(max_projects=10):
    driver = setup_driver()
    projects = []
    
    try:
        print(f"正在访问 Upwork 网站: {UPWORK_URL}")
        driver.get(UPWORK_URL)
        
        # 等待页面加载
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-test='job-tile-list']"))
        )
        
        # 获取项目列表
        job_tiles = driver.find_elements(By.CSS_SELECTOR, "[data-test='job-tile-list'] > div")
        
        for i, job_tile in enumerate(job_tiles[:max_projects]):
            try:
                # 提取项目标题
                title_element = job_tile.find_element(By.CSS_SELECTOR, "a[data-test='job-title-link']")
                title = title_element.text.strip()
                
                # 提取项目描述
                description_element = job_tile.find_element(By.CSS_SELECTOR, "span[data-test='job-description-text']")
                description = description_element.text.strip()
                
                # 提取预算
                try:
                    budget_element = job_tile.find_element(By.CSS_SELECTOR, "span[data-test='budget']")
                    budget_text = budget_element.text.strip().replace("$", "").replace(",", "")
                    budget = float(budget_text) if budget_text else random.randint(500, 5000)
                except (NoSuchElementException, ValueError):
                    budget = random.randint(500, 5000)  # 如果没有预算，随机生成
                
                # 提取技能
                try:
                    skills_elements = job_tile.find_elements(By.CSS_SELECTOR, "a[data-test='attr-item']")
                    skills = [skill.text.strip() for skill in skills_elements if skill.text.strip()]
                except NoSuchElementException:
                    skills = ["Web Development", "JavaScript", "React"]  # 默认技能
                
                # 提取类别 (在 Upwork 上可能需要点击进入详情页获取)
                category = "Web Development"  # 默认类别
                
                # 生成随机截止日期 (30-60天内)
                deadline = datetime.now() + timedelta(days=random.randint(30, 60))
                
                project = {
                    "title": title,
                    "description": description,
                    "budget": budget,
                    "deadline": deadline.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                    "category": CATEGORY_MAPPING.get(category, "其他"),
                    "skills": ",".join(skills[:5])  # 最多取5个技能
                }
                
                projects.append(project)
                print(f"已爬取项目 {i+1}/{max_projects}: {title}")
                
            except Exception as e:
                print(f"爬取项目时出错: {e}")
                continue
        
        return projects
    
    except TimeoutException:
        print("页面加载超时")
        return []
    except Exception as e:
        print(f"爬取过程中出错: {e}")
        return []
    finally:
        driver.quit()

# 发布项目到系统
def post_projects(session, projects):
    success_count = 0
    
    for project in projects:
        try:
            response = session.post(API_URL, json=project)
            response.raise_for_status()
            success_count += 1
            print(f"成功发布项目: {project['title']}")
            # 添加随机延迟，避免请求过于频繁
            time.sleep(random.uniform(1, 3))
        except requests.exceptions.RequestException as e:
            print(f"发布项目失败: {e}")
            if hasattr(e.response, 'text'):
                print(f"错误详情: {e.response.text}")
    
    return success_count

# 主函数
def main():
    print("开始爬取 Upwork 项目数据并发布到系统...")
    
    # 登录获取会话
    session = login()
    if not session:
        print("登录失败，无法继续")
        return
    
    # 爬取项目数据
    projects = scrape_upwork_projects(max_projects=20)
    if not projects:
        print("未爬取到任何项目数据")
        return
    
    print(f"共爬取到 {len(projects)} 个项目")
    
    # 发布项目到系统
    success_count = post_projects(session, projects)
    
    print(f"爬取完成! 成功发布 {success_count}/{len(projects)} 个项目")

if __name__ == "__main__":
    main()