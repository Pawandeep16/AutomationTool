import { google } from 'googleapis';

interface OrderRow {
  orderNumber: string;
  [key: string]: any;
}

export class GoogleSheetsService {
  private sheets: any;
  
  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth });
  }
  
  extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL format');
    }
    return match[1];
  }
  
  parseDateString(dateStr: string): Date | null {
    // Handle formats like "08/09", "8/9", "12/25", etc.
    const currentYear = new Date().getFullYear();
    
    // Try MM/DD or M/D format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(currentYear, month - 1, day);
      }
    }
    
    return null;
  }
  
  async getLatestDateSheet(spreadsheetId: string): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });
      
      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error('No sheets found in the spreadsheet');
      }
      
      let latestSheet = '';
      let latestDate: Date | null = null;
      
      for (const sheet of sheets) {
        const title = sheet.properties?.title;
        if (!title) continue;
        
        const parsedDate = this.parseDateString(title);
        if (parsedDate && (!latestDate || parsedDate > latestDate)) {
          latestDate = parsedDate;
          latestSheet = title;
        }
      }
      
      if (!latestSheet) {
        // If no date sheets found, use the first sheet
        latestSheet = sheets[0].properties?.title || 'Sheet1';
      }
      
      return latestSheet;
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw new Error('Failed to access Google Sheet. Please check permissions and URL.');
    }
  }
  
  async getOrderNumbers(spreadsheetId: string, sheetName: string): Promise<OrderRow[]> {
    try {
      // Get all data from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`, // Get all columns
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }
      
      // Find the column that contains order numbers
      // Look for common headers like "Order", "Order Number", "Order ID", etc.
      const headerRow = rows[0];
      const orderColumnIndex = this.findOrderColumn(headerRow);
      
      if (orderColumnIndex === -1) {
        throw new Error('Could not find order number column. Expected headers like "Order", "Order Number", or "Order ID"');
      }
      
      const orders: OrderRow[] = [];
      
      // Process data rows (skip header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const orderNumber = row[orderColumnIndex]?.toString().trim();
        
        if (orderNumber) {
          // Create order object with all row data
          const orderData: OrderRow = { orderNumber };
          
          // Add other column data using headers as keys
          for (let j = 0; j < headerRow.length; j++) {
            if (j !== orderColumnIndex && row[j]) {
              const header = headerRow[j]?.toString().toLowerCase().replace(/\s+/g, '_');
              orderData[header] = row[j];
            }
          }
          
          orders.push(orderData);
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Error reading sheet data:', error);
      throw new Error('Failed to read order data from the sheet');
    }
  }
  
  private findOrderColumn(headers: any[]): number {
    const orderHeaders = [
      'order',
      'order number',
      'order_number',
      'ordernumber',
      'order id',
      'order_id',
      'orderid',
    ];
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase().trim();
      if (orderHeaders.includes(header)) {
        return i;
      }
    }
    
    return -1;
  }
  
  async processSheet(googleSheetUrl: string): Promise<OrderRow[]> {
    const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);
    
    // For the test sheet, we'll use the first sheet directly
    // In production, you might want to use getLatestDateSheet
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    
    const sheets = response.data.sheets;
    if (!sheets || sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    const sheetName = sheets[0].properties?.title || 'Sheet1';
    const orders = await this.getOrderNumbers(spreadsheetId, sheetName);
    
    console.log(`Found ${orders.length} orders in sheet "${sheetName}"`);
    return orders;
  }
  
  async updateLocationInSheet(googleSheetUrl: string, orderNumber: string, location: string): Promise<void> {
    const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);
    
    try {
      // Get the first sheet
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });
      
      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error('No sheets found in the spreadsheet');
      }
      
      const sheetName = sheets[0].properties?.title || 'Sheet1';
      
      // Get all data to find the row with this order number
      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      
      const rows = dataResponse.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No data found in sheet');
      }
      
      // Find the header row and order number column
      const headerRow = rows[0];
      const orderColumnIndex = headerRow.findIndex((header: string) => 
        header && header.toLowerCase().includes('order')
      );
      const locationColumnIndex = headerRow.findIndex((header: string) => 
        header && header.toLowerCase().includes('location')
      );
      
      if (orderColumnIndex === -1) {
        throw new Error('Order Number column not found');
      }
      
      if (locationColumnIndex === -1) {
        throw new Error('Locations column not found');
      }
      
      // Find the row with this order number
      let targetRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[orderColumnIndex] && row[orderColumnIndex].toString().trim() === orderNumber) {
          targetRowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }
      
      if (targetRowIndex === -1) {
        throw new Error(`Order ${orderNumber} not found in sheet`);
      }
      
      // Update the location cell
      const columnLetter = String.fromCharCode(65 + locationColumnIndex); // Convert to A, B, C, etc.
      const range = `${sheetName}!${columnLetter}${targetRowIndex}`;
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[location]]
        }
      });
      
      console.log(`Updated ${orderNumber} location to: ${location}`);
      
    } catch (error) {
      console.error('Error updating sheet:', error);
      throw error;
    }
  }
}