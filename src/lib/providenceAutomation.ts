import { Builder, By, WebDriver, until, Key ,WebElement} from 'selenium-webdriver';
import path from 'path';
import chrome, { ServiceBuilder } from 'selenium-webdriver/chrome';

export class ProvidenceAutomation {

  private driver: WebDriver | null = null;


  async initialize(): Promise<void> {
    

     const options = new chrome.Options();
    // Chrome options to suppress errors and optimize performance
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--start-maximized');
    
    // Suppress Chrome service errors that cause delays
    options.addArguments('--disable-background-timer-throttling');
    options.addArguments('--disable-backgrounding-occluded-windows');
    options.addArguments('--disable-renderer-backgrounding');
    options.addArguments('--disable-features=TranslateUI');
    options.addArguments('--disable-ipc-flooding-protection');
    options.addArguments('--disable-background-networking');
    options.addArguments('--disable-sync');
    options.addArguments('--disable-default-apps');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-plugins');
    options.addArguments('--disable-web-security');
    options.addArguments('--disable-features=VizDisplayCompositor');
    
    // Suppress GCM/registration errors
    options.addArguments('--disable-component-extensions-with-background-pages');
    options.addArguments('--disable-background-mode');
    options.addArguments('--disable-client-side-phishing-detection');
    options.addArguments('--disable-hang-monitor');
    options.addArguments('--disable-prompt-on-repost');
    options.addArguments('--disable-domain-reliability');
    
    // Logging preferences to reduce console noise
    const loggingPrefs = {
      'browser': 'OFF',
      'driver': 'OFF',
      'performance': 'OFF'
    };
    options.setLoggingPrefs(loggingPrefs);
    
    // Suppress specific error messages
    options.excludeSwitches('enable-logging');
    options.addArguments('--log-level=3'); // Only fatal errors
    options.addArguments('--silent');
    options.addArguments('--disable-logging');
    
   
    // Set timeouts
   
        
    const chromedriverPath = path.resolve(process.cwd(), 'drivers', 'chromedriver.exe');
    const serviceBuilder = new ServiceBuilder(chromedriverPath);

        // options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--start-maximized');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(serviceBuilder)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000,
    });
  }

  async navigateToLogin(): Promise<void> {
    
    if (!this.driver) throw new Error('Driver not initialized');

    console.log('Navigating to Providence login page...');
    await this.driver.get('https://providence.gobolt.com/login');
    await this.driver.wait(until.elementLocated(By.id('normal_login_email')), 15000);
  }

  async login(normal_login_email: string, normal_login_password: string): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');

    console.log('Attempting to login with provided credentials...');

    await this.driver.wait(until.elementLocated(By.id('normal_login_email')), 15000);

    const normal_login_emailField = await this.driver.findElement(By.id('normal_login_email'));
    const normal_login_passwordField = await this.driver.findElement(By.id('normal_login_password'));

    await normal_login_emailField.clear();
    await normal_login_emailField.sendKeys(normal_login_email);
    await normal_login_passwordField.clear();
    await normal_login_passwordField.sendKeys(normal_login_password);

    const submitButton = await this.driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    
    console.log('Login successful, redirected to dashboard');
  }

  async selectFacility(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for facility selection modal dialog...');
    
    // Wait for the modal to appear after login
    await this.driver.sleep(1000);
    
    try {
      // Wait for the modal dialog to appear
      console.log('Waiting for facility selection modal...');
      await this.driver.wait(until.elementLocated(By.css('.ant-modal-root, .ant-modal')), 15000);
      
      // Look for the "Select Facility" modal specifically
      const modalSelectors = [
        '.ant-modal-content',
        '.ant-modal-body',
        '[role="dialog"]'
      ];
      
      let modalElement = null;
      for (const selector of modalSelectors) {
        try {
          modalElement = await this.driver.findElement(By.css(selector));
          console.log(`Found modal with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!modalElement) {
        throw new Error('Facility selection modal not found');
      }
      
      // Look for the dropdown within the modal
      const dropdownSelectors = [
        '.ant-select',
        '.ant-select-selector',
        '[role="combobox"]',
        '.ant-select-selection-search-input'
      ];
      
      let dropdownElement = null;
      for (const selector of dropdownSelectors) {
        try {
          dropdownElement = await modalElement.findElement(By.css(selector));
          console.log(`Found dropdown with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!dropdownElement) {
        throw new Error('Facility dropdown not found in modal');
      }
      
      // Scroll dropdown into view and click it
      await this.driver.executeScript("arguments[0].scrollIntoView(true);", dropdownElement);
      await this.driver.sleep(1000);
      
      console.log('Clicking facility dropdown...');
      await dropdownElement.click();
      await this.driver.sleep(1000);
      
      // Wait for dropdown options to appear
      await this.driver.wait(until.elementLocated(By.css('.ant-select-dropdown, .rc-virtual-list')), 10000);
      
      // Look for YYZ5 option in the dropdown
      const yyz5Selectors = [
        "//div[@title='YYZ5']",
        "//div[contains(@class, 'ant-select-item') and contains(text(), 'YYZ5')]",
        "//div[contains(@class, 'ant-select-item-option') and contains(text(), 'YYZ5')]",
        "//*[contains(text(), 'YYZ5') and contains(@class, 'ant-select-item')]",
        "//div[@role='option' and contains(text(), 'YYZ5')]"
      ];
      
      let yyz5Element = null;
      for (const selector of yyz5Selectors) {
        try {
          console.log(`Looking for YYZ5 with selector: ${selector}`);
          yyz5Element = await this.driver.findElement(By.xpath(selector));
          console.log('Found YYZ5 option');
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!yyz5Element) {
        // Try a more generic approach - look for any option containing YYZ5
        try {
          yyz5Element = await this.driver.findElement(By.xpath("//*[contains(text(), 'YYZ5')]"));
          console.log('Found YYZ5 option with generic selector');
        } catch (e) {
          throw new Error('YYZ5 facility option not found in the dropdown');
        }
      }
      
      // Click the YYZ5 option
      await this.driver.executeScript("arguments[0].scrollIntoView(true);", yyz5Element);
      await this.driver.sleep(500);
      await yyz5Element.click();
      console.log('Selected YYZ5 facility');
      await this.driver.sleep(1000);
      
      
    } catch (error) {
      console.error('Error in facility selection:', error);
      throw new Error(`Failed to select facility: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async navigateToInventoryManagement(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for Inventory Management tab...');
    
    // Wait for the main navigation to load
    await this.driver.sleep(3000);
    
    // Look for Inventory Management tab using various selectors
    const inventorySelectors = [
      '[role="tab"][aria-controls*="Inventory"]',
      '[data-node-key="Inventory Management"]',
      '//div[@role="tab" and contains(text(), "Inventory Management")]',
      '//div[contains(@class, "ant-tabs-tab") and contains(text(), "Inventory Management")]',
      '.ant-tabs-tab:contains("Inventory Management")',
      '[aria-labelledby*="Inventory Management"]'
    ];
    
    let inventoryTab = null;
    for (const selector of inventorySelectors) {
      try {
        if (selector.startsWith('//')) {
          inventoryTab = await this.driver.findElement(By.xpath(selector));
        } else {
          inventoryTab = await this.driver.findElement(By.css(selector));
        }
        console.log(`Found Inventory Management tab with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inventoryTab) {
      throw new Error('Inventory Management tab not found');
    }
    
    // Scroll into view and click
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", inventoryTab);
    await this.driver.sleep(1000);
    
    console.log('Clicking Inventory Management tab...');
    await inventoryTab.click();
    
    // Wait for the tab content to load
    await this.driver.sleep(3000);
    console.log('Inventory Management tab opened successfully');
  }
  
  async navigateToManualItems(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for Manual Items section...');
    
    // Look for Manual Items card/button using various selectors
    const manualItemsSelectors = [
      '//div[contains(@class, "sc-eldPxv") and contains(text(), "MANUAL ITEMS")]',
      '//div[contains(text(), "MANUAL ITEMS")]',
      '[data-testid="manual-items"]',
      '.manual-items-card',
      '//div[contains(@class, "ant-col") and .//div[contains(text(), "MANUAL")]]',
      '//div[contains(@class, "card") and contains(text(), "MANUAL")]'
    ];
    
    let manualItemsElement = null;
    for (const selector of manualItemsSelectors) {
      try {
        if (selector.startsWith('//')) {
          manualItemsElement = await this.driver.findElement(By.xpath(selector));
        } else {
          manualItemsElement = await this.driver.findElement(By.css(selector));
        }
        console.log(`Found Manual Items with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!manualItemsElement) {
      throw new Error('Manual Items section not found');
    }
    
    // Scroll into view and click
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", manualItemsElement);
    await this.driver.sleep(1000);
    
    console.log('Clicking Manual Items...');
    await manualItemsElement.click();
    
    // Wait for Manual Items page to load
    await this.driver.sleep(3000);
    
    // Verify we're on the Manual Items page by looking for the search input
    try {
      await this.driver.wait(until.elementLocated(By.css('input[placeholder*="Search"], input[placeholder*="search"]')), 10000);
      console.log('Manual Items page loaded successfully');
    } catch (error) {
      console.log('Manual Items page may have loaded, continuing...');
    }
  }


  // manul items end
  
  async searchOrder(orderNumber: string): Promise<any> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log(`Searching for order: ${orderNumber}`);
    
    // Find search input using the exact selectors from your screenshots
    const searchSelectors = [
      'input[placeholder*="Search code, order #, organization, customer"]',
      'input.ant-input.ant-input-lg.css-43bhvr',
      'input[autocapitalize="off"][type="search"]',
      '.ant-input-search input',
      'input[placeholder*="search"]',
      'input[type="search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        searchInput = await this.driver.findElement(By.css(selector));
        console.log(`Found search input with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!searchInput) {
      throw new Error('Could not find search input field');
    }
    
    // Clear the input field thoroughly
    console.log('Clearing search input field...');
    await searchInput.clear();
    await this.driver.sleep(300);
    
    // Select all text and delete (backup clearing method)
    await searchInput.sendKeys(Key.CONTROL, 'a');
    await this.driver.sleep(200);
    await searchInput.sendKeys(Key.DELETE);
    await this.driver.sleep(300);
    
    // Verify field is empty
    const currentValue = await searchInput.getAttribute('value');
    if (currentValue && currentValue.trim() !== '') {
      console.log(`Field still contains: "${currentValue}", clearing again...`);
      await searchInput.clear();
      await this.driver.sleep(300);
    }
    
    // Enter the new order number
    console.log(`Entering order number: ${orderNumber}`);
    await searchInput.sendKeys(orderNumber);
    await this.driver.sleep(800);
    
    // Verify the correct order number was entered
    const enteredValue = await searchInput.getAttribute('value');
    console.log(`Entered value: "${enteredValue}"`);
    
    if (enteredValue !== orderNumber) {
      console.log('Value mismatch, clearing and re-entering...');
      await searchInput.clear();
      await this.driver.sleep(300);
      await searchInput.sendKeys(orderNumber);
      await this.driver.sleep(500);
    }
    
    // Find and click search button using the exact selectors from your screenshots
    const searchButtonSelectors = [
      'button.ant-btn.css-43bhvr.ant-btn-default.ant-btn-color-default.ant-btn-variant-outlined.ant-btn-lg.ant-btn-icon-only.ant-input-search-button',
      '.ant-input-search-button',
      '.ant-input-group-addon button',
      'button[type="button"][class*="search-button"]',
      'span.ant-input-group-addon button'
    ];
    
    let searchButton = null;
    for (const selector of searchButtonSelectors) {
      try {
        searchButton = await this.driver.findElement(By.css(selector));
        console.log(`Found search button with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (searchButton) {
      await searchButton.click();
      console.log('Clicked search button');
    } else {
      // Fallback to Enter key
      await searchInput.sendKeys(Key.ENTER);
      console.log('Used Enter key to search');
    }
    
    // Wait for search results
    await this.driver.sleep(3000);
    
    // Extract order data from results
    return await this.extractOrderData();
  }
  
  private async extractOrderData(): Promise<any> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    const data: any = {};
    
    try {
      // Wait for results to load
      await this.driver.wait(until.elementLocated(By.css('table, .ant-table-tbody, .ant-table-row')), 8000);
      
      // Look for the table row with results
      const resultSelectors = [
        'table tbody tr:first-child',
        '.ant-table-tbody tr:first-child',
        'tr.ant-table-row'
      ];
      
      let resultElement = null;
      for (const selector of resultSelectors) {
        try {
          resultElement = await this.driver.findElement(By.css(selector));
          console.log(`Found result row with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (resultElement) {
        // Extract data from table cells
        const cells = await resultElement.findElements(By.css('td'));
        console.log(`Found ${cells.length} cells in result row for order`);
        
        if (cells.length >= 2) {
          // Based on the table structure: Code, Location, Organization, Customer, Order #, Notes, Type, Date Created
          data.code = cells.length > 0 ? await cells[0].getText() : '';
          data.location = cells.length > 1 ? await cells[1].getText() : '';
          data.organization = cells.length > 2 ? await cells[2].getText() : '';
          data.customer = cells.length > 3 ? await cells[3].getText() : '';
          data.orderNumber = cells.length > 4 ? await cells[4].getText() : '';
          
          console.log(`Extracted data for order: Code=${data.code}, Location=${data.location}, Customer=${data.customer}`);
        }
      } else {
        console.log('No results found for this order');
        data.error = 'No results found';
      }
    } catch (error) {
      console.error('Error extracting order data:', error);
      data.error = 'No results found or error extracting data';
    }
    
    return data;
  }
  
  // Keep browser open for manual interaction
  async keepBrowserOpen(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('✅ Automation completed successfully! Browser will remain open for manual interaction...');
    // Don't close the driver - let user interact manually
  }
  
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }
}