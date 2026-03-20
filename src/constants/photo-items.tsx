export interface QuizData {
  id: number;
  category: string;
  image_url?: string;
  level: string;
  question: string;
  answer: string;
  options: string[] | string;
}

export const CARD_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-600",
  "bg-purple-500",
];

export const getBorderClass = (bgColor: string): string => {
  return bgColor.replace("bg-", "border-");
};

export const BORDER_COLOR_MAP: Record<string, string> = {
  "bg-red-500": "border-red-500",
  "bg-orange-500": "border-orange-500",
  "bg-yellow-500": "border-yellow-500",
  "bg-green-500": "border-green-500",
  "bg-sky-500": "border-sky-500",
  "bg-blue-500": "border-blue-500",
  "bg-indigo-600": "border-indigo-600",
  "bg-purple-500": "border-purple-500",
};
