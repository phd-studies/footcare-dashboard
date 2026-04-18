import { useRef, useState } from "react";
import { BentoCard } from "./BentoCard";
import { Camera, Upload, Check, Loader2 } from "lucide-react";
import { uploadWoundPhoto } from "@/services/api";
import { useUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SYMPTOMS = ["Redness", "Swelling", "Pain", "Discharge", "Odor", "Numbness"];

interface Props { onUploaded?: (entry: any) => void }

export function UploadSymptomsCard({ onUploaded }: Props) {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [active, setActive] = useState<string[]>(["Redness"]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const choose = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setDone(false);
  };
  const toggle = (s: string) =>
    setActive((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const submit = async () => {
    if (!file) {
      toast.error("Please select a wound photo first.");
      return;
    }
    if (!user?.id) {
      toast.error("You must be signed in to upload.");
      return;
    }
    setBusy(true);
    try {
      const entry = await uploadWoundPhoto({ file, symptoms: active, userId: user.id });
      setDone(true);
      onUploaded?.(entry);
      toast.success("Check-in saved");
      setFile(null);
      setPreview(null);
      setTimeout(() => setDone(false), 2200);
    } catch (err: any) {
      toast.error("Upload failed", { description: err?.message ?? "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <BentoCard
      title="Today's Check-in"
      subtitle="Upload a wound photo & log symptoms"
      icon={<Camera className="h-5 w-5" />}
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0]; if (f) choose(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors min-h-[180px] flex flex-col items-center justify-center gap-2",
          drag ? "border-primary bg-primary/5" : "border-border bg-secondary/40 hover:bg-secondary",
        )}
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-32 rounded-xl object-cover" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">JPG / PNG, up to 10MB</p>
          </>
        )}
        <input
          ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Symptoms</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const on = active.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={cn(
                  "min-h-[40px] px-4 rounded-full text-sm font-medium transition-all border",
                  on
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-accent",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={busy}
        className="mt-5 w-full min-h-[48px] rounded-2xl bg-primary text-primary-foreground font-semibold transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {done ? (
          <><Check className="h-5 w-5" /> Saved</>
        ) : busy ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Uploading…</>
        ) : (
          "Upload Photo"
        )}
      </button>
    </BentoCard>
  );
}
