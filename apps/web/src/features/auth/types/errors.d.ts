import type { AxiosError } from "axios";
import type { ApiError } from "./index";

export interface AuthError extends AxiosError<{ error: ApiError }> {
  response?: {
    data: {
      success: false;
      error: ApiError;
      timestamp: string;
      request_id: string;
    };
    status: number;
    statusText: string;
    headers: unknown;
    config: unknown;
  };
}
