import { formatSecondsToHHMMSS } from '@common/convert-time';
import { expect } from 'chai';

export default () => {
  describe('format-seconds.ts', () => {
    describe('formatSecondsToHHMMSS', () => {
      it('should format various time durations correctly', () => {
        // Test cases with various input seconds and expected outputs
        const testCases = [
          { seconds: 0, expected: '00:00:00' }, // Zero
          { seconds: 1, expected: '00:00:01' }, // Single second
          { seconds: 60, expected: '00:01:00' }, // One minute
          { seconds: 3600, expected: '01:00:00' }, // One hour
          { seconds: 3661, expected: '01:01:01' }, // One hour, one minute, one second
          { seconds: 86399, expected: '23:59:59' }, // Almost a day (23h 59m 59s)
          { seconds: 100000, expected: '27:46:40' }, // More than a day
          { seconds: 3723, expected: '01:02:03' }, // 1h 2m 3s
        ];

        // Verify all test cases
        testCases.forEach(({ seconds, expected }) => {
          const result = formatSecondsToHHMMSS(seconds);
          expect(result).to.equal(expected);
        });
      });
    });
  });
};
