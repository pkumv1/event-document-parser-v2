import { useEffect, useState } from 'react'

export default function AnalysisControls({ file, extractedText, onExtractText, onAnalyze, isLoading }) {
  const [textStats, setTextStats] = useState({ characters: 0, words: 0 })

  useEffect(() => {
    if (extractedText) {
      setTextStats({
        characters: extractedText.length,
        words: extractedText.split(/\s+/).filter(word => word.length > 0).length
      })
    }
  }, [extractedText])

  return (
    <div className="custom-card">
      {extractedText && (
        <>
          <div className="success-badge" style={{ display: 'flex', marginBottom: '1rem' }}>
            ✅ Text extracted successfully!
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-value">{textStats.characters.toLocaleString()}</div>
              <div className="stat-label">Characters</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{textStats.words.toLocaleString()}</div>
              <div className="stat-label">Words</div>
            </div>
          </div>
        </>
      )}
      
      {!extractedText && file && (
        <button 
          className="btn" 
          onClick={onExtractText}
          disabled={isLoading}
          style={{ marginBottom: '1rem' }}
        >
          {isLoading && <span className="spinner" />}
          📤 Extract Text
        </button>
      )}
      
      <button 
        className="btn" 
        onClick={onAnalyze}
        disabled={isLoading || (!extractedText && !file)}
        style={{ fontSize: '1.1rem', padding: '1rem' }}
      >
        {isLoading && <span className="spinner" />}
        🚀 Analyze Document
      </button>
    </div>
  )
}