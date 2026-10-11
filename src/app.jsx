import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}

const API_BASE_URL = stripTrailingSlash(import.meta.env.VITE_API_URL);
console.log("API URL being used:", API_BASE_URL);

function App() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submitData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTaskId(null);
    setProgress(null);

    const dataPayload = "Triggering Analytics Job...";

    try {
      const res = await fetch(`${API_BASE_URL}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user001', data_payload: dataPayload }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.task_id) {
        setTaskId(data.task_id);
        pollResults(data.task_id);
      } else {
        setError('No task ID received');
        setLoading(false);
      }
    } catch (err) {
      setError(`Failed to submit data: ${err.message}`);
      setLoading(false);
    }
  };

const pollResults = (taskId) => {
  let consecutiveFailures = 0;
  const MAX_FAILURES = 3;
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results/${taskId}`);
      const data = await res.json();
      consecutiveFailures = 0; // a success resets the count
      if (res.status === 202) {
        if (data.progress) setProgress(data.progress);
        return;
      }
      if (res.status === 404 || res.status === 500) {
        setError('Task failed or not found.');
        clearInterval(interval);
        setLoading(false);
        return;
      }
      clearInterval(interval);
      setResult(data.result ?? data);
      setLoading(false);
      setProgress(null);
    } catch (err) {
      consecutiveFailures += 1;
      if (consecutiveFailures >= MAX_FAILURES) {
        clearInterval(interval);
        setError('Error fetching results.');
        setLoading(false);
      }
      // otherwise: transient blip, keep polling
    }
  }, 2000);
};


  // --- RESTYLED CONFIGURATIONS FOR CHART.JS ---
  const sophisticatedPalette = [
    '#311042', '#431459', '#551A70', '#672088', '#7A29A0',
    '#8D35B8', '#9F46C7', '#B05AD4', '#BE70E0', '#CC86EC'
  ];

  const getGenreChartData = (apiData) => {
    if (!apiData) return { labels: [], datasets: [] };
    return {
      labels: apiData.map(item => item.name),
      datasets: [
        {
          label: 'Total Visitors',
          data: apiData.map(item => item.value),
          backgroundColor: sophisticatedPalette,
          borderRadius: { topRight: 6, bottomRight: 6, topLeft: 0, bottomLeft: 0 }, 
          barThickness: 18,
        }
      ],
    };
  };

  const getDemandChartData = (apiData) => {
    if (!apiData) return { labels: [], datasets: [] };
    return {
      labels: apiData.map(item => item.date),
      datasets: [
        {
          label: 'Historical Actuals',
          data: apiData.map(item => item.history_value),
          borderColor: '#1E293B', 
          backgroundColor: 'rgba(30, 41, 59, 0.02)',
          fill: true,
          borderWidth: 2.5,
          tension: 0.4, 
          cubicInterpolationMode: 'monotone', 
          pointRadius: 0, 
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#1E293B',
        },
        {
          label: '42-Day Forecast',
          data: apiData.map(item => item.forecast_value),
          borderColor: '#4F46E5', 
          backgroundColor: 'rgba(79, 70, 229, 0.02)',
          fill: true,
          borderWidth: 2.5,
          borderDash: [5, 5], 
          tension: 0.4, 
          cubicInterpolationMode: 'monotone',
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#4F46E5',
        }
      ],
    };
  };

  const getGrowthMetric = () => {
    if (result?.chart_data?.metrics?.growth_pct !== undefined) {
      const growth = result.chart_data.metrics.growth_pct;
      const color = growth >= 0 ? '#10B981' : '#EF4444';
      return <span style={{ color, fontWeight: 'bold' }}>{growth > 0 ? '+' : ''}{growth}%</span>;
    }
    return "N/A";
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#FAFAFA', color: '#1E293B' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '24px' }}>RetailBoost Forecast Demo</h1>
      <button 
        onClick={submitData} 
        disabled={loading}
        style={{ 
          padding: '12px 24px', 
          fontSize: '15px', 
          fontWeight: '600',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: loading ? '#E2E8F0' : '#4F46E5',
          color: '#FFFFFF',
          boxShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? 'Running Analysis...' : 'Ingest Data & Run Analysis'}
      </button>

      {/* --- Progress Bar & POC Description --- */}
      {loading && (
        <div style={{ marginTop: '24px', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.6', textAlign: 'left', borderLeft: '4px solid #EF4444', paddingLeft: '16px' }}>
            <p style={{ fontWeight: '700', margin: '0 0 6px 0', color: '#1E293B' }}>About this Analysis / 本分析について:</p>
            <p style={{ margin: '0 0 10px 0' }}>
              RetailBoost Forecast Demo is a suite of AI tools being developed to predict demand and promote sales of artisan products in local "shotengai" family-run and mid-size shops in major Osaka Japan (e.g. Tenjinbashi-suji, Shinsaibashi, Amagasaki).
            </p>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '13px', color: '#64748B' }}>
              RetailBoost Forecast Demo は、大阪の主要な商店街（天神橋筋、心斎橋、尼崎など）における家族経営や中規模店舗のために、需要予測、販売促進、プロモーション構築のための商品提案を行うAIツールスイートです。
            </p>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #F1F5F9', margin: '20px 0' }} />

          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Processing... {taskId && `(Task ID: ${taskId})`}</h3>
          {progress ? (
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>{progress.message}</p>
              <div style={{ width: '100%', backgroundColor: '#F1F5F9', height: '12px', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${progress.percent}%`, backgroundColor: '#10B981', height: '100%', borderRadius: '9999px', transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            </div>
          ) : <p style={{ fontSize: '14px', color: '#64748B' }}>Starting up...</p>}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>Analysis Results</h2>

          {/* 1. RENDER CHARTS IF DATA EXISTS */}
          {result.chart_data && (
            <div style={{ marginBottom: '40px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
                
                {/* --- Chart 1: Line Chart (Forecast) --- */}
                <div style={{ border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#4F46E5', fontSize: '16px', fontWeight: '700' }}>Future Demand Strategy</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                       <li>
                        <strong>Projection:</strong> Traffic trending {getGrowthMetric()} over next 6 weeks.
                       </li>
                       <li><strong>Action:</strong> Decrease inventory orders for upcoming month.</li>
                    </ul>
                  </div>
                  
                  <div style={{ height: '320px', position: 'relative' }}>
                    <Line 
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { 
                          legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true, font: { family: 'inherit', size: 12 } } }, 
                          title: { display: true, text: 'Demand Forecast (History vs Projection)', font: { size: 14, weight: '600' }, color: '#1E293B', padding: { bottom: 10 } } 
                        },
                        interaction: { mode: 'index', intersect: false },
                        scales: { 
                          x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: '#64748B', font: { size: 11 } } },
                          y: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { size: 11 } } }
                        }
                      }} 
                      data={getDemandChartData(result.chart_data.demand_line_chart)} 
                    />
                  </div>
                </div>

                {/* --- Chart 2: Bar Chart (Genres) --- */}
                <div style={{ border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#311042', fontSize: '16px', fontWeight: '700' }}>Portfolio Mix Strategy</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                       <li><strong>Insight:</strong> Izakaya/Cafes drive volume.</li>
                       <li><strong>Strategy:</strong> Focus base marketing on volume drivers.</li>
                    </ul>
                  </div>

                  <div style={{ height: '320px', position: 'relative' }}>
                    <Bar 
                      options={{
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                        plugins: { 
                          legend: { display: false }, 
                          title: { display: true, text: 'Top Genres by Volume', font: { size: 14, weight: '600' }, color: '#1E293B', padding: { bottom: 10 } } 
                        },
                        scales: {
                          x: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { size: 11 } } },
                          y: { grid: { display: false }, ticks: { color: '#1E293B', font: { size: 12, weight: '500' } } }
                        }
                      }} 
                      data={getGenreChartData(result.chart_data.genre_bar_chart)} 
                    />
                  </div>
                </div>
              </div>

              {/* --- DOWNLOAD BUTTON & TECHNICAL NOTE --- */}
              <div style={{ marginTop: '48px', textAlign: 'center' }}>
                
                {/* Technical Note */}
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', maxWidth: '700px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                  Forecasted using LightGBM with 5-Fold cross-validation and stacking, utilizing temporal proximity weighing to prioritize recent signals.
                  {' '}
                  <a 
                    href="https://arxiv.org/pdf/2305.17094" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}
                  >
                    Read More
                  </a>
                </p>

                {/* Button */}
                <a 
                  href={`${API_BASE_URL}/download/${taskId}`}
                  download="RetailBoost_Japan_Retail_Strategy_Deck_with_Forecasts.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    padding: '14px 28px',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
                    display: 'inline-block',
                    transition: 'opacity 0.2s'
                  }}
                >
                  Download Full PDF Strategy Deck
                </a>
              </div>
            </div>
          )}

          {/* 2. RENDER RAW TABLES */}
          <details style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <summary style={{cursor: 'pointer', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>View Raw Data Tables</summary>
            
            <div style={{ margin: '15px 0 15px 5px' }}>
              <a 
                href="https://tinyurl.com/retailboostdata"
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}
              >
                🔗 Data Source
              </a>
            </div>

            {Object.keys(result).map((tableName) => {
              if (tableName === 'chart_data') return null; 
              return (
                <div key={tableName} style={{ marginTop: '20px', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px', background: '#FAFAFA' }}>
                  <h4 style={{ marginTop: 0, fontSize: '14px', color: '#475569' }}>Table: {tableName}</h4>
                  {result[tableName].error ? (
                    <p style={{ color: '#EF4444' }}>Error: {result[tableName].error}</p>
                  ) : (
                    <div style={{ maxHeight: '200px', overflow: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                      {Array.isArray(result[tableName]) && result[tableName].length > 0 && (
                        <table cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', color: '#334155' }}>
                          <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, boxShadow: 'inset 0 -1px 0 #E2E8F0' }}>
                            <tr>{Object.keys(result[tableName]).map(k => <th key={k} style={{ textAlign: 'left', fontWeight: '600' }}>{k}</th>)}</tr>
                          </thead>
                          <tbody>
                            {result[tableName].slice(0, 50).map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>{Object.values(row).map((val, i) => <td key={i}>{String(val)}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </details>
        </div>
      )}

      {error && <p className="error-message" style={{ color: '#EF4444', fontWeight: 'bold', marginTop: '16px' }}>{error}</p>}

      {/* --- BACK TO TOP & FOOTER --- */}
      <div style={{ marginTop: '64px', textAlign: 'center' }}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#4F46E5',
            textDecoration: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '24px'
          }}
        >
          ↑ Back to Top / トップへ戻る
        </button>

        <footer style={{ 
          padding: '24px 0', 
          borderTop: '1px solid #E2E8F0', 
          textAlign: 'center', 
          color: '#64748B',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          <p>&copy; {new Date().getFullYear()} Gino Baltazar & Uly Lalunio of RetailBoost Forecasts. All rights reserved.</p>
          <p style={{ margin: '4px 0', fontSize: '11px', color: '#94A3B8' }}>
            RetailBoost 著作権所有 &copy; {new Date().getFullYear()} 全ての権利を保有しています。
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
