export type Level =
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "level5"
  | "level6";

export type LowMode = "voice" | "text";

export type Player = {
  id: string;
  name: string;
  level: Level;
  low_mode?: LowMode | null;
};

export type PlayerProfile = {
  id: string;
  participant_id: string;
  nickname: string;
  level: Level;
  low_mode: LowMode | null;
  created_at: string;
};

export type WrongItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  selectedAnswer: string;
  image_url?: string | null;
  category: string;
  level: string;
  playerName: string;
};

export type PhotoGridProps = {
  categoryTitle: string;
  selectedLevel?: Level;
  lowMode?: LowMode;
  titleColor?: string;
};
