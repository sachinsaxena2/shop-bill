import { QueryClient, QueryFunction } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Alert } from "react-native";

/**
 * Shows an error alert to the user
 */
function showErrorAlert(title: string, message: string) {
  Alert.alert(
    title,
    message,
    [{ text: "OK", style: "default" }],
    { cancelable: true }
  );
}

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // In production APK, use Constants.expoConfig.extra (set via app.config.js during build)
  // In development, use process.env
  let host = Constants.expoConfig?.extra?.EXPO_PUBLIC_DOMAIN || process.env.EXPO_PUBLIC_DOMAIN || "http://192.168.1.18:3000";

  console.log("🌍 Domain Source Check:");
  console.log("  - Constants.expoConfig.extra.EXPO_PUBLIC_DOMAIN:", Constants.expoConfig?.extra?.EXPO_PUBLIC_DOMAIN);
  console.log("  - process.env.EXPO_PUBLIC_DOMAIN:", process.env.EXPO_PUBLIC_DOMAIN);
  console.log("  - Final host:", host);

  // If host already has protocol (http:// or https://), use it directly
  if (host.startsWith("http://") || host.startsWith("https://")) {
    let url = new URL(host);
    return url.href;
  }

  // Use http for localhost and local network IPs, https for everything else
  const isLocalNetwork = 
    host.includes("localhost") || 
    host.startsWith("127.") || 
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.startsWith("172.16.") ||
    host.startsWith("172.17.") ||
    host.startsWith("172.18.") ||
    host.startsWith("172.19.") ||
    host.startsWith("172.2") ||
    host.startsWith("172.30.") ||
    host.startsWith("172.31.");
  
  const protocol = isLocalNetwork ? "http" : "https";
  let url = new URL(`${protocol}://${host}`);

  return url.href;
}

function getApiKey(): string {
  // In production APK, use Constants.expoConfig.extra (set via app.config.js during build)
  // In development, use process.env or fallback to hardcoded value for local dev
  const apiKey = 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY || 
    process.env.EXPO_PUBLIC_API_KEY || 
    "nazZEw5vhOhw1tLBGTwVhxs9MQrW2hjhY4h"; // Fallback for local development
  
  console.log("🔑 API Key Source Check:");
  console.log("  - Constants.expoConfig.extra:", Constants.expoConfig?.extra);
  console.log("  - process.env.EXPO_PUBLIC_API_KEY:", process.env.EXPO_PUBLIC_API_KEY);
  console.log("  - Final API Key:", apiKey);
  
  return apiKey;
}

function getAuthHeaders(): Record<string, string> {
  const apiKey = getApiKey();
  if (apiKey) {
    return { "X-API-Key": apiKey };
  }
  return {};
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    console.log(`\n========== API REQUEST DEBUG ==========`);
    console.log(`📍 Route: ${route}`);
    console.log(`🔧 Method: ${method}`);
    
    const baseUrl = getApiUrl();
    console.log(`🌍 Base URL: ${baseUrl}`);
    
    const url = new URL(route, baseUrl);
    console.log(`🔗 Full URL: ${url.toString()}`);

    const headers: Record<string, string> = {
      ...getAuthHeaders(),
    };
    
    console.log(`🔑 Headers being sent:`);
    console.log(JSON.stringify(headers, null, 2));
    console.log(`🔑 X-API-Key present: ${headers['X-API-Key'] ? 'YES ✅' : 'NO ❌'}`);
    console.log(`🔑 X-API-Key value: ${headers['X-API-Key'] || 'MISSING'}`);
    
    if (data) {
      headers["Content-Type"] = "application/json";
      console.log(`📦 Request body: ${JSON.stringify(data).substring(0, 100)}...`);
    }

    console.log(`🚀 Initiating fetch request...`);
    const fetchStartTime = Date.now();
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`✅ Fetch completed in ${fetchDuration}ms`);
    console.log(`📡 Status: ${res.status} ${res.statusText}`);
    console.log(`📥 Response headers:`, JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
    console.log(`========== END DEBUG ==========\n`);
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const errorMessage = (error as Error)?.message || 'Unknown error';
    const errorTitle = 'API Request Failed';
    
    console.error(`\n========== API REQUEST ERROR ==========`);
    console.error(`❌ Request: ${method} ${route}`);
    console.error(`❌ Error Type: ${error?.constructor?.name}`);
    console.error(`❌ Error Message: ${errorMessage}`);
    console.error(`❌ Stack: ${(error as Error)?.stack}`);
    
    // Try to get more details about network error
    if (errorMessage.includes('Network request failed')) {
      console.error(`\n🔍 NETWORK ERROR DIAGNOSIS:`);
      console.error(`   • URL attempted: ${new URL(route, getApiUrl()).toString()}`);
      console.error(`   • This is a cleartext HTTP request to an IP address`);
      console.error(`   • Android may be blocking this for security`);
      console.error(`   • Check: networkSecurityConfig in app.json`);
      console.error(`   • Check: usesCleartextTraffic setting`);
    }
    console.error(`========== END ERROR ==========\n`);
    
    // Show error popup to user
    let userMessage = '';
    
    if (errorMessage.includes('Network request failed')) {
      userMessage = `Cannot connect to server.\n\nPlease check:\n• Internet connection\n• Server is running at ${getApiUrl()}\n\nThis may be an Android security restriction on HTTP traffic.`;
    } else if (errorMessage.includes('401')) {
      userMessage = 'Authentication failed. Please check API key.';
    } else if (errorMessage.includes('403')) {
      userMessage = 'Access forbidden. Please check permissions.';
    } else if (errorMessage.includes('404')) {
      userMessage = `Endpoint not found: ${route}`;
    } else if (errorMessage.includes('500')) {
      userMessage = 'Server error. Please try again later.';
    } else {
      userMessage = `${errorMessage}\n\nEndpoint: ${method} ${route}`;
    }
    
    showErrorAlert(errorTitle, userMessage);
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
