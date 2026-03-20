import { Link, Outlet, useLocation } from "react-router";
import love from "@/assets/image/love.png";
import loveSmile from "@/assets/image/love-smile.png";
import Background1 from "@/components/layout/background";
import Background2 from "@/components/layout/backgroundlogin";

export default function GlobalLayout() {
  const location = useLocation();
  const guestPaths = ["/sign-in", "/sign-up"];
  const isGuestPage = guestPaths.includes(location.pathname);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
        {isGuestPage ? <Background2 /> : <Background1 />}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 h-[60px] w-full border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full items-center justify-between px-[3%] md:px-[4%]">
          <Link to={"/"} className="group flex items-center gap-1">
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

      {/* Main: 진짜 풀폭(여백 없음). 여백은 각 페이지에서 주기 */}
      <main className="relative z-10 w-full flex-1">
        <Outlet />
      </main>

      <footer className="text-muted-foreground relative z-10 py-10 text-center font-sans">
        © 2025 seungje. All rights reserved.
      </footer>
    </div>
  );
}
