import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
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
import { Line, Bar } from 'react-chartjs-2';
import React, { useState } from 'react';

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

// Clean up after each test
afterEach(() => {
  cleanup();
});

describe('Chart Data Updates', () => {
  describe('Line Chart Data Updates', () => {
    it('should update Line chart when data prop changes', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Line data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const initialData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Initial',
            data: [10, 20, 30],
            borderColor: 'rgb(75, 192, 192)',
          },
        ],
      };

      const updatedData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Updated',
            data: [40, 50, 60],
            borderColor: 'rgb(255, 99, 132)',
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={initialData} />);
      
      // Initial render
      let canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();

      // Update data
      rerender(<ChartWrapper data={updatedData} />);
      
      // Chart should still be present after update
      canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should handle adding new data points', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Line data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const initialData = {
        labels: ['Jan', 'Feb'],
        datasets: [
          {
            label: 'Sales',
            data: [100, 200],
          },
        ],
      };

      const expandedData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Sales',
            data: [100, 200, 300, 400],
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={initialData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Add more data points
      rerender(<ChartWrapper data={expandedData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle removing data points', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Line data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const initialData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Revenue',
            data: [1000, 2000, 3000, 4000],
          },
        ],
      };

      const reducedData = {
        labels: ['Q1', 'Q2'],
        datasets: [
          {
            label: 'Revenue',
            data: [1000, 2000],
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={initialData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Remove data points
      rerender(<ChartWrapper data={reducedData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Bar Chart Data Updates', () => {
    it('should update Bar chart when data prop changes', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Bar data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const initialData = {
        labels: ['Product 1', 'Product 2'],
        datasets: [
          {
            label: 'Initial Sales',
            data: [50, 100],
            backgroundColor: 'rgba(53, 162, 235, 0.7)',
          },
        ],
      };

      const updatedData = {
        labels: ['Product 1', 'Product 2'],
        datasets: [
          {
            label: 'Updated Sales',
            data: [150, 200],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={initialData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Update data
      rerender(<ChartWrapper data={updatedData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should handle multiple dataset updates', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Bar data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const initialData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [10, 20, 30],
          },
        ],
      };

      const multiDatasetData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [10, 20, 30],
          },
          {
            label: 'Dataset 2',
            data: [15, 25, 35],
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={initialData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Add another dataset
      rerender(<ChartWrapper data={multiDatasetData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Chart Options Updates', () => {
    it('should update when options prop changes', () => {
      const ChartWrapper = ({ options }) => {
        const chartData = {
          labels: ['A', 'B', 'C'],
          datasets: [
            {
              label: 'Data',
              data: [10, 20, 30],
            },
          ],
        };
        return (
          <div style={{ width: '500px', height: '300px' }}>
            <Line data={chartData} options={options} />
          </div>
        );
      };

      const initialOptions = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Initial Title',
          },
        },
      };

      const updatedOptions = {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Updated Title',
          },
        },
      };

      const { container, rerender } = render(
        <ChartWrapper options={initialOptions} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Update options
      rerender(<ChartWrapper options={updatedOptions} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Dynamic Chart Component', () => {
    // Test component that updates chart data dynamically
    const DynamicChart = ({ initialValue = 0 }) => {
      const [value, setValue] = useState(initialValue);

      const data = {
        labels: ['Value'],
        datasets: [
          {
            label: 'Dynamic Value',
            data: [value],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
          },
        ],
      };

      return (
        <div>
          <Bar data={data} />
          <button onClick={() => setValue(value + 10)}>Increment</button>
        </div>
      );
    };

    it('should render dynamic chart component', () => {
      const { container } = render(<DynamicChart initialValue={50} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should handle state-driven data updates', () => {
      const { container, rerender } = render(<DynamicChart initialValue={10} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Re-render with new initial value
      cleanup();
      const { container: newContainer } = render(<DynamicChart initialValue={100} />);
      expect(newContainer.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Chart Data Validation', () => {
    it('should handle empty datasets gracefully', () => {
      const emptyData = {
        labels: [],
        datasets: [
          {
            label: 'Empty',
            data: [],
          },
        ],
      };

      expect(() => {
        render(<Line data={emptyData} />);
      }).not.toThrow();
    });

    it('should handle data updates from null to valid data', () => {
      const ChartWrapper = ({ data }) => (
        <div style={{ width: '500px', height: '300px' }}>
          <Bar data={data} options={{ responsive: false, maintainAspectRatio: false }} />
        </div>
      );

      const nullData = {
        labels: [],
        datasets: [],
      };

      const validData = {
        labels: ['A', 'B'],
        datasets: [
          {
            label: 'Valid',
            data: [10, 20],
          },
        ],
      };

      const { container, rerender } = render(<ChartWrapper data={nullData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();

      // Update from empty to valid
      rerender(<ChartWrapper data={validData} />);
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });
});
