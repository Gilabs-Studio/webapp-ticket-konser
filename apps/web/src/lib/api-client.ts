import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  const queue = [...failedQueue];
  failedQueue.splice(0, failedQueue.length);
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
};

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

interface ErrorDetails {
  field?: string;
  resource?: string;
  value?: string;
  [key: string]: unknown;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
    field_errors?: Array<{ field: string; message: string }>;
  };
  timestamp: string;
  request_id: string;
}

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Cannot connect to server", {
          description: "Please ensure the backend server is running",
        });
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Connection failed", {
          description: "Unable to connect to backend. Please check your internet connection or ensure the server is running.",
        });
      } else {
        toast.error("An error occurred", {
          description: error.message || "Failed to complete request",
        });
      }
      return Promise.reject(error);
    }

    const status = error.response.status;
    const errorData = error.response.data;

    if (!errorData || !errorData.error) {
      toast.error("An error occurred", {
        description: "Unexpected error format",
      });
      return Promise.reject(error);
    }

    const errorCode = errorData.error.code;
    const errorMessage = errorData.error.message;
    const errorDetails = errorData.error.details;
    const fieldErrors = errorData.error.field_errors;

    if (errorCode === "RESOURCE_ALREADY_EXISTS" || errorCode === "CONFLICT") {
      if (errorDetails?.field === "email" && errorDetails?.resource === "user") {
        toast.error("Email already exists", {
          description: `The email "${errorDetails.value}" is already registered. Please use a different email.`,
        });
      } else if (errorDetails?.field && errorDetails?.resource) {
        toast.error("Resource already exists", {
          description: `The ${errorDetails.field} "${errorDetails.value}" already exists for this ${errorDetails.resource}.`,
        });
      } else {
        toast.error("Conflict", {
          description: errorMessage || "Resource already exists",
        });
      }
      return Promise.reject(error);
    }

    if (errorCode === "INTERNAL_SERVER_ERROR" && errorDetails) {
      if (errorDetails.field === "email" && errorDetails.resource === "user") {
        toast.error("Email already exists", {
          description: `The email "${errorDetails.value}" is already registered. Please use a different email.`,
        });
        return Promise.reject(error);
      }
      if (errorDetails.field && errorDetails.resource) {
        toast.error("Validation error", {
          description: `The ${errorDetails.field} "${errorDetails.value}" is invalid or already exists for this ${errorDetails.resource}.`,
        });
        return Promise.reject(error);
      }
    }

    if (errorCode === "VALIDATION_ERROR" && fieldErrors && fieldErrors.length > 0) {
      const firstError = fieldErrors[0];
      toast.error("Validation error", {
        description: `${firstError.field}: ${firstError.message}`,
      });
      return Promise.reject(error);
    }

    if (status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (originalRequest?._retry || originalRequest?.url?.includes("/auth/refresh")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          toast.error("Session expired", {
            description: "Please login again",
          });
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

        if (!refreshToken) {
          isRefreshing = false;
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            toast.error("Session expired", {
              description: "Please login again",
            });
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
          }
          processQueue(error, null);
          return Promise.reject(error);
        }

        const refreshClient = axios.create({
          baseURL: `${API_BASE_URL}/api/v1`,
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        return refreshClient
          .post<{
            success: boolean;
            data?: {
              user: {
                id: string;
                email: string;
                name: string;
                role: string;
                permissions: string[];
                created_at: string;
                updated_at: string;
              };
              token: string;
              refresh_token: string;
              expires_in: number;
            };
          }>("/auth/refresh", {
            refresh_token: refreshToken,
          })
          .then((refreshResponse) => {
            const response = refreshResponse.data;
            if (response.success && response.data) {
              const { user, token, refresh_token } = response.data;
              if (typeof window !== "undefined") {
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", refresh_token);
                document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
              }

              import("@/features/auth/stores/useAuthStore").then(({ useAuthStore }) => {
                useAuthStore.getState().setAuth(user, token, refresh_token);
              });

              if (originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              originalRequest._retry = true;

              processQueue(null, token);
              isRefreshing = false;

              return apiClient(originalRequest);
            } else {
              throw new Error("Refresh token failed");
            }
          })
          .catch((refreshError) => {
            isRefreshing = false;
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              toast.error("Session expired", {
                description: "Please login again",
              });
              setTimeout(() => {
                window.location.href = "/login";
              }, 1000);
            }
            processQueue(refreshError as AxiosError, null);
            return Promise.reject(refreshError);
          });
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest?.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest._retry = true;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    } else if (status === 403) {
      toast.error("Access denied", {
        description: errorMessage || "You do not have permission to perform this action",
      });
    } else if (status === 404) {
      const isMutation = error.config?.method && ["post", "put", "patch", "delete"].includes(error.config.method.toLowerCase());
      if (isMutation) {
        toast.error("Not found", {
          description: errorMessage || "The requested resource was not found",
        });
      }
    } else if (status === 409) {
      toast.error("Conflict", {
        description: errorMessage || "Resource conflict occurred",
      });
    } else if (status >= 500) {
      toast.error("Server error", {
        description: errorMessage || "An error occurred on the server",
      });
    } else {
      toast.error("Request failed", {
        description: errorMessage || "An error occurred",
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;


