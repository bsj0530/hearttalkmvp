import { supabase } from "@/lib/supabase";

interface LogEventParams {
  participantId: string;
  sessionId: string;
  condition?: string | null;
  eventType: string;
  payload?: Record<string, unknown>;
}

export async function logEvent({
  participantId,
  sessionId,
  condition,
  eventType,
  payload = {},
}: LogEventParams) {
  const { data, error } = await supabase
    .from("experiment_logs")
    .insert({
      participant_id: participantId,
      session_id: sessionId,
      condition,
      event_type: eventType,
      payload,
    })
    .select();

  console.log("logEvent result:", { data, error });

  if (error) {
    throw error;
  }

  return data;
}
