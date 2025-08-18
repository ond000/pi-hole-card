import {
  formatSecondsToHHMMSS,
  formatSecondsToHuman,
  parseTimeToSeconds,
} from '@common/convert-time';
import { expect } from 'chai';
import * as sinon from 'sinon';

// Mock the localize function
const mockLocalize = sinon.stub();
mockLocalize.withArgs(sinon.match.any, 'card.units.seconds').returns('seconds');
mockLocalize.withArgs(sinon.match.any, 'card.units.second').returns('second');
mockLocalize.withArgs(sinon.match.any, 'card.units.minutes').returns('minutes');
mockLocalize.withArgs(sinon.match.any, 'card.units.minute').returns('minute');
mockLocalize.withArgs(sinon.match.any, 'card.units.hours').returns('hours');
mockLocalize.withArgs(sinon.match.any, 'card.units.hour').returns('hour');

// Mock the localize module
sinon.stub(require('@localize/localize'), 'localize').callsFake(mockLocalize);

// Mock hass object
const mockHass = {
  language: 'en',
} as any;

describe('convert-time.ts', () => {
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

  describe('parseTimeToSeconds', () => {
    it('should parse numbers directly', () => {
      expect(parseTimeToSeconds(60)).to.equal(60);
      expect(parseTimeToSeconds(300)).to.equal(300);
      expect(parseTimeToSeconds(0)).to.equal(0);
    });

    it('should parse number strings', () => {
      expect(parseTimeToSeconds('60')).to.equal(60);
      expect(parseTimeToSeconds('300')).to.equal(300);
      expect(parseTimeToSeconds('0')).to.equal(0);
    });

    it('should parse simple time units', () => {
      expect(parseTimeToSeconds('10s')).to.equal(10);
      expect(parseTimeToSeconds('5m')).to.equal(300);
      expect(parseTimeToSeconds('1h')).to.equal(3600);
      expect(parseTimeToSeconds('2h')).to.equal(7200);
    });

    it('should parse complex time format', () => {
      expect(parseTimeToSeconds('1h:30m:45s')).to.equal(5445); // 3600 + 1800 + 45
      expect(parseTimeToSeconds('4h:20m:69s')).to.equal(15669); // 14400 + 1200 + 69
      expect(parseTimeToSeconds('2h:0m:30s')).to.equal(7230); // 7200 + 0 + 30
      expect(parseTimeToSeconds('0h:5m:0s')).to.equal(300); // 0 + 300 + 0
    });

    it('should handle edge cases and invalid input', () => {
      expect(parseTimeToSeconds('')).to.equal(0);
      expect(parseTimeToSeconds('invalid')).to.equal(0);
      expect(parseTimeToSeconds('10x')).to.equal(0); // invalid unit
    });

    it('should handle whitespace', () => {
      expect(parseTimeToSeconds(' 60 ')).to.equal(60);
      expect(parseTimeToSeconds(' 5m ')).to.equal(300);
    });
  });

  describe('formatSecondsToHuman', () => {
    it('should format zero seconds', () => {
      expect(formatSecondsToHuman(0, mockHass)).to.equal('0 seconds');
    });

    it('should format single units', () => {
      expect(formatSecondsToHuman(1, mockHass)).to.equal('1 second');
      expect(formatSecondsToHuman(5, mockHass)).to.equal('5 seconds');
      expect(formatSecondsToHuman(60, mockHass)).to.equal('1 minute');
      expect(formatSecondsToHuman(120, mockHass)).to.equal('2 minutes');
      expect(formatSecondsToHuman(3600, mockHass)).to.equal('1 hour');
      expect(formatSecondsToHuman(7200, mockHass)).to.equal('2 hours');
    });

    it('should prefer larger units when they divide evenly', () => {
      expect(formatSecondsToHuman(300, mockHass)).to.equal('5 minutes'); // not "300 seconds"
      expect(formatSecondsToHuman(1800, mockHass)).to.equal('30 minutes'); // not "1800 seconds"
      expect(formatSecondsToHuman(10800, mockHass)).to.equal('3 hours'); // not "180 minutes"
    });

    it('should use seconds for non-divisible values', () => {
      expect(formatSecondsToHuman(90, mockHass)).to.equal('90 seconds'); // 1.5 minutes
      expect(formatSecondsToHuman(150, mockHass)).to.equal('150 seconds'); // 2.5 minutes
      expect(formatSecondsToHuman(4500, mockHass)).to.equal('4500 seconds'); // 1.25 hours
    });
  });
});
