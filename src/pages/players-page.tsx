import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParticipant } from "@/store/participants";
import { Navigate } from "react-router";

type Level = "low" | "mid" | "high";

type PlayerProfile = {
  id: string;
  participant_id: string;
  nickname: string;
  level: Level;
  created_at: string;
};

export default function PlayersPage() {
  const qc = useQueryClient();
  const participantId = useParticipant((state) => state.participantId);
  const hasHydrated = useParticipant((state) => state._hasHydrated);

  const [nickname, setNickname] = useState("");
  const [level, setLevel] = useState<Level>("low");

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
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNickname("");
      setLevel("low");
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

  if (!hasHydrated) return null;
  if (!participantId) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-2 text-2xl font-bold">플레이어 관리</h1>
      <p className="mb-6 text-sm text-gray-500">참여자 번호: {participantId}</p>

      <div className="mb-6 flex gap-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          className="flex-1 rounded border p-2"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          className="rounded border p-2"
        >
          <option value="low">쉬움</option>
          <option value="mid">보통</option>
          <option value="high">어려움</option>
        </select>
        <button
          onClick={() => addPlayer.mutate()}
          disabled={addPlayer.isPending}
          className="rounded bg-black px-4 text-white disabled:opacity-50"
        >
          {addPlayer.isPending ? "추가중" : "추가"}
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

      <ul className="space-y-2">
        {players?.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded border p-3"
          >
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
