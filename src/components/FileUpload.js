import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileUpload({ onFileUpload }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  })

  return (
    <div {...getRootProps()} className={`file-upload ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <div className="file-upload-icon">📄</div>
      <div className="file-upload-text">
        {isDragActive ? 'Drop the file here...' : 'Drag and drop your file here or click to browse'}
      </div>
      <div className="file-upload-hint">Supports PDF and DOCX files</div>
    </div>
  )
}