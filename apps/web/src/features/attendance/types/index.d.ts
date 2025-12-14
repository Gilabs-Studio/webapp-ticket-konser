export interface Attendee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  ticket_type: string;
  ticket_tier: "VIP" | "General" | "Premium" | "Standard";
  registration_date: string;
  status: "checked_in" | "registered" | "cancelled";
  checked_in_at?: string;
  avatar_url?: string;
}

export interface AttendeeFilters {
  search?: string;
  ticket_tier?: Attendee["ticket_tier"];
  status?: Attendee["status"];
  page?: number;
  per_page?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  timestamp: string;
  request_id: string;
}
