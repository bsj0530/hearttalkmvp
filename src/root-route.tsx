import { Navigate, Route, Routes } from "react-router";
import ExperimentHomePage from "./pages/ExperimentHomePage";
import ParticipantInputPage from "./pages/ParticipantInputPage";
import PlayersPage from "./pages/players-page";
import { useParticipant } from "@/store/participants";
import GlobalLayout from "./components/layout/global-layout";

function RootEntry() {
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);

  console.log("RootEntry", { hasHydrated, participantId });

  if (!hasHydrated) return null;
  if (!participantId) return <ParticipantInputPage />;

  return <ExperimentHomePage />;
}

function PlayersEntry() {
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);

  if (!hasHydrated) return null;
  if (!participantId) return <Navigate to="/" replace />;

  return <PlayersPage />;
}

export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<RootEntry />} />
        <Route path="/players" element={<PlayersEntry />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
