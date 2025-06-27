import { useState } from 'react'

export default function ExportOptions({ onDownloadJSON, parsedData }) {
  const [showJSON, setShowJSON] = useState(false)

  return (
    <div className="custom-card">
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>💾 Export Options</h3>
      <div className="download-section">
        <button className="btn btn-secondary" onClick={onDownloadJSON}>
          📥 Download JSON Data
        </button>
        <button 
          className="btn btn-outline" 
          onClick={() => setShowJSON(!showJSON)}
        >
          👀 {showJSON ? 'Hide' : 'View'} Raw JSON Data
        </button>
      </div>
      
      {showJSON && (
        <div style={{ marginTop: '1.5rem' }}>
          <pre style={{
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}