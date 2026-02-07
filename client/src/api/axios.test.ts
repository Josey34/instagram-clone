import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import instance from './axios';

describe('axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should have correct base configuration', () => {
    const config = instance.defaults;
    expect(config.baseURL).toBeDefined();
    expect(config.timeout).toBe(10000);
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  it('should store token in localStorage', () => {
    const token = 'test-token-123';
    localStorage.setItem('token', token);
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('should return null when no token exists', () => {
    localStorage.clear();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should remove token from localStorage', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.removeItem('token');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
