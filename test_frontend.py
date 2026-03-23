from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # 1. Navigate to the Aule page
    page.goto("http://localhost:4173/aule")

    # Wait for the network calls to complete and aule to render
    page.screenshot(path="aule_error.png")

    print(page.content())

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
