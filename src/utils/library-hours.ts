/** Hora límite para préstamos/reservas en sala (19:00 local del navegador). */
export const LIBRARY_CLOSING_HOUR = 19;

export function isAfterLibraryClosing(date: Date = new Date()): boolean {
  return date.getHours() >= LIBRARY_CLOSING_HOUR;
}

export function canSelectLibraryLoan(date: Date = new Date()): boolean {
  return !isAfterLibraryClosing(date);
}

export function libraryClosingMessage(): string {
  return 'Los préstamos en sala solo pueden reservarse antes de las 7:00 PM.';
}
