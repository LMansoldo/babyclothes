/**
 * Shared types for the agents service.
 */

// Child context from API
export interface ChildContext {
  child_id: string;
  name: string;
  birth_date: string; // ISO date
  gender: 'male' | 'female' | 'unisex';
  measurements: Measurement[];
}

export interface Measurement {
  recorded_at: string; // ISO datetime
  weight_g: number;
  height_cm: number;
  clothing_size: string;
}

// Chat graph state
export interface ChatState {
  message: string;
  child_context: ChildContext;
  intent?: ChatIntent;
  items?: CatalogItem[];
  response?: string;
  components?: ComponentReference[];
  error?: string;
}

export type ChatIntent =
  | 'search_items'
  | 'ask_recommendation'
  | 'general_question'
  | 'greeting'
  | 'unknown';

export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  clothing_size: string;
  condition: string;
  price_cents: number;
  photo_url?: string;
  gender?: string;
}

export interface ComponentReference {
  type: 'carousel' | 'item_list' | 'growth_alert';
  data: Record<string, unknown>;
}

// Growth graph state
export interface GrowthState {
  child: ChildContext;
  measurements: Measurement[];
  trend?: GrowthTrend;
  prediction?: SizePrediction;
  should_notify: boolean;
  notification?: NotificationPayload;
}

export interface GrowthTrend {
  weight_velocity: number; // g/day
  height_velocity: number; // cm/day
  current_size: string;
  size_fit: 'tight' | 'good' | 'loose';
}

export interface SizePrediction {
  predicted_size: string;
  confidence: number; // 0-100
  days_until_needed: number;
}

export interface NotificationPayload {
  user_id: string;
  type: 'growth_prediction';
  title: string;
  body: string;
  metadata: Record<string, unknown>;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// gRPC message types (matching proto/agent.proto)
export interface ChatChunk {
  type: string; // 'text' | 'component'
  content: string;
}

export interface GrowthPredictionResult {
  predicted_size: string;
  confidence: number;
  days_until_next_size: number;
}
