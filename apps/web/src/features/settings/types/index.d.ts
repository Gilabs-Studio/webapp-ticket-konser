export interface EventSettings {
  readonly eventName: string;
  readonly date: string;
  readonly capacity: number;
  readonly urlSlug: string;
}

export type SettingsTab = "general" | "team" | "billing" | "notifications";


