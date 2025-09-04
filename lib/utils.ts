import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserIdFromLocalStorage(): string | null {
  try {
    const item = localStorage.getItem("userId");

    if (!item) return null;

    return String(item);
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
}
