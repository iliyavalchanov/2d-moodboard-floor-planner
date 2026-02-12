"use client";

import { useState, useCallback } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { isImageUrl } from "@/utils/clipboard";

interface Props {
  onClose: () => void;
}

export default function ImageUrlModal({ onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = url.trim();
      if (!trimmed) return;

      setLoading(true);
      setError("");

      const { viewport, stageSize } = useCanvasStore.getState();
      const centerX = (stageSize.width / 2 - viewport.x) / viewport.scale;
      const centerY = (stageSize.height / 2 - viewport.y) / viewport.scale;

      // Direct image URL — add immediately
      if (isImageUrl(trimmed)) {
        useMoodboardStore.getState().addImage(trimmed, centerX, centerY, 200, 200);
        setLoading(false);
        onClose();
        return;
      }

      // Otherwise try to unfurl the page for an OG image
      try {
        const res = await fetch(`/api/unfurl?url=${encodeURIComponent(trimmed)}`);
        const data = await res.json();

        if (!res.ok || !data.imageUrl) {
          setError(data.error || "Could not find an image on that page");
          setLoading(false);
          return;
        }

        const displayTitle = data.title || data.domain || "";
        useMoodboardStore.getState().addImage(data.imageUrl, centerX, centerY, 220, 280, {
          sourceUrl: trimmed,
          title: displayTitle,
          description: data.description || "",
        });
        setLoading(false);
        onClose();
      } catch {
        setError("Failed to fetch page. Check the URL and try again.");
        setLoading(false);
      }
    },
    [url, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Image from URL
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://example.com/image.jpg or product page URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Image"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
