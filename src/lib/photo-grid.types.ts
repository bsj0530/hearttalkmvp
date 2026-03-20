export type Level = "low" | "mid" | "high";

export type Player = {
  id: string;
  name: string;
  level: "low" | "mid" | "high";
};

export type PlayerProfile = {
  id: string;
  nickname: string;
  level: "low" | "mid" | "high";
};

export type WrongItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  image_url: string | null;
  category: string;
  level: string;
  playerName: string;
};

export interface PhotoGridProps {
  categoryTitle: string;
  selectedLevel: Level;
  titleColor?: string;
}
