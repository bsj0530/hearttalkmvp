import SessionGate from "./provider/sessionGate";
import RootRoute from "./root-route";

export default function App() {
  return (
    <SessionGate>
      <RootRoute />
    </SessionGate>
  );
}
