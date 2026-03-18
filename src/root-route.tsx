import { Navigate, Route, Routes } from "react-router";
import ExperimentHomePage from "./pages/ExperimentHomePage";
import ParticipantInputPage from "./pages/ParticipantInputPage";
import { useParticipant } from "@/store/participants";

function RootEntry() {
  const participantId = useParticipant((state) => state.participantId);

  // 👉 participant 없으면 입력 페이지
  if (!participantId) {
    return <ParticipantInputPage />;
  }

  // 👉 있으면 실험 페이지
  return <ExperimentHomePage />;
}

export default function RootRoute() {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
