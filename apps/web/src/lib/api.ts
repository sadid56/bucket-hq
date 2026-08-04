import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  let orgId = "";
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    if (parts[1] === "dashboard" && parts[2]) {
      orgId = parts[2];
    } else {
      orgId = localStorage.getItem("active_organization_id") || "";
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (orgId) {
    config.headers["X-Organization-ID"] = orgId;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export async function api<T>(url: string, options: any = {}): Promise<T> {
  const method = options.method || "GET";
  let data = options.data;

  if (options.body && !data) {
    try {
      data = JSON.parse(options.body);
    } catch {
      data = options.body;
    }
  }

  const response = await axiosInstance({
    url,
    method,
    data,
    headers: options.headers,
    ...options,
  });

  const responseData = response.data;
  return responseData.data !== undefined ? responseData.data : responseData;
}
