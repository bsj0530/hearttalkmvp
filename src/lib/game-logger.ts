import supabase from "@/lib/supabase";
import { useParticipant } from "@/store/participants";

export type GameEventType =
  | "game_start"
  | "game_end"
  | "turn_start"
  | "card_shown"
  | "answer"
  | "feedback_start"
  | "feedback_end"
  | "turn_end";

export interface GameLogPayload {
  turnNumber: number;
  playerId?: string;
  playerName?: string;
  eventType: GameEventType;

  quizId?: number;
  question?: string;
  selectedOption?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  noResponse?: boolean;

  category?: string;
  level?: string;
  slotIndex?: number;

  eventAt: string;
  reactionTimeMs?: number;
  metadata?: Record<string, any>;
}

export function nowISO() {
  return new Date().toISOString();
}

export async function logGameEvent(payload: GameLogPayload) {
  const state = useParticipant.getState();
  const participantId = state.participantId;
  const sessionId = state.sessionId;

  if (!participantId || !sessionId) {
    console.warn("[logGameEvent] participantId/sessionId 없음, 스킵");
    return;
  }

  try {
    const { error } = await supabase.from("game_logs").insert({
      participant_id: participantId,
      session_id: sessionId,
      turn_number: payload.turnNumber,
      player_id: payload.playerId ?? null,
      player_name: payload.playerName ?? null,
      event_type: payload.eventType,
      quiz_id: payload.quizId ?? null,
      question: payload.question ?? null,
      selected_option: payload.selectedOption ?? null,
      correct_answer: payload.correctAnswer ?? null,
      is_correct: payload.isCorrect ?? null,
      no_response: payload.noResponse ?? false,
      category: payload.category ?? null,
      level: payload.level ?? null,
      slot_index: payload.slotIndex ?? null,
      event_at: payload.eventAt,
      reaction_time_ms: payload.reactionTimeMs ?? null,
      metadata: payload.metadata ?? {},
    });

    if (error) console.error("[logGameEvent] 저장 실패:", error);
  } catch (err) {
    console.error("[logGameEvent] 에러:", err);
  }
}
