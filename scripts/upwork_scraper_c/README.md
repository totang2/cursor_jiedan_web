# Upwork Job Scraper

This script scrapes job listings from Upwork.com and saves them in JSON format.

## Prerequisites

- Python 3.8 or higher
- Chrome browser installed
- pip (Python package manager)

## Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Usage

1. Run the scraper:
```bash
python upwork_scraper.py
```

The script will:
- Scrape job listings for predefined keywords
- Save results to `data/upwork_jobs.json`
- Use random delays between requests to avoid rate limiting
- Run in headless mode (no browser window)

## Configuration

You can modify the following in the script:
- Search keywords in the `main()` function
- Number of pages to scrape per keyword (default: 3)
- Output filename in `save_to_json()` method

## Notes

- The script uses Selenium with Chrome in headless mode
- Random delays are implemented to avoid rate limiting
- Error handling is included for robustness
- Results are saved in JSON format with UTF-8 encoding

## Data Structure

Each job listing includes:
- Title
- Description
- Budget
- Required Skills
- Client Name
- Scraped Timestamp
- Source (upwork) 