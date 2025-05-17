/**
 * Converts a number of seconds into a string formatted as "HH:MM:SS".
 *
 * @param totalSeconds - The total number of seconds to convert.
 * @returns A string representing the time in "HH:MM:SS" format, with each unit zero-padded to two digits.
 *
 * @example
 * ```typescript
 * formatSecondsToHHMMSS(3661); // Returns "01:01:01"
 * ```
 */
export const formatSecondsToHHMMSS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};
