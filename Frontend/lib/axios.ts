import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

if (!baseURL && process.env.NODE_ENV === "development") {
  console.warn("[axios] NEXT_PUBLIC_API_URL is not set.");
}

export const api = axios.create({
  baseURL,
  // You can add default headers or timeout here
  // timeout: 10000,
});

// Example interceptor placeholders (uncomment if needed)
// api.interceptors.request.use((config) => {
//   // e.g., attach auth token
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     // e.g., handle 401
//     return Promise.reject(err);
//   }
// );

export default api;
