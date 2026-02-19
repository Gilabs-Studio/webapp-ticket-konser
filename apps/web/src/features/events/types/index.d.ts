export type EventStatus = "draft" | "published" | "closed";

export interface Event {
  readonly id: string;
  readonly eventName: string;
  readonly description?: string;
  readonly bannerImage?: string;
  readonly status: EventStatus;
  readonly startDate: string;
  readonly endDate: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly meta?: {
    readonly pagination?: {
      readonly page: number;
      readonly per_page: number;
      readonly total: number;
      readonly total_pages: number;
      readonly has_next: boolean;
      readonly has_prev: boolean;
      readonly next_page?: number;
      readonly prev_page?: number;
    };
    readonly filters?: Record<string, unknown>;
  };
  readonly timestamp: string;
  readonly request_id: string;
}



