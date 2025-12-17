export interface Schedule {
  readonly id: string;
  readonly event_id: string;
  readonly event?: {
    readonly id: string;
    readonly event_name: string;
  };
  readonly date: string;
  readonly session_name: string;
  readonly start_time: string;
  readonly end_time: string;
  readonly artist_name?: string;
  readonly rundown?: string;
  readonly capacity: number;
  readonly remaining_seat: number;
  readonly created_at: string;
  readonly updated_at: string;
}


