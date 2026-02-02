const getEnv = (key: string, fallback?: string): string => {
  if (typeof window !== "undefined" && (window as any).env?.[key]) {
    return (window as any).env[key];
  }
  return fallback || "";
};

const rawUrl = getEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

// Safety: Remove trailing slash
export const API_URL = rawUrl.replace(/\/$/, "");