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
  "bg-rose-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-purple-600",
  "bg-violet-600",
  "bg-indigo-600",
  "bg-blue-600",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-green-600",
  "bg-lime-500",
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-slate-700",
];

export const getBorderClass = (bgColor: string): string => {
  return bgColor.replace("bg-", "border-");
};

export const BORDER_COLOR_MAP: Record<string, string> = {
  "bg-rose-500": "border-rose-500",
  "bg-pink-500": "border-pink-500",
  "bg-fuchsia-500": "border-fuchsia-500",
  "bg-purple-600": "border-purple-600",
  "bg-violet-600": "border-violet-600",
  "bg-indigo-600": "border-indigo-600",
  "bg-blue-600": "border-blue-600",
  "bg-sky-500": "border-sky-500",
  "bg-cyan-500": "border-cyan-500",
  "bg-teal-500": "border-teal-500",
  "bg-emerald-500": "border-emerald-500",
  "bg-green-600": "border-green-600",
  "bg-lime-500": "border-lime-500",
  "bg-yellow-500": "border-yellow-500",
  "bg-amber-500": "border-amber-500",
  "bg-orange-500": "border-orange-500",
  "bg-red-500": "border-red-500",
  "bg-slate-700": "border-slate-700",
};
