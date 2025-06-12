## 脚本功能
1. 登录到你的系统获取认证令牌
2. 爬取 Upwork 上的项目数据
3. 将爬取的数据转换为符合你系统的格式
4. 通过 API 发布项目数据

## 使用说明
1. 首先安装必要的依赖：
```
pip install selenium requests webdriver-manager
```
2. 确保你已经安装了 Chrome 浏览器和对应版本的 ChromeDriver
```
https://googlechromelabs.github.io/chrome-for-testing/#stable
```
3. 修改脚本中的配置参数：

 - BASE_URL : 你的项目 URL
 - EMAIL 和 PASSWORD : 你的系统管理员账号和密码
4. 创建脚本目录并运行脚本：
```
mkdir -p /Users/always_day_1/cursor_jiedan_web/scripts
cd /Users/always_day_1/cursor_jiedan_web/scripts
python upwork_scraper.py
```