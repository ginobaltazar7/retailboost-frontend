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

// 1. Register Chart.js components
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
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/results/${taskId}`);
        const data = await res.json();

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
        setResult(data.result);
        setLoading(false);
        setProgress(null);

      } catch (err) {
        clearInterval(interval);
        setError('Error fetching results.');
        setLoading(false);
      }
    }, 2000);
  };

  // --- CHART HELPERS ---
  
  // Custom "Viridis" style palette for the Bar Chart
  const viridisPalette = [
    '#440154', '#482878', '#3E4A89', '#31688E', '#26828E',
    '#1F9E89', '#35B779', '#6DCD59', '#B4DE2C', '#FDE725'
  ];

  const getGenreChartData = (apiData) => {
    if (!apiData) return { labels: [], datasets: [] };
    return {
      labels: apiData.map(item => item.name),
      datasets: [{
        label: 'Total Visitors',
        data: apiData.map(item => item.value),
        backgroundColor: viridisPalette,
        borderRadius: 4, 
      }],
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
          borderColor: '#000000', // Black line
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 2,
          tension: 0.2, pointRadius: 0, pointHoverRadius: 5,
        },
        {
          label: '42-Day Forecast',
          data: apiData.map(item => item.forecast_value),
          borderColor: '#0000FF', // Blue line
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5], tension: 0.2, pointRadius: 0,
        },
      ],
    };
  };

  // Helper to extract growth metric safely
  const getGrowthMetric = () => {
    if (result?.chart_data?.metrics?.growth_pct !== undefined) {
      const growth = result.chart_data.metrics.growth_pct;
      const color = growth >= 0 ? 'green' : 'red';
      return <span style={{ color, fontWeight: 'bold' }}>{growth > 0 ? '+' : ''}{growth}%</span>;
    }
    return "N/A";
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>RetailBoost POC Demo</h1>
      <button 
        onClick={submitData} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Running Analysis...' : 'Ingest Data & Run Analysis'}
      </button>

      {/* --- Progress Bar & POC Description --- */}
      {loading && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
          
          {/* POC Description Text */}
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#444', lineHeight: '1.6', textAlign: 'left', borderLeft: '4px solid #d32f2f', paddingLeft: '15px' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>About this Analysis / 本分析について:</p>
            <p style={{ margin: '0 0 10px 0' }}>
              RetailBoost POC is a suite of AI tools being developed to predict demand and promote sales of artisan products in local "shotengai" family-run and mid-size shops in major Osaka Japan (e.g. Tenjinbashi-suji, Shinsaibashi, Amagasaki).
            </p>
            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '13px' }}>
              RetailBoost POCは、大阪の主要な商店街（天神橋筋、心斎橋、尼崎など）における家族経営や中規模店舗のために、需要予測、販売促進、プロモーション構築のための商品提案を行うAIツールスイートです。
            </p>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

          <h3>Processing... {taskId && `(Task ID: ${taskId})`}</h3>
          {progress ? (
            <div>
              <p>{progress.message}</p>
              <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '20px', borderRadius: '12px' }}>
                <div style={{ width: `${progress.percent}%`, backgroundColor: '#4caf50', height: '100%', borderRadius: '14px', transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            </div>
          ) : <p>Starting up...</p>}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: '30px' }}>
          <h2>Analysis Results</h2>

          {/* 1. RENDER CHARTS IF DATA EXISTS */}
          {result.chart_data && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Visual Dashboard</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                
                {/* --- Chart 1: Line Chart (Forecast) --- */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #ccc' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0000FF' }}>Future Demand Strategy</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', fontSize: '14px' }}>
                       <li>
                        <strong>Projection:</strong> Traffic trending {getGrowthMetric()} over next 6 weeks.
                       </li>
                       <li><strong>Action:</strong> Decrease inventory orders for upcoming month.</li>
                    </ul>
                  </div>
                  
                  <div style={{ height: '350px', position: 'relative' }}>
                    <Line 
                      options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Demand Forecast (History vs Projection)' } },
                        interaction: { mode: 'index', intersect: false },
                        scales: { x: { ticks: { maxTicksLimit: 10 } } }
                      }} 
                      data={getDemandChartData(result.chart_data.demand_line_chart)} 
                    />
                  </div>
                </div>

                {/* --- Chart 2: Bar Chart (Genres) --- */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #ccc' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#440154' }}>Portfolio Mix Strategy</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', fontSize: '14px' }}>
                       <li><strong>Insight:</strong> Izakaya/Cafes drive volume.</li>
                       <li><strong>Strategy:</strong> Focus base marketing on volume drivers.</li>
                    </ul>
                  </div>

                  <div style={{ height: '350px', position: 'relative' }}>
                    <Bar 
                      options={{
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, title: { display: true, text: 'Top Genres by Volume' } },
                      }} 
                      data={getGenreChartData(result.chart_data.genre_bar_chart)} 
                    />
                  </div>
                </div>
              </div>

              {/* --- DOWNLOAD BUTTON & TECHNICAL NOTE --- */}
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                
                {/* Technical Note */}
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px', maxWidth: '700px', margin: '0 auto 15px auto', lineHeight: '1.5' }}>
                  Forecasted using LightGBM with 5-Fold cross-validation and stacking, utilizing temporal proximity weighing to prioritize recent signals.
                  {' '}
                  <a 
                    href="https://arxiv.org/pdf/2305.17094" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0066cc', textDecoration: 'none' }}
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
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    display: 'inline-block'
                  }}
                >
                  Download Full PDF Strategy Deck
                </a>
              </div>
            </div>
          )}

          {/* 2. RENDER RAW TABLES */}
          <details>
            <summary style={{cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', margin: '20px 0' }}>View Raw Data Tables</summary>
            
            {/* Added Link to Data Source */}
            <div style={{ margin: '15px 0 20px 5px' }}>
              <a 
                href="https://tinyurl.com/retailboostdata"
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}
              >
                🔗 Data Source
              </a>
            </div>

            {Object.keys(result).map((tableName) => {
              if (tableName === 'chart_data') return null; 
              return (
                <div key={tableName} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0 }}>Table: {tableName}</h4>
                  {result[tableName].error ? (
                    <p style={{ color: 'red' }}>Error: {result[tableName].error}</p>
                  ) : (
                    <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f9f9f9' }}>
                      {result[tableName].length > 0 && (
                        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
                          <thead>
                            <tr>{Object.keys(result[tableName][0]).map(k => <th key={k} style={{ textAlign: 'left' }}>{k}</th>)}</tr>
                          </thead>
                          <tbody>
                            {result[tableName].slice(0, 50).map((row, idx) => (
                              <tr key={idx}>{Object.values(row).map((val, i) => <td key={i}>{String(val)}</td>)}</tr>
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

      {error && <p className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {/* --- BACK TO TOP & FOOTER --- */}
      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#0000FF',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px'
          }}
        >
          ↑ Back to Top / トップへ戻る
        </button>

        <footer style={{ 
          padding: '20px 0', 
          borderTop: '1px solid #ddd', 
          textAlign: 'center', 
          color: '#777',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p>&copy; {new Date().getFullYear()} Gino Baltazar & Uly Lalunio of RetailBoost Forecasts. All rights reserved.</p>
          <p style={{ margin: '5px 0', fontSize: '12px' }}>
            RetailBoost 著作権所有 &copy; {new Date().getFullYear()} 全ての権利を保有しています。
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
