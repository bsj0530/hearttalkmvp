import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import supabase from "@/lib/supabase";
import type { QuizData } from "@/constants/photo-items";
import { FlipCard3D } from "@/components/flip-card3d";

import confetti from "canvas-confetti";
import { sound } from "@/lib/sound";

import type {
  PhotoGridProps,
  Player,
  PlayerProfile,
  WrongItem,
} from "@/lib/photo-grid.types";
import { GRID_COLS, POOL_SIZE } from "@/constants/photo-grid.constants";
import {
  shuffleArray,
  pickRandomUnique,
  normalizeOptions,
} from "@/lib/photo-grid.utils";
import { useParticipant } from "@/store/participants";
import { logGameEvent, nowISO } from "@/lib/game-logger";

export default function PhotoGrid({
  categoryTitle,
  selectedLevel,
  titleColor,
}: PhotoGridProps) {
  const navigate = useNavigate();
  const accent = titleColor ?? "#6366F1";
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const participantId = useParticipant((state) => state.participantId);

  const [teamCardCount, setTeamCardCount] = useState<number>(10);
  const targetCount = teamCardCount;
  const gridRows = Math.max(1, Math.ceil(targetCount / GRID_COLS));

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [players, setPlayers] = useState<Player[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(true);
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>([]);

  const [wrongAnswers, setWrongAnswers] = useState<WrongItem[]>([]);

  const [teamImageUrl, setTeamImageUrl] = useState<string | null>(null);
  const [teamImagePreview, setTeamImagePreview] = useState<string | null>(null);
  const [teamImageFile, setTeamImageFile] = useState<File | null>(null);

  const [revealed, setRevealed] = useState<boolean[]>(
    Array(targetCount).fill(false),
  );

  const usedIdsRef = useRef<Set<number>>(new Set());

  /* ── 로깅용 refs ── */
  const turnNumberRef = useRef(0);
  const cardShownAtRef = useRef<string | null>(null);
  const pendingQuizRef = useRef<QuizData | null>(null);
  const turnStartLoggedRef = useRef(false);

  const [turnDeck, setTurnDeck] = useState<(QuizData | null)[]>(
    Array(targetCount).fill(null),
  );

  const poolRef = useRef<{
    loaded: boolean;
    lastCategory?: string;
    low: QuizData[];
    mid: QuizData[];
    high: QuizData[];
  }>({ loaded: false, lastCategory: undefined, low: [], mid: [], high: [] });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridWrapRef = useRef<HTMLDivElement | null>(null);
  const [cardH, setCardH] = useState(230);
  const [gridReady, setGridReady] = useState(false);
  const winnerSoundPlayedRef = useRef(false);

  /* ── 기본 hooks ── */

  useEffect(() => {
    return () => {
      sound.stopBgm();
    };
  }, []);

  useLayoutEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;
    const GAP = 0;
    const BOTTOM_SAFE = 13;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const available = window.innerHeight - rect.top - BOTTOM_SAFE;
      const h = (available - GAP * (gridRows - 1)) / gridRows;
      setCardH(Math.max(160, Math.min(400, Math.floor(h))));
      setGridReady(true);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [gridRows]);

  const { data: savedPlayers = [] } = useQuery({
    queryKey: ["players", participantId],
    queryFn: async () => {
      if (!participantId) return [];
      const { data, error } = await supabase
        .from("player_profiles")
        .select("id,nickname,level")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PlayerProfile[];
    },
    enabled: !!participantId,
    staleTime: 1000 * 30,
  });

  const activePlayer = players[activeIndex];
  const activeLevel: "low" | "mid" | "high" =
    activePlayer?.level ?? selectedLevel ?? "mid";

  useEffect(() => {
    if (gameStarted) return;
    setTurnDeck(Array(targetCount).fill(null));
    setRevealed(Array(targetCount).fill(false));
  }, [targetCount, gameStarted]);

  const parsedTurnDeck = useMemo(() => {
    return turnDeck.map((q) => {
      if (!q) return null;
      return { ...q, options: normalizeOptions(q.options) } as QuizData;
    });
  }, [turnDeck]);

  /* ── 데이터 로딩 ── */

  const fetchByLevel = useCallback(
    async (lv: "low" | "mid" | "high") => {
      if (!categoryTitle) return [];
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("category", categoryTitle)
        .eq("level", lv)
        .limit(POOL_SIZE);
      if (error) throw error;
      return (data ?? []) as QuizData[];
    },
    [categoryTitle],
  );

  const ensurePoolLoaded = useCallback(async () => {
    const needReload =
      !poolRef.current.loaded || poolRef.current.lastCategory !== categoryTitle;
    if (!needReload) return;
    if (!categoryTitle) {
      poolRef.current = {
        loaded: true,
        lastCategory: categoryTitle,
        low: [],
        mid: [],
        high: [],
      };
      return;
    }
    const [low, mid, high] = await Promise.all([
      fetchByLevel("low"),
      fetchByLevel("mid"),
      fetchByLevel("high"),
    ]);
    poolRef.current = {
      loaded: true,
      lastCategory: categoryTitle,
      low: shuffleArray(low),
      mid: shuffleArray(mid),
      high: shuffleArray(high),
    };
  }, [categoryTitle, fetchByLevel]);

  const advanceTurn = useCallback(() => {
    setActiveIndex((prev) =>
      players.length ? (prev + 1) % players.length : 0,
    );
  }, [players.length]);

  const buildTurnDeck = useCallback(
    async (lv: "low" | "mid" | "high") => {
      setLoading(true);
      try {
        await ensurePoolLoaded();
        const source = poolRef.current[lv] ?? [];
        const sampled = pickRandomUnique(
          source,
          targetCount,
          usedIdsRef.current,
        );
        if (gameStarted && sampled.every((x) => x === null)) {
          toast("문제가 부족해요", {
            description: `${lv.toUpperCase()} 난이도 문제를 더 추가해줘!`,
          });
        }
        setTurnDeck(sampled);
      } catch (e) {
        console.error(e);
        setTurnDeck(Array(targetCount).fill(null));
      } finally {
        setLoading(false);
      }
    },
    [ensurePoolLoaded, gameStarted, targetCount],
  );

  useEffect(() => {
    if (!gameStarted) {
      setLoading(false);
      setTurnDeck(Array(targetCount).fill(null));
      setRevealed(Array(targetCount).fill(false));
      return;
    }
    if (!players.length) return;
    buildTurnDeck(activeLevel);
  }, [
    gameStarted,
    activeLevel,
    categoryTitle,
    selectedLevel,
    refreshKey,
    players.length,
    buildTurnDeck,
    targetCount,
  ]);

  /* ── 로깅 헬퍼 ── */

  const currentPlayerInfo = () => {
    const p = players[activeIndex];
    return { playerId: p?.id, playerName: p?.name };
  };

  const pushWrong = (q: QuizData) => {
    setWrongAnswers((prev) => [
      ...prev,
      {
        id: q.id,
        question: q.question,
        options: normalizeOptions(q.options),
        answer: q.answer,
        image_url: q.image_url ?? null,
        category: (q.category as any) ?? categoryTitle,
        level: String(q.level),
        playerName: activePlayer?.name ?? "알 수 없음",
      },
    ]);
  };

  const handleCardShown = (slotIndex: number) => {
    const { playerId, playerName } = currentPlayerInfo();

    // 이 턴의 turn_start가 아직 안 찍혔으면 여기서 찍음
    if (!turnStartLoggedRef.current) {
      logGameEvent({
        turnNumber: turnNumberRef.current,
        playerId,
        playerName,
        eventType: "turn_start",
        category: categoryTitle,
        level: activeLevel,
        eventAt: nowISO(),
      });
      turnStartLoggedRef.current = true;
    }

    const ts = nowISO();
    cardShownAtRef.current = ts;

    const q = turnDeck[slotIndex];
    pendingQuizRef.current = q;

    logGameEvent({
      turnNumber: turnNumberRef.current,
      playerId,
      playerName,
      eventType: "card_shown",
      quizId: q?.id,
      question: q?.question,
      correctAnswer: q?.answer,
      category: categoryTitle,
      level: activeLevel,
      slotIndex,
      eventAt: ts,
    });
  };

  // ② 옵션 클릭 즉시 → answer + feedback_start
  const handleAnswer = (
    slotIndex: number,
    selectedOption: string,
    isCorrect: boolean,
  ) => {
    const responseAt = nowISO();
    const q = pendingQuizRef.current;
    const { playerId, playerName } = currentPlayerInfo();

    let reactionTimeMs: number | undefined;
    if (cardShownAtRef.current) {
      reactionTimeMs =
        new Date(responseAt).getTime() -
        new Date(cardShownAtRef.current).getTime();
    }

    logGameEvent({
      turnNumber: turnNumberRef.current,
      playerId,
      playerName,
      eventType: "answer",
      quizId: q?.id,
      question: q?.question,
      selectedOption,
      correctAnswer: q?.answer,
      isCorrect,
      category: categoryTitle,
      level: activeLevel,
      slotIndex,
      eventAt: responseAt,
      reactionTimeMs,
    });

    logGameEvent({
      turnNumber: turnNumberRef.current,
      playerId,
      playerName,
      eventType: "feedback_start",
      quizId: q?.id,
      isCorrect,
      eventAt: nowISO(),
      metadata: { feedback: isCorrect ? "정답" : "오답" },
    });
  };

  // ③ 애니메이션 완료 → feedback_end + turn_end + (game_end or 다음 턴 준비)
  const handleTurnEnd = (
    slotIndex: number,
    correct: boolean,
    selectedOption: string,
  ) => {
    if (!gameStarted || winner || players.length === 0) return;

    const q = pendingQuizRef.current;
    if (!q) return;

    usedIdsRef.current.add(q.id);
    const { playerId, playerName } = currentPlayerInfo();

    // feedback_end
    logGameEvent({
      turnNumber: turnNumberRef.current,
      playerId,
      playerName,
      eventType: "feedback_end",
      quizId: q.id,
      isCorrect: correct,
      eventAt: nowISO(),
    });

    // 상태 업데이트
    let isGameOver = false;

    if (correct) {
      const newRevealed = [...revealed];
      newRevealed[slotIndex] = true;
      setRevealed(newRevealed);

      if (newRevealed.every(Boolean)) {
        isGameOver = true;
      }
    } else {
      pushWrong(q);

      const source = poolRef.current[activeLevel] ?? [];
      const replacement = pickRandomUnique(source, 1, usedIdsRef.current);
      setTurnDeck((prev) => {
        const next = [...prev];
        next[slotIndex] = replacement[0] ?? null;
        return next;
      });

      toast("다시 맞춰보자 🙂", {
        description: "정답을 맞히면 해당 사진 조각이 열려요!",
      });
    }

    // turn_end
    logGameEvent({
      turnNumber: turnNumberRef.current,
      playerId,
      playerName,
      eventType: "turn_end",
      quizId: q.id,
      isCorrect: correct,
      eventAt: nowISO(),
    });

    if (isGameOver) {
      // game_end (turn_end 이후)
      logGameEvent({
        turnNumber: turnNumberRef.current,
        eventType: "game_end",
        category: categoryTitle,
        level: activeLevel,
        eventAt: nowISO(),
        metadata: {
          totalTurns: turnNumberRef.current,
          wrongCount: wrongAnswers.length,
        },
      });

      setWinner("협동 성공! (사진 완성)");
      return;
    }

    // 다음 턴 준비 (turn_start는 다음 카드 클릭 시 찍힘)
    turnNumberRef.current += 1;
    turnStartLoggedRef.current = false;
    cardShownAtRef.current = null;
    pendingQuizRef.current = null;

    advanceTurn();
  };

  /* ── winner 사운드/컨페티 ── */

  useEffect(() => {
    if (!winner || winnerSoundPlayedRef.current) return;
    winnerSoundPlayedRef.current = true;
    sound.playWinner();
    sound.stopBgm();
  }, [winner]);

  useEffect(() => {
    if (!winner || !canvasRef.current) return;
    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });
    const interval = setInterval(() => {
      myConfetti({
        particleCount: 80,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() * 0.3 + 0.1 },
        gravity: 0.8,
        scalar: 1.2,
        ticks: 60,
        decay: 0.92,
        shapes: ["circle"],
      });
    }, 400);
    return () => clearInterval(interval);
  }, [winner]);

  const restartGame = () => {
    setWinner(null);
    winnerSoundPlayedRef.current = false;
    setActiveIndex(0);
    setWrongAnswers([]);
    usedIdsRef.current = new Set();
    poolRef.current.loaded = false;
    turnNumberRef.current = 0;
    turnStartLoggedRef.current = false;
    cardShownAtRef.current = null;
    pendingQuizRef.current = null;
    setTurnDeck(Array(targetCount).fill(null));
    setRevealed(Array(targetCount).fill(false));
    setRefreshKey((prev) => prev + 1);
  };

  /* ── winner 화면 ── */

  if (winner) {
    return (
      <>
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed top-0 left-0 z-[2000000] h-screen w-screen"
        />
        <div className="fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-black text-center text-white">
          <div className="mb-2 text-3xl font-bold">🎉 게임 종료 🎉</div>
          <div className="mb-3 text-xl">{winner}</div>
          {teamImageUrl && (
            <img
              src={teamImageUrl}
              alt="result"
              className="mb-6 max-h-[80vh] w-[min(1100px,96vw)] rounded-2xl object-cover shadow-2xl"
            />
          )}
          ㄴ
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200"
            >
              다시 시작
            </button>
            <button
              onClick={restartGame}
              className="rounded-xl bg-gray-700 px-6 py-3 font-bold text-white hover:bg-gray-600"
            >
              점수만 초기화
            </button>
            <button
              onClick={() => {
                if (!wrongAnswers.length) {
                  toast("오답이 없어요 🎉", {});
                  return;
                }
                navigate("/wrong-review", {
                  state: { wrongAnswers, categoryTitle, selectedLevel, accent },
                });
              }}
              className="rounded-xl px-6 py-3 font-bold text-white hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              오답 확인하기
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── 이미지 업로드 ── */

  const uploadTeamImageIfNeeded = async (): Promise<string | null> => {
    if (!teamImageFile) return teamImagePreview;
    // 업로드 실패해도 로컬 미리보기로 진행
    return teamImagePreview;
  };

  /* ── 게임 시작 ── */

  const minRequired = 2;
  const canStartBase = draftSelectedIds.length >= minRequired;
  const canStart = canStartBase && !!(teamImageFile || teamImagePreview);

  const startGame = async () => {
    const picked = savedPlayers.filter((p) => draftSelectedIds.includes(p.id));
    if (picked.length < minRequired) return;

    sound.unlock();
    sound.startBgm();

    setWrongAnswers([]);
    usedIdsRef.current = new Set();
    poolRef.current.loaded = false;
    turnNumberRef.current = 0;
    turnStartLoggedRef.current = false;
    cardShownAtRef.current = null;
    pendingQuizRef.current = null;

    setTurnDeck(Array(targetCount).fill(null));
    setRevealed(Array(targetCount).fill(false));

    if (!teamImageFile && !teamImagePreview) {
      toast("협동 모드는 사진을 1장 등록해야 시작할 수 있어요.");
      return;
    }

    const url = await uploadTeamImageIfNeeded();
    setTeamImageUrl(url ?? teamImagePreview);

    const mappedPlayers = picked.map((p) => ({
      id: p.id,
      name: p.nickname,
      level: p.level,
    }));

    setPlayers(mappedPlayers);
    setActiveIndex(0);
    setWinner(null);
    winnerSoundPlayedRef.current = false;
    setGameStarted(true);
    setShowPlayerModal(false);
    setRefreshKey((prev) => prev + 1);

    // game_start (turn 0)
    logGameEvent({
      turnNumber: 0,
      eventType: "game_start",
      category: categoryTitle,
      level: selectedLevel,
      eventAt: nowISO(),
      metadata: {
        playerCount: picked.length,
        cardCount: targetCount,
        players: picked.map((p) => ({
          id: p.id,
          name: p.nickname,
          level: p.level,
        })),
      },
    });

    // 첫 번째 턴 준비 (turn_start는 첫 카드 클릭 시 찍힘)
    turnNumberRef.current = 1;
    turnStartLoggedRef.current = false;
  };

  const goBackToGameSelect = () => {
    setShowExitConfirm(true);
  };

  /* ── 렌더링 ── */

  return (
    <div
      ref={gridWrapRef}
      className="relative mx-auto w-full max-w-[1500px] px-4 pb-8"
    >
      {!gameStarted && (
        <div className="p-10 text-center text-xl font-black text-gray-600">
          플레이어를 선택하고 시작하세요 🙂
        </div>
      )}

      {gameStarted && loading && (
        <div className="p-10 text-center text-xl font-bold text-gray-500">
          카드를 준비하고 있어요… 🎲
        </div>
      )}

      <div style={{ opacity: gameStarted && gridReady && !loading ? 1 : 0 }}>
        {gameStarted && parsedTurnDeck.every((s) => s === null) ? (
          <div className="rounded-2xl bg-white/60 p-8 text-center font-bold text-gray-500">
            문제를 불러오지 못했어요.
            <br />
            카테고리/난이도 데이터를 확인해줘!
          </div>
        ) : (
          <div
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gap: 0 }}
          >
            {parsedTurnDeck.map((quiz, index) => {
              if (revealed[index]) {
                const col = index % GRID_COLS;
                const row = Math.floor(index / GRID_COLS);
                const x = (col / Math.max(1, GRID_COLS - 1)) * 100;
                const y = (row / Math.max(1, gridRows - 1)) * 100;
                return (
                  <div
                    key={`piece-${index}`}
                    style={{
                      height: cardH,
                      backgroundImage: teamImageUrl
                        ? `url(${teamImageUrl})`
                        : "none",
                      backgroundSize: teamImageUrl
                        ? `${GRID_COLS * 100}% ${gridRows * 100}%`
                        : undefined,
                      backgroundPosition: teamImageUrl
                        ? `${x}% ${y}%`
                        : undefined,
                      backgroundColor: "transparent",
                    }}
                  />
                );
              }

              if (!quiz) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{ height: cardH, padding: "6px" }}
                  >
                    <div className="h-full w-full rounded-2xl bg-white/30 ring-1 ring-white/40" />
                  </div>
                );
              }

              return (
                <div
                  key={`${quiz.id}-${index}`}
                  style={{ height: cardH, padding: "6px" }}
                >
                  <FlipCard3D
                    quiz={quiz}
                    index={index}
                    onCardShown={handleCardShown}
                    onAnswer={handleAnswer}
                    onCorrect={(idx, opt) => handleTurnEnd(idx, true, opt)}
                    onWrong={(idx, opt) => handleTurnEnd(idx, false, opt)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {gameStarted && (
        <div className="fixed top-[76px] left-6 z-[9998] flex flex-row items-center gap-3 select-none">
          {" "}
          {players.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-center rounded-full px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
                activeIndex === idx
                  ? "scale-110 border-3 border-white bg-yellow-400/90 ring-4 ring-yellow-300/50"
                  : "bg-sky-300/80 opacity-70"
              }`}
            >
              <div
                className={`font-black text-white ${activeIndex === idx ? "text-2xl" : "text-lg"}`}
              >
                {player.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {showPlayerModal && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-[390px] rounded-2xl bg-white p-5 shadow-2xl">
            <button
              onClick={goBackToGameSelect}
              className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-xl border bg-white text-xl font-black text-gray-700 hover:bg-gray-50 active:scale-95"
              aria-label="게임 선택으로"
              title="게임 선택으로"
              type="button"
            >
              ×
            </button>

            {showExitConfirm && (
              <div className="absolute inset-0 z-[9999] flex items-start justify-center rounded-2xl bg-black/40 pt-[25%]">
                <div className="rounded-2xl border bg-white px-6 py-5 shadow-2xl">
                  <p className="mb-4 text-center text-sm font-black text-gray-800">
                    홈 화면으로 돌아가시겠습니까?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 rounded-xl bg-gray-200 py-2 text-sm font-bold text-gray-700 hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        sound.stopBgm();
                        window.location.href = "/";
                      }}
                      className="flex-1 rounded-xl py-2 text-sm font-black text-white"
                      style={{ backgroundColor: accent }}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h2 className="mb-1 text-center text-lg font-black">
              플레이어 선택
            </h2>
            <p className="mb-4 text-center text-xs font-bold text-gray-500">
              협동 모드는 2명 이상 + 사진 1장 등록 + 카드 수 선택 후 시작
            </p>

            <div className="mb-3 rounded-2xl border p-3">
              <div className="mb-2 text-sm font-black text-gray-800">
                카드 수(퍼즐 조각 수)
              </div>
              <div className="flex gap-2">
                {[6, 12, 18].map((n) => {
                  const selected = teamCardCount === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTeamCardCount(n)}
                      className="flex-1 rounded-xl border px-3 py-2 text-sm font-black transition active:scale-95"
                      style={{
                        backgroundColor: selected ? accent : "white",
                        borderColor: selected ? accent : "#E5E7EB",
                        color: selected ? "white" : "#111827",
                      }}
                    >
                      {n}장
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs font-bold text-gray-500">
                (5열 고정이라 5/10/15가 퍼즐이 가장 예쁘게 맞아요)
              </div>
            </div>

            <div className="mb-4 rounded-2xl border p-3">
              <div className="mb-2 text-sm font-black text-gray-800">
                협동 사진 등록
              </div>
              {teamImagePreview ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={teamImagePreview}
                    alt="preview"
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTeamImageFile(null);
                      setTeamImagePreview(null);
                      setTeamImageUrl(null);
                    }}
                    className="absolute top-2 right-2 rounded-lg px-2 py-1 text-xs font-black text-white hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    제거
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center">
                  <div className="text-sm font-black text-gray-700">
                    사진 1장 업로드
                  </div>
                  <div className="mt-1 text-xs font-bold text-gray-500">
                    정답 맞히면 카드가 사라지고 사진 조각이 열려요
                  </div>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setTeamImageFile(file);
                      setTeamImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>

            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {savedPlayers.map((p) => {
                const picked = draftSelectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setDraftSelectedIds((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((x) => x !== p.id)
                          : [...prev, p.id],
                      );
                    }}
                    className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition"
                    style={{
                      backgroundColor: picked ? accent : "white",
                      borderColor: picked ? accent : "#E5E7EB",
                      color: picked ? "white" : "#111827",
                    }}
                  >
                    <span className="font-bold">{p.nickname}</span>
                    <span
                      className="text-sm font-black"
                      style={{
                        color: picked ? "rgba(255,255,255,0.85)" : "#6B7280",
                      }}
                    >
                      {p.level}
                    </span>
                  </button>
                );
              })}
              {savedPlayers.length === 0 && (
                <div className="py-6 text-center text-sm font-bold text-gray-400">
                  저장된 플레이어가 없습니다.
                  <br />
                  먼저 "플레이어 관리"에서 추가해줘!
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDraftSelectedIds([])}
                className="flex-1 rounded-xl bg-gray-200 py-2 font-bold text-gray-700 hover:bg-gray-300"
              >
                초기화
              </button>
              <button
                onClick={startGame}
                disabled={!canStart}
                className="flex-1 rounded-xl py-2 font-black text-white disabled:opacity-40"
                style={{ backgroundColor: accent }}
              >
                시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
