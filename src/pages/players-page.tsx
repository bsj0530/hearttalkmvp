import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParticipant } from "@/store/participants";
import { Navigate } from "react-router";

type Level = "low" | "mid" | "high";
type LowMode = "voice" | "text";

type PlayerProfile = {
  id: string;
  participant_id: string;
  nickname: string;
  level: Level;
  low_mode: LowMode | null;
  created_at: string;
};

export default function PlayersPage() {
  const qc = useQueryClient();
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);

  const [nickname, setNickname] = useState("");
  const [level, setLevel] = useState<Level>("low");
  const [lowMode, setLowMode] = useState<LowMode>("voice");

  const {
    data: players,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["players", participantId],
    enabled: hasHydrated && !!participantId,
    queryFn: async () => {
      if (!participantId) throw new Error("참여자 정보가 없습니다.");

      const { data, error } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PlayerProfile[];
    },
  });

  const addPlayer = useMutation({
    mutationFn: async () => {
      const name = nickname.trim();
      if (!name) throw new Error("닉네임을 입력해 주세요.");
      if (!participantId) throw new Error("참여자 정보가 없습니다.");

      const { error } = await supabase.from("player_profiles").insert({
        participant_id: participantId,
        nickname: name,
        level,
        low_mode: level === "low" ? lowMode : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNickname("");
      setLevel("low");
      setLowMode("voice");
      qc.invalidateQueries({ queryKey: ["players", participantId] });
    },
  });

  const deletePlayer = useMutation({
    mutationFn: async (playerId: string) => {
      if (!participantId) throw new Error("참여자 정보가 없습니다.");

      const { error } = await supabase
        .from("player_profiles")
        .delete()
        .eq("id", playerId)
        .eq("participant_id", participantId);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", participantId] });
    },
  });

  const updateLowMode = useMutation({
    mutationFn: async ({
      playerId,
      newMode,
    }: {
      playerId: string;
      newMode: LowMode;
    }) => {
      const { error } = await supabase
        .from("player_profiles")
        .update({ low_mode: newMode })
        .eq("id", playerId);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["players", participantId] });
    },
  });

  if (!hasHydrated) return null;
  if (!participantId) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-2xl font-bold">플레이어 관리</h1>
      <p className="mb-6 text-sm text-gray-500">참여자 번호: {participantId}</p>

      {/* ── 추가 폼 ── */}
      <div className="mb-6 rounded-2xl border p-4">
        <div className="mb-3 flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            className="flex-1 rounded border p-2"
          />
          <select
            value={level}
            onChange={(e) => {
              const lv = e.target.value as Level;
              setLevel(lv);
              if (lv !== "low") setLowMode("voice");
            }}
            className="rounded border p-2"
          >
            <option value="low">쉬움</option>
            <option value="mid">보통</option>
            <option value="high">어려움</option>
          </select>
        </div>

        {/* low 선택 시 모드 선택 */}
        {level === "low" && (
          <div className="mb-3 flex gap-2">
            {[
              { key: "voice" as const, label: "음성" },
              { key: "text" as const, label: "글자" },
            ].map(({ key, label }) => {
              const selected = lowMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLowMode(key)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-black transition active:scale-95 ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => addPlayer.mutate()}
          disabled={addPlayer.isPending}
          className="w-full rounded-xl bg-black py-2 font-bold text-white disabled:opacity-50"
        >
          {addPlayer.isPending ? "추가중..." : "추가"}
        </button>
      </div>

      {addPlayer.isError && (
        <div className="mb-4 text-sm text-red-500">
          {(addPlayer.error as Error).message}
        </div>
      )}

      {deletePlayer.isError && (
        <div className="mb-4 text-sm text-red-500">
          {(deletePlayer.error as Error).message}
        </div>
      )}

      {isLoading && (
        <div className="py-10 text-center text-gray-500">불러오는 중…</div>
      )}

      {isError && (
        <div className="py-10 text-center text-red-500">
          목록을 불러오지 못했습니다.
        </div>
      )}

      {/* ── 플레이어 목록 ── */}
      <ul className="space-y-2">
        {players?.map((p) => (
          <li key={p.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {p.nickname} <span className="text-gray-400">·</span>{" "}
                <span className="text-gray-600">{p.level}</span>
              </span>

              <button
                onClick={() => deletePlayer.mutate(p.id)}
                disabled={deletePlayer.isPending}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                삭제
              </button>
            </div>

            {/* low 플레이어: 모드 전환 */}
            {p.level === "low" && (
              <div className="mt-3 flex gap-2">
                {[
                  { key: "voice" as const, label: "🔊 음성" },
                  { key: "text" as const, label: "📝 글자" },
                ].map(({ key, label }) => {
                  const current = p.low_mode ?? "voice";
                  const selected = current === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        updateLowMode.mutate({ playerId: p.id, newMode: key })
                      }
                      disabled={updateLowMode.isPending}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-black transition active:scale-95 ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        ))}

        {!players?.length && !isLoading && (
          <div className="py-10 text-center text-gray-500">
            아직 추가한 플레이어가 없습니다.
          </div>
        )}
      </ul>
    </div>
  );
}
