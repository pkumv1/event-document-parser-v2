export default function Sidebar({ apiKey, setApiKey, apiKeyVerified, verifyApiKey, parsingStats }) {
  const successRate = parsingStats.attempts > 0 
    ? ((parsingStats.successes / parsingStats.attempts) * 100).toFixed(1) 
    : 0

  return (
    <div className="sidebar">
      <div className="logo-section">
        <span className="logo-text">🌟 Groupize Parser</span>
      </div>
      
      <div className="api-key-section">
        <h3>🔑 API Configuration</h3>
        <div className="input-group">
          <label>Enter your Groq API Key</label>
          <input
            type="password"
            placeholder="••••••••••••••••••••••••"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && verifyApiKey()}
          />
        </div>
        <button className="btn" onClick={verifyApiKey}>
          {apiKeyVerified ? '✅ Update API Key' : 'Verify API Key'}
        </button>
        {apiKeyVerified && (
          <div className="success-badge success-animation">
            ✅ API Connected
          </div>
        )}
      </div>
      
      <div className="stats-section">
        <h3>📊 Parsing Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{parsingStats.attempts}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>About</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This advanced event document parser extracts structured data from PDFs and Word documents, including event details, meeting rooms, accommodations, F&B, AV equipment, and financial summaries.
        </p>
      </div>
    </div>
  )
}