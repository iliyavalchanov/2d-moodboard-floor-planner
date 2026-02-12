"use client";

import { useProjectStore } from "@/stores/useProjectStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  onSaveClick: () => void;
}

export default function SaveIndicator({ onSaveClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const currentProject = useProjectStore((s) => s.currentProject);
  const saving = useProjectStore((s) => s.saving);
  const hasUnsavedChanges = useProjectStore((s) => s.hasUnsavedChanges);

  if (!user || !currentProject) return null;

  let label: string;
  let color: string;

  if (saving) {
    label = "Saving...";
    color = "text-yellow-600";
  } else if (hasUnsavedChanges) {
    label = "Unsaved changes";
    color = "text-orange-500";
  } else {
    label = "Saved";
    color = "text-green-600";
  }

  return (
    <button
      onClick={onSaveClick}
      className={`text-xs ${color} hover:underline`}
      title={saving ? "Saving..." : "Click to save"}
      disabled={saving}
    >
      {label}
    </button>
  );
}
