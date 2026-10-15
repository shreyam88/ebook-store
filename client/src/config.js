const rawUrl =
  import.meta.env.VITE_API_URL || "https://ebook-store-cmdx.vercel.app";

export const API_URL = rawUrl.replace(/\/+$/, "");