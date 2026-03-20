import { Navigate, Route, Routes } from "react-router";
import ExperimentHomePage from "./pages/ExperimentHomePage";
import ParticipantInputPage from "./pages/ParticipantInputPage";
import { useParticipant } from "@/store/participants";
import GlobalLayout from "./components/layout/global-layout";

function RootEntry() {
  const participantId = useParticipant((state) => state.participantId);

  if (!participantId) {
    return <ParticipantInputPage />;
  }

  return <ExperimentHomePage />;
}

export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<RootEntry />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
