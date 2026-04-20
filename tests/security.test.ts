import { describe, it, expect, vi } from 'vitest';
import { validateEnvironment, SECURITY_CONFIG } from '../client/src/utils/security';

describe('PulseStadium Security Utilities', () => {
  it('should have a strict CSP configuration', () => {
    expect(SECURITY_CONFIG.CSP['default-src']).toContain("'self'");
    expect(SECURITY_CONFIG.CSP['object-src']).toContain("'none'");
  });

  it('should detect sensitive environment variable leaks', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Simulate a leak
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'leaked-key';
    
    validateEnvironment();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('SECURITY ALERT: Sensitive key GOOGLE_MAPS_API_KEY is exposed')
    );
    
    consoleSpy.mockRestore();
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  it('should pass silently if no leaks are detected', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    validateEnvironment();
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
