import { QueryClient, QueryFunction } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

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
  // In Expo, EXPO_PUBLIC_ prefixed variables are available via process.env
  const apiKey = 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY || 
    process.env.EXPO_PUBLIC_API_KEY || 
    "";
  
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
    const baseUrl = getApiUrl();
    const url = new URL(route, baseUrl);

    const headers: Record<string, string> = {
      ...getAuthHeaders(),
    };
    
    if (data) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed [${method} ${route}]:`, (error as Error)?.message);
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
