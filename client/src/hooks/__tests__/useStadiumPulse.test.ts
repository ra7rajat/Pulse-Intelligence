import { renderHook, act } from '@testing-library/react';
import { useStadiumPulse } from '../useStadiumPulse';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStadiumPulse Hook', () => {
  it('should initialize correctly targeting strict Firebase schemas', () => {
    const { result } = renderHook(() => useStadiumPulse());
    
    expect(result.current.zones.length).toBe(0);
    expect(result.current.isDemo).toBe(false);
  });

  it('should simulate staff movement over time', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStadiumPulse());
    
    const initialPos = result.current.staff[0].coordinates.lat;
    
    // Fast-forward 4 seconds (interval is 3s)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    expect(result.current.staff[0].coordinates.lat).not.toBe(initialPos);
    vi.useRealTimers();
  });

  it('should handle playbook generation', async () => {
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          prediction: "Spiking",
          simulations: "Simulated",
          playbook: "Phase 1"
        }
      })
    });

    const { result } = renderHook(() => useStadiumPulse());
    
    await act(async () => {
      await result.current.generatePlaybook();
    });
    
    expect(result.current.playbook).not.toBeNull();
    expect(result.current.playbook?.prediction).toBe("Spiking");
  });
});
