import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwind-klassen samenvoegen waarbij de laatste wint. Nodig voor componenten
 *  uit de shadcn-registry, die hier allemaal op leunen. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
