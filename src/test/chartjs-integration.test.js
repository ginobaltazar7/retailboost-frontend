import { describe, it, expect } from 'vitest';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

describe('Chart.js Integration', () => {
  it('should import Chart.js successfully', () => {
    expect(ChartJS).toBeDefined();
    expect(typeof ChartJS).toBe('function');
  });

  it('should have all required Chart.js components accessible', () => {
    expect(CategoryScale).toBeDefined();
    expect(LinearScale).toBeDefined();
    expect(PointElement).toBeDefined();
    expect(LineElement).toBeDefined();
    expect(BarElement).toBeDefined();
    expect(ArcElement).toBeDefined();
    expect(Title).toBeDefined();
    expect(Tooltip).toBeDefined();
    expect(Legend).toBeDefined();
  });

  it('should allow registration of Chart.js components', () => {
    expect(() => {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend
      );
    }).not.toThrow();
  });

  it('should have Chart.js version 4.x installed', () => {
    expect(ChartJS.version).toBeDefined();
    expect(ChartJS.version).toMatch(/^4\./);
  });

  it('should have essential Chart.js methods available', () => {
    expect(typeof ChartJS.register).toBe('function');
    expect(typeof ChartJS.unregister).toBe('function');
    expect(ChartJS.defaults).toBeDefined();
  });

  it('should allow configuration of Chart.js defaults', () => {
    expect(ChartJS.defaults).toBeDefined();
    expect(ChartJS.defaults.font).toBeDefined();
    
    // Test that we can modify defaults without errors
    const originalFamily = ChartJS.defaults.font.family;
    ChartJS.defaults.font.family = 'Arial';
    expect(ChartJS.defaults.font.family).toBe('Arial');
    
    // Restore original
    ChartJS.defaults.font.family = originalFamily;
  });
});
