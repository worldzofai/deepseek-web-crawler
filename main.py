import asyncio
import argparse
import sys
from typing import Dict, Any

from crawl4ai import AsyncWebCrawler
from dotenv import load_dotenv

from config import DEFAULT_CONFIG

# Import base configurations
from config import CONFIGS

# Import custom configurations
try:
    from my_configs import *
except ImportError:
    print("No custom configurations found. Using default templates only.")

from utils.data_utils import save_items_to_csv
from utils.scraper_utils import (
    fetch_and_process_page,
    get_browser_config,
    get_llm_strategy,
)
from models.item import ScrapedItem

load_dotenv()


def parse_args() -> str:
    """
    Parse command line arguments for the web crawler.
    
    Returns:
        str: The selected configuration name to use for crawling.
    """
    # Get available configurations
    default_configs = ["dental", "minimal", "detailed"]
    custom_configs = [k for k in CONFIGS.keys() if k not in default_configs]
    
    # Create help text
    help_text = "Configuration to use. Available options:\n"
    help_text += "\nDefault templates:\n"
    for config in default_configs:
        if config in CONFIGS:
            help_text += f"  {config}: For {config} scraping\n"
    
    if custom_configs:
        help_text += "\nCustom configurations:\n"
        for config in custom_configs:
            help_text += f"  {config}: Custom configuration\n"

    parser = argparse.ArgumentParser(
        description="Deep Seek Web Crawler",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "--config",
        type=str,
        required=True,
        choices=list(CONFIGS.keys()),
        help=help_text,
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available configurations and exit"
    )
    
    args = parser.parse_args()
    
    if args.list:
        print("\nAvailable configurations:")
        print("\nDefault templates:")
        for config in default_configs:
            if config in CONFIGS:
                print(f"  {config}: For {config} scraping")
        if custom_configs:
            print("\nCustom configurations:")
            for config in custom_configs:
                print(f"  {config}: Custom configuration")
        sys.exit(0)
    
    return args.config


def get_config(template: str) -> Dict[str, Any]:
    """Get configuration based on template name."""
    if template not in CONFIGS:
        print(f"Error: Unknown configuration '{template}'")
        print("\nTo see available configurations, run:")
        print("python main.py --list")
        sys.exit(1)
    return CONFIGS[template]


async def crawl_items(config: Dict[str, Any]):
    """
    Main function to crawl and extract data from websites.
    
    Args:
        config: Dictionary containing crawler configuration
    """
    # Initialize configurations
    browser_config = get_browser_config(config["CRAWLER_CONFIG"])
    llm_strategy = get_llm_strategy(config["LLM_CONFIG"])
    session_id = "crawl_session"

    # Initialize state variables
    page_number = 1
    all_items = []
    seen_titles = set()
    
    required_keys = config["REQUIRED_KEYS"]
    multi_page = config["CRAWLER_CONFIG"]["MULTI_PAGE"]
    max_pages = config["CRAWLER_CONFIG"].get("MAX_PAGES", 1)
    delay = config["CRAWLER_CONFIG"].get("DELAY_BETWEEN_PAGES", 2)

    print(f"\nStarting crawler with {config['BASE_URL']}")
    print(f"Mode: {'Multi-page' if multi_page else 'Single-page'}")
    if multi_page:
        print(f"Max pages: {max_pages}")
    print("Required fields:", ", ".join(required_keys))
    print("Optional fields:", ", ".join(config.get("OPTIONAL_KEYS", [])))
    print("\nInitializing crawler...\n")

    # Start the web crawler context
    async with AsyncWebCrawler(config=browser_config) as crawler:
        while True:
            # Fetch and process data from the current page
            items, no_results_found = await fetch_and_process_page(
                crawler,
                page_number,
                config["BASE_URL"],
                config["CSS_SELECTOR"],
                llm_strategy,
                session_id,
                required_keys,
                seen_titles,
            )

            if no_results_found:
                print("\nNo more items found. Ending crawl.")
                break

            if not items:
                print(f"\nNo items extracted from page {page_number}.")
                break

            # Add the items from this page to the total list
            all_items.extend(items)
            
            # Check if we should continue to next page
            if not multi_page or page_number >= max_pages:
                print(f"\nReached {'page limit' if multi_page else 'single page mode'}. Ending crawl.")
                break
                
            page_number += 1
            print(f"\nMoving to page {page_number}...")
            await asyncio.sleep(delay)

    # Save the collected items to CSV files
    if all_items:
        # Save all items
        save_items_to_csv(all_items, "items.csv")
        print(f"\nSaved {len(all_items)} items to 'items.csv'")
        
        # Save complete items (those with all required fields)
        complete_items = [
            item for item in all_items 
            if all(key in item and item[key] for key in required_keys)
        ]
        save_items_to_csv(complete_items, "complete_items.csv")
        print(f"Saved {len(complete_items)} complete items to 'complete_items.csv'")
    else:
        print("\nNo items were found during the crawl.")

    # Display usage statistics for the LLM strategy
    print("\nLLM Usage Statistics:")
    llm_strategy.show_usage()


async def main():
    """Entry point of the script."""
    # Get configuration template from command line
    template = parse_args()
    config = get_config(template)
    
    try:
        await crawl_items(config)
    except KeyboardInterrupt:
        print("\nCrawling interrupted by user.")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
    finally:
        print("\nCrawling completed.")


if __name__ == "__main__":
    asyncio.run(main())
