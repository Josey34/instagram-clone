import { describe, expect, it } from 'vitest';
import { getTimeAgo } from './utils';

describe('getTimeAgo Function', () => {
  it('should return seconds when less than 60 seconds have passed', () => {
    // ARRANGE
    const fiveMinutesAgo = new Date(Date.now() - 30 * 1000);
    const isoString = fiveMinutesAgo.toISOString();
    
    // ACT
    const result = getTimeAgo(isoString);
    
    // ASSERT
    expect(result).toBe('30s');
  });
  
  it('should return minutes when less than 60 minutes have passed', () => {
    // ARRANGE
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isoString = fiveMinutesAgo.toISOString();
    
    // ACT
    const result = getTimeAgo(isoString);
    
    // ASSERT
    expect(result).toBe('5m');
  });
  
  it('should return hours when less than 24 hours have passed', () => {
    // ARRANGE
    const fiveMinutesAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const isoString = fiveMinutesAgo.toISOString();
    
    // ACT
    const result = getTimeAgo(isoString);
    
    // ASSERT
    expect(result).toBe('3h');
  });
  
  it('should return 1m when 60 seconds have passed', () => {
    // ARRANGE
    const fiveMinutesAgo = new Date(Date.now() - 60 * 1000);
    const isoString = fiveMinutesAgo.toISOString();
    
    // ACT
    const result = getTimeAgo(isoString);
    
    // ASSERT
    expect(result).toBe('1m');
  });
  
  it('should return 1h when 60 minutes have passed', () => {
    // ARRANGE
    const fiveMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isoString = fiveMinutesAgo.toISOString();
    
    // ACT
    const result = getTimeAgo(isoString);
    
    // ASSERT
    expect(result).toBe('1h');
  });
});
