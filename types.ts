
export interface User {
  email: string;
  password?: string;
  data?: {
    input: UserInput;
    lastInsights: AIInsights | null;
  };
}

export interface SocialEvent {
  id: string;
  title: string;
  time: string; // Display time (e.g. "2:00 PM")
  startTime?: string; // ISO string or specific time for AI
  intensity: number; // 1-10
  hazardType?: string; // Satirical category
  escapePlan?: string; // Humorous text
  source?: 'manual' | 'google_calendar';
}

export interface ForecastData {
  time: string;
  battery: number;
}

export interface AIInsights {
  currentLevel: number;
  label: string;
  statusTag: string;
  insightText: string;
  tips: string[];
  forecast: ForecastData[];
  collapseMoment?: string; // e.g. "6:39 PM - Total Humanity Rejection"
}

export interface UserInput {
  currentBattery: number;
  eyeContactFactor: number;
  smallTalkDensity: number;
  events: SocialEvent[];
  isGoogleCalendarConnected?: boolean;
}
