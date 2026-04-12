/**
 * QuickBooks Integration Helper
 * Handles OAuth, API calls, and webhook management
 */

import crypto from 'crypto';

// QB OAuth Configuration
const QB_REALM_ID = process.env.QUICKBOOKS_REALM_ID || '';
const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID || '';
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET || '';
const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || '';
const QB_ENVIRONMENT = (process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX') as 'SANDBOX' | 'PRODUCTION';

// OAuth endpoints
const QB_AUTH_URL = `https://appcenter.intuit.com/connect/oauth2`;
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QB_API_BASE_URL =
  QB_ENVIRONMENT === 'SANDBOX'
    ? 'https://sandbox-quickbooks.api.intuit.com/v3/company'
    : 'https://quickbooks.api.intuit.com/v3/company';

/**
 * Generate OAuth authorization URL
 */
export function generateQBAuthURL(state: string): string {
  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: QB_REDIRECT_URI,
    state: state,
  });

  return `${QB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(authCode: string, realmId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  realmId: string;
}> {
  // Check if credentials are loaded
  console.log('[QB Token Exchange] ===== TOKEN EXCHANGE DEBUG START =====');
  console.log('[QB Token Exchange] QB_CLIENT_ID loaded:', QB_CLIENT_ID ? '✅' : '❌ MISSING');
  console.log('[QB Token Exchange] QB_CLIENT_SECRET loaded:', QB_CLIENT_SECRET ? '✅' : '❌ MISSING');
  console.log('[QB Token Exchange] QB_REDIRECT_URI loaded:', QB_REDIRECT_URI ? '✅' : '❌ MISSING');
  
  if (!QB_CLIENT_ID || !QB_CLIENT_SECRET) {
    console.error('[QB Token Exchange] ❌ CRITICAL: Missing QB credentials!');
    throw new Error('QB credentials not configured. Check .env.local');
  }

  const auth = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');

  console.log('[QB Token Exchange] QB_CLIENT_ID length:', QB_CLIENT_ID.length);
  console.log('[QB Token Exchange] QB_CLIENT_SECRET length:', QB_CLIENT_SECRET.length);
  console.log('[QB Token Exchange] Base64 auth header (first 20 chars):', auth.substring(0, 20) + '...');
  console.log('[QB Token Exchange] Starting token exchange...');
  console.log('[QB Token Exchange] QB_REDIRECT_URI:', QB_REDIRECT_URI);
  console.log('[QB Token Exchange] Auth code (first 20 chars):', authCode.substring(0, 20) + '...');

  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: QB_REDIRECT_URI,
  });
  
  console.log('[QB Token Exchange] Request body string:', requestBody.toString());

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody.toString(),
  });

  console.log('[QB Token Exchange] Response status:', response.status);
  console.log('[QB Token Exchange] Response status text:', response.statusText);
  console.log('[QB Token Exchange] Response headers:', Object.fromEntries(response.headers));

  const responseText = await response.text();
  console.log('[QB Token Exchange] Response body (raw):', responseText);
  console.log('[QB Token Exchange] Response body length:', responseText.length);

  if (!response.ok) {
    let errorMessage = 'Unknown error';
    let errorDetails = {};
    
    if (responseText) {
      try {
        const errorObj = JSON.parse(responseText);
        console.log('[QB Token Exchange] Parsed error object:', errorObj);
        errorMessage = errorObj.error_description || errorObj.error || errorObj.message || 'Unknown error';
        errorDetails = errorObj;
      } catch (e) {
        console.error('[QB Token Exchange] Failed to parse error response as JSON');
        console.log('[QB Token Exchange] Raw response text was:', responseText);
        errorMessage = `HTTP ${response.status}: ${responseText || 'empty response'}`;
      }
    } else {
      errorMessage = `HTTP ${response.status}: Empty response`;
    }
    
    console.error('[QB Token Exchange] Error details:', errorDetails);
    throw new Error(`QB Token Exchange Failed: ${errorMessage}`);
  }

  if (!responseText) {
    throw new Error('QB Token Exchange Failed: Empty response body');
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('[QB Token Exchange] Failed to parse success response');
    throw new Error(`QB Token Exchange Failed: Invalid JSON response - ${e}`);
  }

  console.log('[QB Token Exchange] ✅ Token received:', {
    accessToken: data.access_token ? '✅' : '❌',
    refreshToken: data.refresh_token ? '✅' : '❌',
    expiresIn: data.expires_in,
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    realmId: realmId,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const auth = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`QB Token Refresh Failed: ${error.error_description}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function getQBCredentialsByCurrency(currency: string): Promise<{
  accessToken: string;
  refreshToken: string;
  realmId: string;
  country: string;
}> {
  const { getDatabase } = await import('@/lib/prisma');
  const db = await getDatabase();
  const { QBCountryConfig } = await import('@/lib/models');
  const connectToDatabase = (await import('@/lib/db')).default;

  await connectToDatabase();

  // Verify this currency is configured in active QB countries
  const countryConfig = await QBCountryConfig.findOne({ 
    currency: currency.toUpperCase(), 
    isActive: true 
  });
  
  if (!countryConfig) {
    console.log(`[QB Router] ⚠️ Currency ${currency} not in active QB countries, using default`);
  }

  const admin = await db.collection('users').findOne({ role: 'ADMIN' });
  if (!admin) throw new Error('No admin found');

  // Try to find matching QB account by currency
  const qbAccount = admin.quickbooksAccounts?.find(
    (acc: any) => acc.currency === currency.toUpperCase() && acc.isConnected
  );

  if (qbAccount) {
    console.log(`[QB Router] ✅ Found QB account for currency ${currency}: realmId ${qbAccount.realmId} (${countryConfig?.label || 'Unknown'})`);
    return {
      accessToken: qbAccount.accessToken,
      refreshToken: qbAccount.refreshToken,
      realmId: qbAccount.realmId,
      country: qbAccount.country,
    };
  }

  // Fallback to legacy single QB account
  console.log(`[QB Router] ⚠️ Fallback to default QB account for currency: ${currency}`);
  if (admin.quickbooks?.isConnected) {
    return {
      accessToken: admin.quickbooks.accessToken,
      refreshToken: admin.quickbooks.refreshToken,
      realmId: admin.quickbooks.realmId,
      country: 'ZA',
    };
  }

  throw new Error(`No QB account connected for currency: ${currency}`);
}

/**
 * Make authenticated API call to QuickBooks
 */
export async function makeQBAPICall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  accessToken: string,
  realmId: string,
  body?: Record<string, any>
): Promise<any> {
  // Add minorversion=65 to all endpoints
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${QB_API_BASE_URL}/${realmId}${endpoint}${separator}minorversion=65`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[QB API Error] Status:', response.status, '| Body:', errorBody, '| URL:', url);
    throw new Error(`QB API Error: ${errorBody || response.statusText}`);
  }

  return response.json();
}

/**
 * Make QB API call with automatic token refresh on expiration
 * If token expires (error 3200), automatically refreshes and retries once
 */
export async function makeQBAPICallWithRefresh(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  realmId: string,
  body?: Record<string, any>,
  currency: string = 'ZAR'
): Promise<any> {
  try {
    const { getDatabase } = await import('@/lib/prisma');
    const db = await getDatabase();
    
    console.log(`[QB Refresh Wrapper] 🔍 Fetching QB admin credentials from DB for currency ${currency}...`);
    
    const admin = await db.collection('users').findOne({ role: 'ADMIN' });
    if (!admin) throw new Error('No admin found');

    let isLegacy = false;
    let qbAccount = admin.quickbooksAccounts?.find(
      (acc: any) => acc.currency === currency && acc.isConnected
    );

    if (!qbAccount) {
      if (admin.quickbooks?.isConnected) {
        isLegacy = true;
        qbAccount = admin.quickbooks;
      } else {
        throw new Error(`No QB connected admin found for currency ${currency}`);
      }
    }

    let { accessToken, refreshToken } = qbAccount;

    console.log('[QB Refresh Wrapper] ✅ Admin credentials loaded');

    try {
      // Try the API call
      return await makeQBAPICall(endpoint, method, accessToken, realmId, body);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      
      // Check if token expired
      const isTokenExpired = 
        errorMessage.includes('3200') ||
        errorMessage.includes('Token expired') ||
        errorMessage.includes('AuthenticationFailed') ||
        errorMessage.includes('invalid_grant') ||
        errorMessage.includes('401');

      if (isTokenExpired && refreshToken) {
        console.log('[QB Refresh Wrapper] ⚠️ Token expired! Error:', errorMessage);
        console.log('[QB Refresh Wrapper] 🔄 Refreshing access token...');

        try {
          // Refresh the token
          const newTokens = await refreshAccessToken(refreshToken);
          
          console.log('[QB Refresh Wrapper] ✅ Token refreshed successfully');

          // Update database with new tokens
          if (isLegacy) {
            await db.collection('users').updateOne(
              { _id: admin._id },
              {
                $set: {
                  'quickbooks.accessToken': newTokens.accessToken,
                  'quickbooks.refreshToken': newTokens.refreshToken,
                  'quickbooks.tokenExpiresAt': new Date(Date.now() + newTokens.expiresIn * 1000),
                  'quickbooks.lastTokenRefresh': new Date(),
                },
              }
            );
          } else {
            await db.collection('users').updateOne(
              { _id: admin._id, 'quickbooksAccounts.country': qbAccount.country },
              {
                $set: {
                  'quickbooksAccounts.$.accessToken': newTokens.accessToken,
                  'quickbooksAccounts.$.refreshToken': newTokens.refreshToken,
                  'quickbooksAccounts.$.tokenExpiresAt': new Date(Date.now() + newTokens.expiresIn * 1000),
                  'quickbooksAccounts.$.lastTokenRefresh': new Date(),
                }
              }
            );
          }

          console.log('[QB Refresh Wrapper] 💾 New tokens saved to database');
          console.log('[QB Refresh Wrapper] 🔁 Retrying API call with refreshed token...');
          return await makeQBAPICall(endpoint, method, newTokens.accessToken, realmId, body);

          // Retry the API call with new token
          return await makeQBAPICall(endpoint, method, newTokens.accessToken, realmId, body);
        } catch (refreshError) {
          console.error('[QB Refresh Wrapper] ❌ Token refresh failed:', refreshError);
          throw new Error(`Token refresh failed: ${refreshError instanceof Error ? refreshError.message : 'Unknown error'}`);
        }
      }

      // If not a token error, throw original error
      throw error;
    }
  } catch (error) {
    console.error('[QB Refresh Wrapper] ❌ Fatal error:', error);
    throw error;
  }
}

/**
 * Create Customer in QuickBooks (for clients)
 * If accessToken is not provided, uses makeQBAPICallWithRefresh for automatic token refresh
 */
export async function createQBCustomer(
  accessTokenOrRealmId: string,
  realmIdOrCustomerData?: string | any,
  customerDataOrUndefined?: any,
  currency: string = 'ZAR'
): Promise<{ id: string; syncToken: string }> {
  // Handle both old and new call styles
  // Old: createQBCustomer(accessToken, realmId, customerData)
  // New: createQBCustomer(realmId, customerData, currency) - uses auto refresh wrapper
  
  let accessToken: string | null = null;
  let realmId: string;
  let customerData: any;

  if (realmIdOrCustomerData && typeof realmIdOrCustomerData === 'object') {
    // New style: realmId, customerData (no accessToken)
    realmId = accessTokenOrRealmId;
    customerData = realmIdOrCustomerData;
    accessToken = null;
    if (typeof customerDataOrUndefined === 'string') {
      currency = customerDataOrUndefined;
    }
  } else {
    // Old style: accessToken, realmId, customerData
    accessToken = accessTokenOrRealmId;
    realmId = realmIdOrCustomerData as string;
    customerData = customerDataOrUndefined;
  }

  // Sanitize customer display name
  const sanitizedName = customerData.displayName
    .replace(/[^a-zA-Z0-9 .,\-'&]/g, '')  // remove special chars QB rejects
    .trim()
    .substring(0, 100);  // QB max length is 100 chars

  if (!sanitizedName) {
    throw new Error(`Invalid customer display name: "${customerData.displayName}"`);
  }

  const payload = {
    DisplayName: sanitizedName,
    ...(customerData.email && { PrimaryEmailAddr: { Address: customerData.email } }),
    ...(customerData.phone && { PrimaryPhone: { FreeFormNumber: customerData.phone } }),
    ...(customerData.billingAddress && {
      BillAddr: {
        Line1: customerData.billingAddress.line1,
        City: customerData.billingAddress.city,
        CountrySubDivisionCode: customerData.billingAddress.countrySubDivisionCode,
        PostalCode: customerData.billingAddress.postalCode,
        Country: customerData.billingAddress.country,
      },
    }),
  };

  // If no accessToken provided, use wrapper with automatic refresh
  const makeCall = accessToken 
    ? async (endpoint: string, method: any, body?: any) => makeQBAPICall(endpoint, method, accessToken, realmId, body)
    : async (endpoint: string, method: any, body?: any) => makeQBAPICallWithRefresh(endpoint, method, realmId, body, currency);

  // Check if customer already exists
  const encodedQuery = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName = '${sanitizedName}'`);
  try {
    const queryResult = await makeCall(`/query?query=${encodedQuery}`, 'GET');
    if (queryResult.QueryResponse?.Customer?.length > 0) {
      const existing = queryResult.QueryResponse.Customer[0];
      console.log('[QB] ✅ Found existing customer:', existing.Id);
      return { id: existing.Id, syncToken: existing.SyncToken };
    }
  } catch (e) {
    console.log('[QB] Customer query check skipped, creating new customer...');
  }

  // Create new customer
  try {
    const createResult = await makeCall('/customer', 'POST', payload);
    console.log('[QB] ✅ Customer created:', createResult.Customer.Id);
    return {
      id: createResult.Customer.Id,
      syncToken: createResult.Customer.SyncToken,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    
    // If duplicate exists, fetch existing customer by name
    if (message.includes('6240') || message.includes('Duplicate Name')) {
      console.log('[QB] Customer already exists, fetching existing record...');
      const encodedQuery = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName = '${sanitizedName}'`);
      const result = await makeCall(
        `/query?query=${encodedQuery}`,
        'GET'
      );
      const existing = result.QueryResponse?.Customer?.[0];
      if (existing) {
        console.log('[QB] ✅ Found existing customer:', existing.Id);
        return { id: existing.Id, syncToken: existing.SyncToken };
      }
    }
    throw error;
  }
}

/**
 * Create Vendor in QuickBooks (for transporters)
 * If accessToken is not provided, uses makeQBAPICallWithRefresh for automatic token refresh
 */
export async function createQBVendor(
  accessTokenOrRealmId: string,
  realmIdOrVendorData?: string | any,
  vendorDataOrUndefined?: any,
  currency: string = 'ZAR'
): Promise<{ id: string; syncToken: string }> {
  // Handle both old and new call styles
  // Old: createQBVendor(accessToken, realmId, vendorData)
  // New: createQBVendor(realmId, vendorData, currency) - uses auto refresh wrapper

  let accessToken: string | null = null;
  let realmId: string;
  let vendorData: any;

  if (realmIdOrVendorData && typeof realmIdOrVendorData === 'object') {
    // New style: realmId, vendorData (no accessToken)
    realmId = accessTokenOrRealmId;
    vendorData = realmIdOrVendorData;
    accessToken = null;
    if (typeof vendorDataOrUndefined === 'string') {
      currency = vendorDataOrUndefined;
    }
  } else {
    // Old style: accessToken, realmId, vendorData
    accessToken = accessTokenOrRealmId;
    realmId = realmIdOrVendorData as string;
    vendorData = vendorDataOrUndefined;
  }

  const sanitizedName = vendorData.displayName
    .replace(/[^a-zA-Z0-9 .,\-'&]/g, '')
    .trim()
    .substring(0, 100);

  // If no accessToken provided, use wrapper with automatic refresh
  const makeCall = accessToken 
    ? async (endpoint: string, method: any, body?: any) => makeQBAPICall(endpoint, method, accessToken, realmId, body)
    : async (endpoint: string, method: any, body?: any) => makeQBAPICallWithRefresh(endpoint, method, realmId, body, currency);

  const fetchExisting = async () => {
    const encodedQuery = encodeURIComponent(`SELECT * FROM Vendor WHERE DisplayName = '${sanitizedName}'`);
    const result = await makeCall(`/query?query=${encodedQuery}`, 'GET');
    const existing = result.QueryResponse?.Vendor?.[0];
    if (existing) {
      console.log('[QB] ✅ Found existing vendor:', existing.Id);
      return { id: existing.Id, syncToken: existing.SyncToken };
    }
    throw new Error(`Vendor not found after duplicate error for: ${sanitizedName}`);
  };

  // Check if already exists first
  try {
    return await fetchExisting();
  } catch (_) {}

  // Try to create
  try {
    const payload: any = { DisplayName: sanitizedName };
    if (vendorData.email) payload.PrimaryEmailAddr = { Address: vendorData.email };
    if (vendorData.phone) payload.PrimaryPhone = { FreeFormNumber: vendorData.phone };

    const createResult = await makeCall('/vendor', 'POST', payload);
    console.log('[QB] ✅ Vendor created:', createResult.Vendor.Id);
    return { id: createResult.Vendor.Id, syncToken: createResult.Vendor.SyncToken };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('6240') || message.includes('Duplicate Name')) {
      return await fetchExisting();
    }
    throw error;
  }
}

/**
 * Create Invoice in QuickBooks (for clients)
 * If accessToken is not provided, uses makeQBAPICallWithRefresh for automatic token refresh
 */
export async function createQBInvoice(
  accessTokenOrRealmId: string,
  realmIdOrInvoiceData?: string | any,
  invoiceDataOrUndefined?: any,
  currency: string = 'ZAR'
): Promise<{ invoiceId: string; invoiceNumber: string; syncToken: string }> {
  // Handle both old and new call styles
  // Old: createQBInvoice(accessToken, realmId, invoiceData)
  // New: createQBInvoice(realmId, invoiceData, currency) - uses auto refresh wrapper

  let accessToken: string | null = null;
  let realmId: string;
  let invoiceData: any;

  if (realmIdOrInvoiceData && typeof realmIdOrInvoiceData === 'object') {
    // New style: realmId, invoiceData (no accessToken)
    realmId = accessTokenOrRealmId;
    invoiceData = realmIdOrInvoiceData;
    accessToken = null;
    if (typeof invoiceDataOrUndefined === 'string') {
      currency = invoiceDataOrUndefined;
    }
  } else {
    // Old style: accessToken, realmId, invoiceData
    accessToken = accessTokenOrRealmId;
    realmId = realmIdOrInvoiceData as string;
    invoiceData = invoiceDataOrUndefined;
  }

  // If no accessToken provided, use wrapper with automatic refresh
  const makeCall = accessToken 
    ? async (endpoint: string, method: any, body?: any) => makeQBAPICall(endpoint, method, accessToken, realmId, body)
    : async (endpoint: string, method: any, body?: any) => makeQBAPICallWithRefresh(endpoint, method, realmId, body, currency);

  // Get account ID for income (default income account)
  let incomeAccountId = '1';
  try {
    const encodedQuery = encodeURIComponent(`SELECT * FROM Account WHERE AccountType = 'Income' MAXRESULTS 1`);
    const accountsResult = await makeCall(`/query?query=${encodedQuery}`, 'GET');
    incomeAccountId = accountsResult.QueryResponse?.Account?.[0]?.Id || '1';
  } catch (e) {
    console.log('[QB] Using default income account ID');
  }

  const lines = invoiceData.lineItems.map((item: any, index: number) => ({
    Id: String(index + 1),
    LineNum: index + 1,
    Description: item.description || 'Freight Service',
    Amount: Number(item.unitPrice || item.amount) || 0,
    DetailType: 'SalesItemLineDetail',
    SalesItemLineDetail: {
      ItemRef: { value: '1', name: 'Services' },
      Qty: Number(item.quantity) || 1,
      UnitPrice: Number(item.unitPrice || item.amount) || 0,
    },
  }));

  const payload = {
    CustomerRef: { value: String(invoiceData.customerId) },
    Line: lines,
    DueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const result = await makeCall('/invoice', 'POST', payload);

  return {
    invoiceId: result.Invoice.Id,
    invoiceNumber: result.Invoice.DocNumber,
    syncToken: result.Invoice.SyncToken,
  };
}

export async function createQBBill(
  accessTokenOrRealmId: string,
  realmIdOrBillData?: string | any,
  billDataOrUndefined?: any,
  currency: string = 'ZAR'
): Promise<{ billId: string; billNumber: string; syncToken: string }> {
  // Handle both old and new call styles
  // Old: createQBBill(accessToken, realmId, billData)
  // New: createQBBill(realmId, billData, currency) - uses auto refresh wrapper

  let accessToken: string | null = null;
  let realmId: string;
  let billData: any;

  if (realmIdOrBillData && typeof realmIdOrBillData === 'object') {
    // New style: realmId, billData (no accessToken)
    realmId = accessTokenOrRealmId;
    billData = realmIdOrBillData;
    accessToken = null;
    if (typeof billDataOrUndefined === 'string') {
      currency = billDataOrUndefined;
    }
  } else {
    // Old style: accessToken, realmId, billData
    accessToken = accessTokenOrRealmId;
    realmId = realmIdOrBillData as string;
    billData = billDataOrUndefined;
  }

  const makeCall = accessToken
    ? async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) =>
        makeQBAPICall(endpoint, method, accessToken, realmId, body)
    : async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) =>
        makeQBAPICallWithRefresh(endpoint, method, realmId, body, currency);

  // Get account ID for expenses
  let expenseAccountId = '2';
  try {
    const encodedQuery = encodeURIComponent(`SELECT * FROM Account WHERE AccountType = 'Expense' MAXRESULTS 1`);
    const accountsResult = await makeCall(`/query?query=${encodedQuery}`, 'GET');
    expenseAccountId = accountsResult.QueryResponse?.Account?.[0]?.Id || '2';
  } catch (e) {
    console.log('[QB] Using default expense account ID');
  }

  const lines = billData.lineItems.map((item: any, index: number) => ({
    Id: String(index + 1),
    LineNum: index + 1,
    Description: item.description || 'Freight Service',
    Amount: Number(item.amount) || 0,
    DetailType: 'AccountBasedExpenseLineDetail',
    AccountBasedExpenseLineDetail: {
      AccountRef: { value: String(expenseAccountId) },
      BillableStatus: 'NotBillable',
    },
  }));

  const payload = {
    VendorRef: { value: String(billData.vendorId) },
    Line: lines,
    DueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const result = await makeCall('/bill', 'POST', payload);

  return {
    billId: result.Bill.Id,
    billNumber: result.Bill.DocNumber,
    syncToken: result.Bill.SyncToken,
  };
}

/**
 * Get Invoice payment status
 */
export async function getQBInvoiceStatus(
  accessToken: string,
  realmId: string,
  invoiceId: string
): Promise<{ paidAmount: number; balance: number; status: string }> {
  const encodedQuery = encodeURIComponent(`SELECT * FROM Invoice WHERE Id = '${invoiceId}'`);
  const result = await makeQBAPICall(`/query?query=${encodedQuery}`, 'GET', accessToken, realmId);

  const invoice = result.QueryResponse?.Invoice?.[0];

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found in QB`);
  }

  const totalAmount = invoice.TotalAmt || 0;
  const balance = invoice.Balance || totalAmount;
  const paidAmount = totalAmount - balance;

  return {
    paidAmount,
    balance,
    status: balance === 0 ? 'PAID' : balance === totalAmount ? 'UNPAID' : 'PARTIAL_PAID',
  };
}

/**
 * Generate webhook signature verification (for QB webhooks)
 */
export function verifyQBWebhookSignature(
  body: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha256', QB_CLIENT_SECRET)
    .update(body)
    .digest('base64');

  return hash === signature;
}

/**
 * Parse QB webhook payload
 */
export function parseQBWebhook(body: any): {
  eventType: string;
  entityId: string;
  realmId: string;
  timestamp: number;
}[] {
  return (body.eventNotifications || []).map((notification: any) => ({
    eventType: notification.operation, // CREATE, UPDATE, DELETE
    entityId: notification.id,
    realmId: notification.realmId,
    timestamp: notification.lastUpdated,
  }));
}

export default {
  generateQBAuthURL,
  exchangeCodeForToken,
  refreshAccessToken,
  makeQBAPICall,
  createQBCustomer,
  createQBVendor,
  createQBInvoice,
  createQBBill,
  getQBInvoiceStatus,
  verifyQBWebhookSignature,
  parseQBWebhook,
};
