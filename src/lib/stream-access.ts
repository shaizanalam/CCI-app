import type { ClassLevel } from "@/hooks/use-session";

export type StudentStream = "pcm" | "pcb" | "commerce";
export type StreamAccess = "all" | "shared_science" | "pcm" | "pcb" | "commerce";

export const STREAM_OPTIONS: { value: StudentStream; label: string }[] = [
  { value: "pcm", label: "PCM" },
  { value: "pcb", label: "PCB" },
  { value: "commerce", label: "Commerce" },
];

export const STREAM_ACCESS_OPTIONS: { value: StreamAccess; label: string; hint: string }[] = [
  { value: "all", label: "All", hint: "Every student in this class (use for Class 9–10)" },
  {
    value: "shared_science",
    label: "Shared Science",
    hint: "Physics & Chemistry shared by PCM and PCB",
  },
  { value: "pcm", label: "PCM Only", hint: "Maths and other PCM-only subjects" },
  { value: "pcb", label: "PCB Only", hint: "Biology and other PCB-only subjects" },
  { value: "commerce", label: "Commerce Only", hint: "Commerce stream subjects" },
];

const STREAM_LABELS: Record<StudentStream, string> = {
  pcm: "PCM",
  pcb: "PCB",
  commerce: "Commerce",
};

export function classNeedsStream(classLevel: ClassLevel | null | undefined): boolean {
  return classLevel === "11" || classLevel === "12";
}

export function defaultStreamAccessForClass(classLevel: ClassLevel): StreamAccess {
  return classLevel === "9" || classLevel === "10" ? "all" : "shared_science";
}

export function streamAccessOptionsForAdminClass(classLevel: ClassLevel) {
  if (classLevel === "9" || classLevel === "10") {
    return STREAM_ACCESS_OPTIONS.filter((o) => o.value === "all");
  }
  return STREAM_ACCESS_OPTIONS;
}

/** Client-side mirror of DB `can_access_subject_stream` for display/tests. RLS is authoritative. */
export function canAccessSubjectStream(
  classLevel: ClassLevel | null | undefined,
  stream: StudentStream | null | undefined,
  streamAccess: StreamAccess,
): boolean {
  if (!classLevel) return false;

  if (classLevel === "9" || classLevel === "10") {
    return streamAccess === "all";
  }

  if (!stream) return false;

  if (stream === "pcm") return streamAccess === "shared_science" || streamAccess === "pcm";
  if (stream === "pcb") return streamAccess === "shared_science" || streamAccess === "pcb";
  if (stream === "commerce") return streamAccess === "commerce";

  return false;
}

export function formatStreamLabel(stream: StudentStream | null | undefined): string {
  if (!stream) return "";
  return STREAM_LABELS[stream];
}

export function formatClassStream(
  classLevel: ClassLevel | null | undefined,
  stream: StudentStream | null | undefined,
): string {
  if (!classLevel) return "—";
  if (!classNeedsStream(classLevel)) return `Class ${classLevel}`;
  const streamLabel = formatStreamLabel(stream);
  return streamLabel ? `Class ${classLevel} • ${streamLabel}` : `Class ${classLevel}`;
}

export function formatStreamAccessLabel(streamAccess: StreamAccess): string {
  return STREAM_ACCESS_OPTIONS.find((o) => o.value === streamAccess)?.label ?? streamAccess;
}
