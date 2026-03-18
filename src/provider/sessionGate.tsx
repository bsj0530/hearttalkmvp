import { useParticipant } from "@/store/participants";
import ParticipantInputPage from "@/pages/ParticipantInputPage";
import { type ReactNode } from "react";

export default function SessionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);

  if (!hasHydrated) return null;

  if (!participantId) {
    return <ParticipantInputPage />;
  }

  return <>{children}</>;
}
