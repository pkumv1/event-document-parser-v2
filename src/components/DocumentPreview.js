import { useState, useEffect } from 'react'

export default function DocumentPreview({ file }) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  if (!file) {
    return (
      <div className="document-preview">
        <div className="preview-placeholder">
          <p>No document uploaded</p>
        </div>
      </div>
    )
  }

  if (file.type === 'application/pdf' && previewUrl) {
    return (
      <div className="document-preview">
        <iframe
          src={previewUrl}
          title="PDF Preview"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  return (
    <div className="document-preview">
      <div className="preview-placeholder">
        <p>{file.name}</p>
        <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
          {file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ? 'Word document preview not available'
            : 'Preview not available'}
        </p>
      </div>
    </div>
  )
}