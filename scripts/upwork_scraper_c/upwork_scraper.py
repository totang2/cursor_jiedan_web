import os
import json
import time
import random
from datetime import datetime
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
from dotenv import load_dotenv

class UpworkScraper:
    def __init__(self):
        load_dotenv()
        self.base_url = "https://www.upwork.com"
        self.search_url = f"{self.base_url}/search/jobs"
        self.ua = UserAgent()
        self.setup_driver()

    def setup_driver(self):
        """Setup Selenium WebDriver with Chrome"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument(f"user-agent={self.ua.random}")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)

    def search_jobs(self, keywords: List[str], max_pages: int = 5) -> List[Dict[str, Any]]:
        """
        Search for jobs on Upwork based on keywords
        """
        all_jobs = []
        
        for keyword in keywords:
            for page in range(max_pages):
                try:
                    url = f"{self.search_url}?q={keyword}&page={page + 1}"
                    self.driver.get(url)
                    
                    # Wait for job listings to load
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "job-tile"))
                    )
                    
                    # Get page source and parse with BeautifulSoup
                    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                    job_listings = soup.find_all("div", class_="job-tile")
                    
                    for job in job_listings:
                        job_data = self._parse_job_listing(job)
                        if job_data:
                            all_jobs.append(job_data)
                    
                    # Random delay between requests
                    time.sleep(random.uniform(2, 5))
                    
                except Exception as e:
                    print(f"Error scraping page {page + 1} for keyword '{keyword}': {str(e)}")
                    continue
        
        return all_jobs

    def _parse_job_listing(self, job_element) -> Dict[str, Any]:
        """
        Parse individual job listing element
        """
        try:
            title = job_element.find("h3", class_="job-title").text.strip()
            description = job_element.find("span", class_="job-description").text.strip()
            
            # Extract budget if available
            budget_element = job_element.find("span", class_="budget")
            budget = budget_element.text.strip() if budget_element else "Not specified"
            
            # Extract skills
            skills_element = job_element.find("div", class_="skills")
            skills = [skill.text.strip() for skill in skills_element.find_all("span")] if skills_element else []
            
            # Extract client info
            client_element = job_element.find("div", class_="client-info")
            client_name = client_element.find("span", class_="client-name").text.strip() if client_element else "Unknown"
            
            return {
                "title": title,
                "description": description,
                "budget": budget,
                "skills": skills,
                "client_name": client_name,
                "scraped_at": datetime.now().isoformat(),
                "source": "upwork"
            }
        except Exception as e:
            print(f"Error parsing job listing: {str(e)}")
            return None

    def save_to_json(self, jobs: List[Dict[str, Any]], filename: str = "upwork_jobs.json"):
        """
        Save scraped jobs to JSON file
        """
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)
        
        print(f"Saved {len(jobs)} jobs to {filepath}")

    def close(self):
        """
        Close the WebDriver
        """
        self.driver.quit()

def main():
    # Initialize scraper
    scraper = UpworkScraper()
    
    try:
        # Define search keywords
        keywords = [
            "python developer",
            "web development",
            "full stack developer",
            "react developer",
            "node.js developer"
        ]
        
        # Scrape jobs
        print("Starting job scraping...")
        jobs = scraper.search_jobs(keywords, max_pages=3)
        
        # Save results
        scraper.save_to_json(jobs)
        
        print(f"Successfully scraped {len(jobs)} jobs")
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    
    finally:
        scraper.close()

if __name__ == "__main__":
    main() 