const isValidCivilDate = (year: number, month: number, day: number): boolean => {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};

export const isDateString = (val: string): boolean => {
  const s = val.trim();
  // 1. Formato ISO: YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss...
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?.*)?$/.exec(s);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    return isValidCivilDate(year, month, day);
  }

  // 2. Formato civil: DD/MM/YYYY
  const civilMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (civilMatch) {
    const day = parseInt(civilMatch[1], 10);
    const month = parseInt(civilMatch[2], 10);
    const year = parseInt(civilMatch[3], 10);
    return isValidCivilDate(year, month, day);
  }

  return false;
};
