"use client";
import { store } from "@/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
  data?: any; // JSON body
  formData?: FormData; // alternative to data for multipart
  headers?: Record<string, string>;
  signal?: AbortSignal;
  pointName?: string; // for logging/analytics
  auth?: boolean; // default true
};

function buildQuery(params?: RequestOptions["params"]) {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.append(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function getAuth() {
  const state = store.getState?.();
  const token = state?.auth?.token || (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);
  const tokenType = state?.auth?.tokenType || (typeof window !== "undefined" ? localStorage.getItem("tokenType") : null) || "Bearer";
  return { token, tokenType };
}

export async function request<T = any>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<{
  ok: boolean;
  status: number;
  data?: T;
  message?: string;
}> {
  const { params, data, formData, headers = {}, signal, pointName, auth = true } = options;
  const url = `${API_URL}${endpoint}${buildQuery(params)}`;

  const reqHeaders: Record<string, string> = { ...headers };
  let body: BodyInit | undefined = undefined;

  if (formData) {
    body = formData; // browser sets content-type
  } else if (data !== undefined) {
    reqHeaders["Content-Type"] = reqHeaders["Content-Type"] || "application/json";
    body = JSON.stringify(data);
  }

  if (auth) {
    const { token, tokenType } = getAuth();
    if (token) reqHeaders["Authorization"] = `${tokenType} ${token}`;
  }

  try {
    const res = await fetch(url, { method, headers: reqHeaders, body, signal });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const parsed = isJson ? await res.json().catch(() => ({})) : undefined;

    // Normalize success/data/message from various backends
    const success = (parsed && typeof parsed.success === "boolean") ? parsed.success : res.ok;
    const payload = parsed && (parsed.data !== undefined ? parsed.data : parsed);
    const message = parsed?.message || (!res.ok ? res.statusText : undefined);

    if (!res.ok) {
      if (pointName) console.warn(`[API:${pointName}] ${method} ${endpoint} failed`, { status: res.status, message });
      return { ok: false, status: res.status, data: payload as T, message };
    }

    if (pointName) console.log(`[API:${pointName}] ${method} ${endpoint} ok`);
    return { ok: success, status: res.status, data: payload as T, message };
  } catch (err: any) {
    if (pointName) console.error(`[API:${pointName}] ${method} ${endpoint} error`, err);
    return { ok: false, status: 0, message: err?.message || "Network error" };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: Omit<RequestOptions, "data" | "formData">) => request<T>("GET", endpoint, options),
  post: <T = any>(endpoint: string, options?: Omit<RequestOptions, "params">) => request<T>("POST", endpoint, options),
  put: <T = any>(endpoint: string, options?: Omit<RequestOptions, "params">) => request<T>("PUT", endpoint, options),
  patch: <T = any>(endpoint: string, options?: Omit<RequestOptions, "params">) => request<T>("PATCH", endpoint, options),
  delete: <T = any>(endpoint: string, options?: Omit<RequestOptions, "params">) => request<T>("DELETE", endpoint, options),
};

export default api;
