import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type WrongItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  image_url: string | null;
  category: string;
  level: string;
  playerName: string;
};

export default function WrongReviewPage() {
  const nav = useNavigate();
  const { state } = useLocation() as {
    state?: {
      wrongAnswers?: WrongItem[];
      categoryTitle?: string;
      selectedLevel?: string;
      accent?: string;
    };
  };

  const accent = state?.accent ?? "#7C3AED";
  const wrongAnswers = useMemo(() => state?.wrongAnswers ?? [], [state]);

  const playerGroups = useMemo(() => {
    const map = new Map<string, WrongItem[]>();
    for (const w of wrongAnswers) {
      const name = w.playerName || "알 수 없음";
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(w);
    }
    return Array.from(map.entries());
  }, [wrongAnswers]);

  const [openSet, setOpenSet] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    new Set(playerGroups.map(([name]) => name)),
  );

  const togglePlayer = (name: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-gray-900">오답 확인</h1>
          <div className="mt-2 text-xl font-bold text-gray-500">
            총 {wrongAnswers.length}문제
          </div>
        </div>

        <button
          onClick={() => nav("/")}
          className="rounded-2xl px-7 py-3 text-xl font-black text-white shadow hover:opacity-90 active:scale-95"
          style={{ backgroundColor: accent }}
        >
          홈으로 돌아가기
        </button>
      </div>

      {wrongAnswers.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center text-2xl font-bold"
          style={{
            borderColor: `${accent}40`,
            backgroundColor: `${accent}10`,
            color: accent,
          }}
        >
          오답이 없어요 🎉
        </div>
      ) : (
        <div className="space-y-7">
          {playerGroups.map(([playerName, items]) => {
            const isExpanded = expandedPlayers.has(playerName);

            return (
              <div
                key={playerName}
                className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => togglePlayer(playerName)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="grid h-14 w-14 place-items-center rounded-full text-2xl font-black text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {playerName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">
                        {playerName}
                      </div>
                      <div className="text-lg font-bold text-gray-500">
                        오답 {items.length}개
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid h-11 w-11 place-items-center rounded-lg text-lg font-black text-white transition"
                    style={{ backgroundColor: isExpanded ? "#374151" : accent }}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t bg-gray-50/50 px-4 py-4">
                    <div className="space-y-4">
                      {items.map((w, idx) => {
                        const itemKey = `${playerName}-${w.id}-${idx}`;
                        const open = openSet.has(itemKey);

                        return (
                          <div
                            key={itemKey}
                            className={`overflow-hidden rounded-xl border bg-white transition ${
                              open
                                ? "border-gray-300 shadow-md"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(itemKey)}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-3xl font-black text-gray-900">
                                  {w.question}
                                </div>
                              </div>

                              <div
                                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-lg font-black text-white transition"
                                style={{
                                  backgroundColor: open ? "#374151" : accent,
                                }}
                              >
                                {open ? "−" : "+"}
                              </div>
                            </button>

                            {open && (
                              <div className="border-t bg-white px-5 py-5">
                                {w.image_url && (
                                  <div className="mb-5 overflow-hidden rounded-xl border bg-gray-50">
                                    <img
                                      src={w.image_url}
                                      alt="wrong"
                                      className="aspect-[4/3] w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}

                                <div className="grid gap-3">
                                  {(w.options ?? []).map((opt, i) => (
                                    <div
                                      key={i}
                                      className={`rounded-xl border px-5 py-4 text-xl font-bold ${
                                        opt === w.answer
                                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                          : "border-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {opt}
                                      {opt === w.answer && (
                                        <span className="ml-2 text-lg font-black">
                                          ✓ 정답
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div
                                  className="mt-5 rounded-xl px-5 py-4 text-xl font-black text-white shadow"
                                  style={{ backgroundColor: accent }}
                                >
                                  정답: {w.answer}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
