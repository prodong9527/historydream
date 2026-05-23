export interface HistoricalEvent {
  id: number;
  month: number;
  day: number;
  year: number;
  location: string;
  title: string;
  narrator: string;
  content: string;
  image_prompts: string[] | null;
  image_urls: string[] | null;
  golden_sentence: string;
  is_builtin?: boolean;
}

export interface SavedStory {
  id: number;
  event_id: number;
  content_snapshot: string;
  saved_at: number;
}