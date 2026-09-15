const AI_MARKERS = [
  "ai-generated",
  "aigenerated",
  "artificial intelligence",
  "generative",
  "midjourney",
  "dall-e",
  "stable diffusion",
  "firefly",
  "chatgpt",
  "openai",
  "runway",
  "leonardo.ai",
];

export function hasAiGeneratedMarker(data: Record<string, unknown>): boolean {
  return Object.entries(data).some(([key, value]) => {
    const text = `${key} ${String(value)}`.toLowerCase();
    return AI_MARKERS.some((marker) => text.includes(marker));
  });
}