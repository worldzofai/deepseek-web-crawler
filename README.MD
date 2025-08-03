# DeepSeek Web Crawler 🤖

A powerful and flexible web crawler that uses Groq's LLM API to intelligently extract structured data from any website. Perfect for data scientists, researchers, and developers who need to gather and analyze web data efficiently.

> 🚀 **Quick Start**: Run `python main.py --config test` to try the crawler with local test data!

## ✨ Features

🧠 **Intelligent Extraction**
- Uses Groq's LLM API for smart data parsing
- Understands context and extracts meaningful data
- Handles various data formats and structures

🎯 **Flexible Targeting**
- CSS selector-based element targeting
- Multi-page crawling support
- Configurable delay between requests
- Cache support for faster development

🛠️ **Easy Configuration**
- Ready-to-use templates for common use cases
- Customizable extraction rules
- Configurable browser settings
- Headless mode support

📊 **Data Management**
- Automatic CSV file generation
- Duplicate detection
- Required field validation
- Structured data output

🔒 **Safe & Respectful**
- Configurable delays between requests
- User-agent customization
- Proxy support
- Cache mechanism to reduce server load

## Creating Your Own Crawler

To create a new crawler configuration:

1. Use the generator script:
   ```bash
   python create_config.py
   ```
   This will guide you through creating a new configuration by asking:
   - Target website URL
   - CSS selector for items
   - Required fields
   - Optional fields
   - Crawler settings (pages, delay, etc.)
   - LLM instructions

2. Or manually create one:
   - Copy a template from below
   - Add it to config.py
   - Customize the settings

## Getting Started

### 1. Environment Setup

1. First, install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
   ```
   Get your API key from [Groq Console](https://console.groq.com)

### 2. Understanding the Project Structure

- `config.py`: Contains crawler configurations for different use cases
  - Defines what data to extract and how to extract it
  - Includes settings for browser behavior and LLM configuration
  - You can modify existing configs or add new ones here

- `main.py`: The entry point of the crawler
  - Handles command-line arguments
  - Manages the crawling process
  - Saves results to CSV files

### 3. Available Configuration Templates 🔧

First, try the test configuration to verify your setup:

🧪 `test`: Local testing configuration
- Uses a local test.html file
- Good for testing the crawler without making web requests
- Helps understand how the extraction works
- Recommended before trying web scraping
```python
python main.py --config test
```

Then use these templates for your scraping needs:

Here are templates you can use for different scraping scenarios:

1. 🛍️ E-commerce Product Scraping:
```python
"ecommerce": {
    **DEFAULT_CONFIG,
    "BASE_URL": "https://example-store.com/products",
    "CSS_SELECTOR": "div.product-card",
    "REQUIRED_KEYS": [
        "name",
        "price",
        "description"
    ],
    "OPTIONAL_KEYS": [
        "sku",
        "category",
        "stock_status",
        "rating",
        "reviews_count",
        "image_url"
    ],
    "LLM_CONFIG": {
        **DEFAULT_CONFIG["LLM_CONFIG"],
        "INSTRUCTION": """
        Extract product information from each product card:
        - Name: Product title
        - Price: Current price (remove currency symbol)
        - Description: Product description
        - SKU: Product identifier
        - Category: Product category
        - Stock Status: In stock/Out of stock
        - Rating: Numerical rating
        - Reviews Count: Number of reviews
        - Image URL: Product image URL
        """
    }
}
```

2. 📰 News Article Scraping:
```python
"news": {
    **DEFAULT_CONFIG,
    "BASE_URL": "https://example-news.com",
    "CSS_SELECTOR": "article.news-item",
    "REQUIRED_KEYS": [
        "title",
        "content",
        "date_published"
    ],
    "OPTIONAL_KEYS": [
        "author",
        "category",
        "tags",
        "image_url",
        "comments_count"
    ],
    "CRAWLER_CONFIG": {
        **DEFAULT_CONFIG["CRAWLER_CONFIG"],
        "MULTI_PAGE": True,
        "MAX_PAGES": 3,
        "DELAY_BETWEEN_PAGES": 5
    }
}
```

3. 🏢 Job Listing Scraping:
```python
"jobs": {
    **DEFAULT_CONFIG,
    "BASE_URL": "https://example-jobs.com/listings",
    "CSS_SELECTOR": "div.job-posting",
    "REQUIRED_KEYS": [
        "title",
        "company",
        "location",
        "description"
    ],
    "OPTIONAL_KEYS": [
        "salary",
        "job_type",
        "experience_level",
        "posted_date",
        "benefits",
        "skills_required"
    ],
    "CRAWLER_CONFIG": {
        **DEFAULT_CONFIG["CRAWLER_CONFIG"],
        "MULTI_PAGE": True,
        "MAX_PAGES": 10
    }
}
```

4. 🏠 Real Estate Listing Scraping:
```python
"real_estate": {
    **DEFAULT_CONFIG,
    "BASE_URL": "https://example-realty.com/listings",
    "CSS_SELECTOR": "div.property-listing",
    "REQUIRED_KEYS": [
        "address",
        "price",
        "bedrooms",
        "bathrooms",
        "square_feet"
    ],
    "OPTIONAL_KEYS": [
        "property_type",
        "year_built",
        "lot_size",
        "amenities",
        "agent_info",
        "images",
        "description"
    ],
    "LLM_CONFIG": {
        **DEFAULT_CONFIG["LLM_CONFIG"],
        "INSTRUCTION": """
        Extract property information from each listing:
        - Address: Full property address
        - Price: Listing price (numbers only)
        - Bedrooms: Number of bedrooms
        - Bathrooms: Number of bathrooms
        - Square Feet: Property size
        - Property Type: House/Condo/etc.
        - Year Built: Construction year
        - Lot Size: Land area
        - Amenities: List of features
        - Agent Info: Contact information
        - Images: Property image URLs
        - Description: Property description
        """
    }
}
```

### 4. Running the Crawler

1. List available configurations:
   ```bash
   python main.py --list
   ```

2. Run with your configuration:
   ```bash
   python main.py --config test          # Start with test configuration
   python main.py --config ecommerce     # Run e-commerce scraping
   python main.py --config news          # Run news article scraping
   python main.py --config jobs          # Run job listing scraping
   python main.py --config real_estate   # Run real estate scraping
   ```

   Note: Make sure to add the configuration to config.py first using the templates above.

### 5. Output

The crawler generates two CSV files:
- `items.csv`: Contains all scraped items
- `complete_items.csv`: Contains only items with all required fields

### 6. Creating Custom Configurations

To create a new configuration:

1. Open `config.py`
2. Add your configuration to the `CONFIGS` dictionary
3. Define:
   - BASE_URL: The starting URL to crawl
   - CSS_SELECTOR: How to identify items on the page
   - REQUIRED_KEYS: Fields that must be present
   - OPTIONAL_KEYS: Additional fields to extract if available
   - CRAWLER_CONFIG: Browser and pagination settings
   - LLM_CONFIG: Instructions for the LLM

Example:
```python
"my_config": {
    **DEFAULT_CONFIG,  # Inherit from default
    "BASE_URL": "https://example.com",
    "CSS_SELECTOR": "div.item",
    "REQUIRED_KEYS": ["name", "price"],
    "CRAWLER_CONFIG": {
        **DEFAULT_CONFIG["CRAWLER_CONFIG"],
        "MULTI_PAGE": False
    }
}
```

### 7. Troubleshooting

If you encounter issues:
1. Check your GROQ_API_KEY in .env
2. Ensure all dependencies are installed
3. Try the test configuration first to verify basic functionality
4. Check the terminal output for detailed error messages

## License

See LICENSE file for details.
