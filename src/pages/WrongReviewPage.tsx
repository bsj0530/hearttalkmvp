import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type WrongItem = {
  id: number;
  question: string;
  options: string[];
  answer: string;
  selectedAnswer?: string;
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

  const cleanQuestion = (question: string) => {
    return question.replace(/___/g, "").replace(/\s+/g, " ").trim();
  };

  return (
    <div className="mx-auto w-full max-w-[1050px] px-5 py-10">
      <div className="mb-10 flex items-center justify-between gap-5">
        <div>
          <h1 className="text-6xl font-black tracking-tight text-gray-900">
            오답 확인
          </h1>
          <div className="mt-3 text-2xl font-black text-gray-500">
            총 {wrongAnswers.length}문제
          </div>
        </div>

        <button
          onClick={() => nav("/")}
          className="rounded-2xl px-8 py-4 text-2xl font-black text-white shadow-lg hover:opacity-90 active:scale-95"
          style={{ backgroundColor: accent }}
        >
          홈으로 돌아가기
        </button>
      </div>

      {wrongAnswers.length === 0 ? (
        <div
          className="rounded-3xl border-2 p-14 text-center text-4xl font-black"
          style={{
            borderColor: `${accent}40`,
            backgroundColor: `${accent}10`,
            color: accent,
          }}
        >
          오답이 없어요 🎉
        </div>
      ) : (
        <div className="space-y-8">
          {playerGroups.map(([playerName, items]) => {
            const isExpanded = expandedPlayers.has(playerName);

            return (
              <div
                key={playerName}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md"
              >
                <button
                  type="button"
                  onClick={() => togglePlayer(playerName)}
                  className="flex w-full items-center justify-between px-8 py-7 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="grid h-20 w-20 place-items-center rounded-full text-4xl font-black text-white shadow"
                      style={{ backgroundColor: accent }}
                    >
                      {playerName.charAt(0)}
                    </div>

                    <div>
                      <div className="text-4xl font-black text-gray-900">
                        {playerName}
                      </div>
                      <div className="mt-1 text-2xl font-black text-gray-500">
                        오답 {items.length}개
                      </div>
                    </div>
                  </div>

                  <div
                    className="grid h-14 w-14 place-items-center rounded-xl text-2xl font-black text-white transition"
                    style={{ backgroundColor: isExpanded ? "#374151" : accent }}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t bg-gray-50/60 px-5 py-5">
                    <div className="space-y-5">
                      {items.map((w, idx) => {
                        const itemKey = `${playerName}-${w.id}-${idx}`;
                        const open = openSet.has(itemKey);

                        return (
                          <div
                            key={itemKey}
                            className={`overflow-hidden rounded-2xl border bg-white transition ${
                              open
                                ? "border-gray-300 shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(itemKey)}
                              className="flex w-full items-center justify-between gap-5 px-7 py-6 text-left transition hover:bg-gray-50"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-5xl leading-tight font-black text-gray-900">
                                  {cleanQuestion(w.question)}
                                </div>
                              </div>

                              <div
                                className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-2xl font-black text-white transition"
                                style={{
                                  backgroundColor: open ? "#374151" : accent,
                                }}
                              >
                                {open ? "−" : "+"}
                              </div>
                            </button>

                            {open && (
                              <div className="border-t bg-white px-7 py-7">
                                {w.image_url && (
                                  <div className="mb-6 overflow-hidden rounded-2xl border bg-gray-50">
                                    <img
                                      src={w.image_url}
                                      alt="wrong"
                                      className="aspect-[4/3] w-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}

                                <div className="grid gap-4">
                                  {(w.options ?? []).map((opt, i) => {
                                    const isCorrect = opt === w.answer;
                                    const isSelectedWrong =
                                      opt === w.selectedAnswer && !isCorrect;

                                    return (
                                      <div
                                        key={i}
                                        className={`rounded-2xl border-2 px-8 py-7 text-4xl leading-tight font-black ${
                                          isCorrect
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                            : isSelectedWrong
                                              ? "border-red-300 bg-red-50 text-red-700"
                                              : "border-gray-200 bg-white text-gray-800"
                                        }`}
                                      >
                                        <span>{opt}</span>

                                        {isCorrect && (
                                          <span className="ml-5 text-3xl font-black">
                                            ✓ 정답
                                          </span>
                                        )}

                                        {isSelectedWrong && (
                                          <span className="ml-5 text-3xl font-black">
                                            ✕ 오답
                                          </span>
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
