import { Link, Outlet } from "react-router";
import love from "@/assets/image/love.png";
import loveSmile from "@/assets/image/love-smile.png";
import Background1 from "@/components/layout/background";
import Background2 from "@/components/layout/backgroundlogin";
import { useParticipant } from "@/store/participants";

export default function GlobalLayout() {
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);
  const showBackground2 = hasHydrated && !participantId;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
        {showBackground2 ? <Background2 /> : <Background1 />}
      </div>

      <header className="sticky top-0 z-50 h-[60px] w-full border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full items-center justify-between px-[3%] md:px-[4%]">
          <Link to="/" className="group flex items-center gap-1">
            <div className="relative h-7 w-10">
              <img
                src={love}
                className="absolute h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                alt="logo"
              />
              <img
                src={loveSmile}
                className="absolute h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                alt="logo hover"
              />
            </div>
            <div className="text-xl font-bold">Heart Talk</div>
          </Link>
          <div />
        </div>
      </header>

      <main className="relative z-10 w-full flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 py-10 text-center font-sans text-gray-500">
        © 2025 seungje. All rights reserved.
      </footer>
    </div>
  );
}
