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
    # 注释掉无头模式，使用真实浏览器
    # chrome_options.add_argument("--headless")  
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    # 更新 User-Agent
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    # 添加额外参数绕过自动化检测
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    
    # 添加更多的配置来模拟真实用户
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    
    driver = webdriver.Chrome(options=chrome_options)
    
    # 执行 JavaScript 来隐藏 WebDriver
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
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
# 添加到文件顶部的导入部分
import pickle
import os.path

# 添加到 scrape_upwork_projects 函数中
def scrape_upwork_projects(max_projects=10):
    driver = setup_driver()
    projects = []
    
    # 尝试加载已保存的 cookies
    cookies_file = "upwork_cookies.pkl"
    if os.path.exists(cookies_file):
        try:
            print("尝试使用已保存的会话...")
            driver.get("https://www.upwork.com")
            cookies = pickle.load(open(cookies_file, "rb"))
            for cookie in cookies:
                if 'expiry' in cookie:
                    del cookie['expiry']
                driver.add_cookie(cookie)
            print("已加载保存的 cookies")
        except Exception as e:
            print(f"加载 cookies 失败: {e}")
    
    try:
        print(f"正在访问 Upwork 网站: {UPWORK_URL}")
        driver.get(UPWORK_URL)
        
        # 检查是否出现人机验证页面并处理...
        
        # 如果成功访问，保存 cookies 以便下次使用
        try:
            pickle.dump(driver.get_cookies(), open(cookies_file, "wb"))
            print("已保存当前会话的 cookies")
        except Exception as e:
            print(f"保存 cookies 失败: {e}")
        
        # 模拟人类行为
        def simulate_human_behavior(driver):
            # 随机滚动
            for _ in range(3):
                scroll_amount = random.randint(300, 700)
                driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
                time.sleep(random.uniform(1, 3))
            
            # 随机暂停
            time.sleep(random.uniform(2, 5))
        
        # 在 driver.get(UPWORK_URL) 后调用
        simulate_human_behavior(driver)
        
        # 检查是否出现人机验证页面
        if "确认你是真人" in driver.page_source or "Confirm you're a person" in driver.page_source or "captcha" in driver.page_source.lower():
            print("检测到人机验证页面！")
            print("请在打开的浏览器中手动完成验证，完成后按 Enter 继续...")
            input("按 Enter 继续...")
            
            # 验证完成后，重新检查页面
            if "确认你是真人" in driver.page_source or "Confirm you're a person" in driver.page_source:
                print("验证似乎未成功完成，请再次尝试")
                input("完成验证后按 Enter 继续...")
        
        # 等待页面加载 - 增加等待时间
        wait = WebDriverWait(driver, 60)  # 增加到60秒
        
        # 尝试多个可能的选择器
        selectors = [
            "[data-test='job-tile-list']",
            ".job-tile-list",
            ".oJobTile",
            ".up-card-section"
        ]
        
        # 尝试不同的选择器
        element_found = False
        for selector in selectors:
            try:
                print(f"尝试选择器: {selector}")
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                job_tiles = driver.find_elements(By.CSS_SELECTOR, f"{selector} > div")
                if job_tiles:
                    element_found = True
                    print(f"成功找到元素，使用选择器: {selector}")
                    break
            except Exception as e:
                print(f"选择器 {selector} 失败: {e}")
                continue
        
        if not element_found:
            # 如果所有选择器都失败，尝试截图并保存页面源码以便调试
            driver.save_screenshot("upwork_debug.png")
            with open("upwork_source.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("已保存截图和页面源码用于调试")
            
            # 尝试使用更通用的选择器
            job_tiles = driver.find_elements(By.CSS_SELECTOR, ".up-card, .job-tile, article")
            if not job_tiles:
                raise Exception("无法找到任何项目元素")
        
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

