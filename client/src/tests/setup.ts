import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocking Google Maps and Three.js for unit testing contexts
vi.stubGlobal('google', {
  maps: {
    Map: vi.fn(),
    LatLng: vi.fn(),
    OverlayView: vi.fn(),
  },
});

vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
  };
});
