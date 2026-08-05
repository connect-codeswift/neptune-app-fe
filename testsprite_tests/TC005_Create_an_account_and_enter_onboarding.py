import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3001")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Sign Up' link on the login page to open the registration form.
        # Sign Up link
        elem = page.get_by_role('link', name='Sign Up', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the form fields (Full Name, Email, Password, Confirm Password) and locate the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox on the page.
        # Enter Your Full Name text field
        elem = page.locator('[id="name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the form fields (Full Name, Email, Password, Confirm Password) and locate the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox on the page.
        # Enter Your Email Address email field
        elem = page.locator('[id="email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("qa+20260805T000000@example.com")
        
        # -> Fill the form fields (Full Name, Email, Password, Confirm Password) and locate the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox on the page.
        # Create A Strong Password password field
        elem = page.locator('[id="password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("StrongPassword123!")
        
        # -> Fill the form fields (Full Name, Email, Password, Confirm Password) and locate the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox on the page.
        # Confirm Your Password password field
        elem = page.locator('[id="confirm-password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("StrongPassword123!")
        
        # -> Toggle the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox using keyboard focus (Tab + Space), then click the 'Create account' button to submit the form.
        # Confirm Your Password password field
        elem = page.locator('[id="confirm-password"]')
        await elem.click(timeout=10000)
        
        # -> Toggle the 'I agree with the Neptune's Terms & Conditions and Privacy Policy' checkbox using keyboard focus (Tab + Space), then click the 'Create account' button to submit the form.
        # Create account button
        elem = page.get_by_role('button', name='Create account', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the onboarding screen is displayed
        # Assert: The page URL contains '/onboarding', confirming the onboarding screen is shown.
        await expect(page).to_have_url(re.compile("/onboarding"), timeout=15000), "The page URL contains '/onboarding', confirming the onboarding screen is shown."
        await page.locator("xpath=/html/body/main/div[5]/div[1]/div[2]/nav[1]/ol/li[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The onboarding '1 Company setup' step indicator is visible.
        await expect(page.locator("xpath=/html/body/main/div[5]/div[1]/div[2]/nav[1]/ol/li[2]/button").nth(0)).to_be_visible(timeout=15000), "The onboarding '1 Company setup' step indicator is visible."
        await page.locator("xpath=/html/body/main/div[5]/div[2]/div/div/form/div[1]/div/input").nth(0).scroll_into_view_if_needed()
        # Assert: The Organization Name input is visible on the onboarding screen.
        await expect(page.locator("xpath=/html/body/main/div[5]/div[2]/div/div/form/div[1]/div/input").nth(0)).to_be_visible(timeout=15000), "The Organization Name input is visible on the onboarding screen."
        
        # --> Verify account creation progress is visible
        # Assert: Progress percentage '33' is visible on the onboarding page.
        await expect(page.locator("xpath=/html/body/main/div[5]/div[1]/div[2]/nav[1]/div/span[2]/span").nth(0)).to_have_text("33", timeout=15000), "Progress percentage '33' is visible on the onboarding page."
        # Assert: Onboarding step label 'Company setup' is visible.
        await expect(page.locator("xpath=/html/body/main/div[5]/div[1]/div[2]/nav[1]/ol/li[2]/button").nth(0)).to_contain_text("Company setup", timeout=15000), "Onboarding step label 'Company setup' is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    