import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock HTMLCanvasElement for chart.js
HTMLCanvasElement.prototype.getContext = vi.fn(function() {
  const canvas = this;
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    resetTransform: vi.fn(),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    canvas: canvas,
  };
  return context;
});

// Mock canvas dimensions
Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', {
  get: () => 500,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', {
  get: () => 300,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  get: () => 500,
  set: vi.fn(),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  get: () => 300,
  set: vi.fn(),
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock canvas getComputedStyle for chart.js
const originalGetComputedStyle = global.getComputedStyle;
global.getComputedStyle = (element) => {
  if (!element || !element.ownerDocument) {
    return {
      getPropertyValue: () => '',
      font: '10px sans-serif',
      width: '500px',
      height: '300px',
      display: 'block',
    };
  }
  return originalGetComputedStyle(element);
};

// Suppress console warnings during tests (optional)
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
