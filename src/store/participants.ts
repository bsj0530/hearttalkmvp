import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logEvent } from "@/lib/log-event";

type Condition = "A" | "B";

interface ParticipantState {
  participantId: string | null;
  sessionId: string | null;
  condition: Condition | null;
  startedAt: number | null;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  initParticipant: (participantId: string) => Promise<void>;
  clearParticipant: () => void;
}

function generateSessionId() {
  return `S_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function assignCondition(participantId: string): Condition {
  const normalized = participantId.trim().toUpperCase();

  if (/^A[1-5]$/.test(normalized)) return "A";
  if (/^B[1-5]$/.test(normalized)) return "B";

  throw new Error("참가자 번호는 A1~A5 또는 B1~B5 형식이어야 합니다.");
}

export const useParticipant = create<ParticipantState>()(
  persist(
    (set) => ({
      participantId: null,
      sessionId: null,
      condition: null,
      startedAt: null,

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      initParticipant: async (participantId: string) => {
        const normalizedParticipantId = participantId.trim().toUpperCase();
        const sessionId = generateSessionId();
        const condition = assignCondition(normalizedParticipantId);
        const startedAt = Date.now();

        set({
          participantId: normalizedParticipantId,
          sessionId,
          condition,
          startedAt,
        });

        try {
          await logEvent({
            participantId: normalizedParticipantId,
            sessionId,
            condition,
            eventType: "participant_registered",
            payload: {
              startedAt,
            },
          });
        } catch (error) {
          console.error("participant_registered log 저장 실패:", error);
        }
      },

      clearParticipant: () => {
        set({
          participantId: null,
          sessionId: null,
          condition: null,
          startedAt: null,
        });
      },
    }),
    {
      name: "participant-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
