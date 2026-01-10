import { describe, it, expect } from 'vitest';
import {
  classifyVideo,
  getLengthDescription,
  LONGFORM_THRESHOLD_SECONDS,
  type LengthCategory
} from '~/server/prompts/taxonomy';

describe('classifyVideo', () => {
  describe('standard videos (< 30 minutes)', () => {
    it('classifies short videos as standard', () => {
      const result = classifyVideo('PT5M30S');
      expect(result.length).toBe('standard');
    });

    it('classifies 10-minute videos as standard', () => {
      const result = classifyVideo('PT10M0S');
      expect(result.length).toBe('standard');
    });

    it('classifies 29:59 as standard (just under threshold)', () => {
      const result = classifyVideo('PT29M59S');
      expect(result.length).toBe('standard');
    });

    it('classifies videos with hours under threshold as standard', () => {
      // PT0H25M0S = 25 minutes
      const result = classifyVideo('PT0H25M0S');
      expect(result.length).toBe('standard');
    });
  });

  describe('longform videos (>= 30 minutes)', () => {
    it('classifies exactly 30 minutes as longform', () => {
      const result = classifyVideo('PT30M0S');
      expect(result.length).toBe('longform');
    });

    it('classifies 30:01 as longform (just over threshold)', () => {
      const result = classifyVideo('PT30M1S');
      expect(result.length).toBe('longform');
    });

    it('classifies 45-minute videos as longform', () => {
      const result = classifyVideo('PT45M0S');
      expect(result.length).toBe('longform');
    });

    it('classifies 1-hour videos as longform', () => {
      const result = classifyVideo('PT1H0M0S');
      expect(result.length).toBe('longform');
    });

    it('classifies multi-hour videos as longform', () => {
      const result = classifyVideo('PT2H30M0S');
      expect(result.length).toBe('longform');
    });

    it('classifies videos with days as longform', () => {
      const result = classifyVideo('P1DT0H0M0S');
      expect(result.length).toBe('longform');
    });
  });

  describe('edge cases', () => {
    it('classifies empty duration as standard', () => {
      const result = classifyVideo('');
      expect(result.length).toBe('standard');
    });

    it('classifies invalid duration as standard', () => {
      const result = classifyVideo('invalid');
      expect(result.length).toBe('standard');
    });

    it('classifies PT0S (0 seconds) as standard', () => {
      const result = classifyVideo('PT0S');
      expect(result.length).toBe('standard');
    });
  });
});

describe('LONGFORM_THRESHOLD_SECONDS', () => {
  it('equals 30 minutes in seconds', () => {
    expect(LONGFORM_THRESHOLD_SECONDS).toBe(30 * 60);
    expect(LONGFORM_THRESHOLD_SECONDS).toBe(1800);
  });
});

describe('getLengthDescription', () => {
  it('describes longform category', () => {
    expect(getLengthDescription('longform')).toBe('Long-form video (30+ minutes)');
  });

  it('describes standard category', () => {
    expect(getLengthDescription('standard')).toBe('Standard video (under 30 minutes)');
  });
});
