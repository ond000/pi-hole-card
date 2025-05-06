/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/number/round.ts
 */

export const round = (value: number, precision = 2): number =>
  Math.round(value * 10 ** precision) / 10 ** precision;
