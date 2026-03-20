import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { IndexCategories } from "@/constants/index-categories";
import { sound } from "@/lib/sound";

type Level = "low" | "mid" | "high";

type PlayerProfile = {
  id: string;
  nickname: string;
  level: Level;
  created_at: string;
};

const CATEGORY_STYLE: Record<
  string,
  { borderGradient: string; innerBg: string; text: string }
> = {
  publicPlace: {
    borderGradient:
      "bg-gradient-to-br from-[#003366] via-[#3366FF] to-[#99CCFF]",
    innerBg: "bg-[#BFE9FF]",
    text: "text-[#0B5ED7]",
  },
  school: {
    borderGradient:
      "bg-gradient-to-br from-[#B45309] via-[#F59E0B] to-[#FDE047]",
    innerBg: "bg-[#FFE066]",
    text: "text-[#FF8C00]",
  },
  house: {
    borderGradient:
      "bg-gradient-to-br from-[#9D174D] via-[#EC4899] to-[#FBCFE8]",
    innerBg: "bg-[#FFD6D6]",
    text: "text-[#FF4F8B]",
  },
  korean4: {
    borderGradient:
      "bg-gradient-to-br from-[#A78BFA] via-[#C4B5FD] to-[#EDE9FE]",
    innerBg: "bg-[#e2cbf6]",
    text: "text-[#6D28D9]",
  },
};

function PlayerSummaryCard({ players }: { players: PlayerProfile[] }) {
  const low = players.filter((p) => p.level === "low").length;
  const mid = players.filter((p) => p.level === "mid").length;
  const high = players.filter((p) => p.level === "high").length;
  const total = Math.max(1, players.length);
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

  return (
    <div className="mb-6 w-full rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-slate-900">
            내 플레이어 ({players.length})
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">
            난이도 분포 + 최근 닉네임
          </div>
        </div>

        <Link
          to="/players"
          className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.99]"
        >
          플레이어 관리
        </Link>
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border">
        <div className="flex h-3 w-full">
          <div className="h-full bg-emerald-400" style={{ width: pct(low) }} />
          <div className="h-full bg-amber-400" style={{ width: pct(mid) }} />
          <div className="h-full bg-rose-400" style={{ width: pct(high) }} />
          {players.length === 0 && (
            <div className="h-full w-full bg-slate-100" />
          )}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-sm font-bold">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
          쉬움 {low}
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">
          보통 {mid}
        </div>
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">
          어려움 {high}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {players.slice(0, 12).map((p) => (
          <span
            key={p.id}
            className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
          >
            {p.nickname}
            <span className="ml-2 text-slate-400">{p.level}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ExperimentHomePage() {
  const navigate = useNavigate();
  const { levelId = "low" } = useParams();

  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("player_profiles")
        .select("id,nickname,level,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PlayerProfile[];
    },
    staleTime: 1000 * 30,
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-[1280px] flex-col px-6 pt-10 pb-12 md:px-8">
      <PlayerSummaryCard players={players} />

      <div className="mb-8 text-center">
        <h1 className="text-[clamp(26px,2.2vw,38px)] font-black tracking-tight text-slate-900">
          카테고리를 선택하세요
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          카드를 올리면 개인/협동을 선택할 수 있어요
        </p>
      </div>

      <div className="grid w-full flex-1 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {IndexCategories.map((category) => {
          const s = CATEGORY_STYLE[category.id];

          return (
            <div
              key={category.id}
              className={`group relative aspect-[9/12] w-full rounded-2xl p-[4px] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${s.borderGradient}`}
            >
              <div
                className={`relative h-full w-full overflow-hidden rounded-[14px] p-6 ${s.innerBg}`}
              >
                <span
                  className={`relative z-20 block text-lg font-black md:text-xl ${s.text}`}
                >
                  {category.title}
                </span>

                <div className="pointer-events-none absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute right-[-18%] bottom-[2%] aspect-square w-[72%] opacity-35 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60">
                    <div className="flex h-full w-full items-end justify-end [&>img]:h-full [&>img]:w-full [&>img]:object-contain [&>svg]:h-full [&>svg]:w-full">
                      {category.icon}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      sound.unlock();
                      sound.startBgm();
                      navigate(`/solo/${levelId}/category/${category.id}`);
                    }}
                    className={`w-[62%] rounded-xl bg-white py-2.5 text-lg font-black shadow-md transition hover:scale-[1.02] active:scale-[0.99] ${s.text}`}
                  >
                    개인
                  </button>

                  <button
                    onClick={() => {
                      sound.unlock();
                      sound.startBgm();
                      navigate(`/team/${levelId}/category/${category.id}`);
                    }}
                    className={`w-[62%] rounded-xl bg-white py-2.5 text-lg font-black shadow-md transition hover:scale-[1.02] active:scale-[0.99] ${s.text}`}
                  >
                    협동
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-white/40" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
