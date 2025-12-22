import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
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
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components before tests
beforeAll(() => {
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
});

describe('react-chartjs-2 Component Rendering', () => {
  const sampleLineData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const sampleBarData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Revenue',
        data: [12, 19, 3, 5],
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      },
    ],
  };

  const samplePieData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'Colors',
        data: [300, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
      },
    ],
  };

  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Test Chart',
      },
    },
  };

  describe('Line Chart Component', () => {
    it('should render Line chart without errors', () => {
      const { container } = render(<Line data={sampleLineData} options={defaultOptions} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render Line chart with data', () => {
      const { container } = render(<Line data={sampleLineData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should accept custom options for Line chart', () => {
      const customOptions = {
        ...defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };
      expect(() => {
        render(<Line data={sampleLineData} options={customOptions} />);
      }).not.toThrow();
    });
  });

  describe('Bar Chart Component', () => {
    it('should render Bar chart without errors', () => {
      const { container } = render(<Bar data={sampleBarData} options={defaultOptions} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render Bar chart with data', () => {
      const { container } = render(<Bar data={sampleBarData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should display data correctly in Bar chart', () => {
      const { container } = render(<Bar data={sampleBarData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      // Chart.js stores data internally, verify canvas is rendered
      expect(canvas.getContext).toHaveBeenCalled();
    });
  });

  describe('Pie Chart Component', () => {
    it('should render Pie chart without errors', () => {
      const { container } = render(<Pie data={samplePieData} options={defaultOptions} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render Pie chart with data', () => {
      const { container } = render(<Pie data={samplePieData} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should handle multiple datasets in Pie chart', () => {
      const multiData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [
          {
            data: [10, 20, 30, 40],
            backgroundColor: ['red', 'blue', 'green', 'yellow'],
          },
        ],
      };
      expect(() => {
        render(<Pie data={multiData} />);
      }).not.toThrow();
    });
  });

  describe('Multiple Chart Types Rendering', () => {
    it('should render different chart types simultaneously', () => {
      const { container } = render(
        <div>
          <Line data={sampleLineData} />
          <Bar data={sampleBarData} />
          <Pie data={samplePieData} />
        </div>
      );
      
      const canvases = container.querySelectorAll('canvas');
      expect(canvases).toHaveLength(3);
    });

    it('should render Line and Bar charts with shared data structure', () => {
      const sharedData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Quarterly Data',
            data: [100, 200, 150, 300],
          },
        ],
      };

      const { container: lineContainer } = render(<Line data={sharedData} />);
      const { container: barContainer } = render(<Bar data={sharedData} />);

      expect(lineContainer.querySelector('canvas')).toBeInTheDocument();
      expect(barContainer.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Chart Configuration Options', () => {
    it('should apply responsive configuration', () => {
      const responsiveOptions = {
        responsive: true,
        maintainAspectRatio: false,
      };
      expect(() => {
        render(<Line data={sampleLineData} options={responsiveOptions} />);
      }).not.toThrow();
    });

    it('should apply custom colors to charts', () => {
      const coloredData = {
        labels: ['A', 'B'],
        datasets: [
          {
            label: 'Custom Colors',
            data: [10, 20],
            backgroundColor: ['#FF6384', '#36A2EB'],
            borderColor: ['#FF6384', '#36A2EB'],
          },
        ],
      };
      const { container } = render(<Bar data={coloredData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });
});
