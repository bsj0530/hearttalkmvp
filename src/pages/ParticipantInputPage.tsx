import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useParticipant } from "@/store/participants";

const SYSTEM_FONT =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function ParticipantInputPage() {
  const [participantIdInput, setParticipantIdInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const initParticipant = useParticipant((state) => state.initParticipant);

  const inputStyles =
    "text-[#000000] rounded-full border-2 border-black bg-white px-6 py-6 text-left placeholder:text-gray-400 focus:border-[#ffbd59] focus-visible:border-[#ffbd59] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-colors";

  const normalize = (raw: string) =>
    raw
      .trim()
      .replace(/^["“”]+|["“”]+$/g, "")
      .toUpperCase();

  const handleSubmit = async () => {
    const clean = normalize(participantIdInput);

    if (clean === "") {
      toast.error("참여자 번호를 입력해주세요.", { position: "top-center" });
      inputRef.current?.focus();
      return;
    }

    if (!/^(A[1-5]|B[1-5])$/.test(clean)) {
      toast.error("참여자 번호는 A1~A5 또는 B1~B5로 입력해주세요.", {
        position: "top-center",
      });
      inputRef.current?.focus();
      return;
    }

    try {
      await initParticipant(clean);
      toast.success("참여자 정보가 등록되었습니다.", {
        position: "top-center",
      });
      navigate("/");
    } catch (error) {
      console.error("initParticipant failed:", error);
      toast.error("저장에 실패했습니다.", { position: "top-center" });
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-3">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="text-left">
          <h1 className="text-5xl font-bold text-slate-900">참여자 입력</h1>
          <p className="mt-2 text-sm text-slate-500">
            참여자 번호를 입력해주세요
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={participantIdInput}
            onChange={(e) => setParticipantIdInput(e.target.value)}
            className={inputStyles}
            type="text"
            placeholder="예: A1 / B1"
            autoComplete="off"
            style={{ fontFamily: SYSTEM_FONT }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit();
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => void handleSubmit()}
            className="rounded-full bg-[#fe4081] px-8 py-6 text-base font-bold text-white hover:bg-[#e0356e]"
          >
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
