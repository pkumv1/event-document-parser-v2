'use client'

import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Sidebar from '@/components/Sidebar'
import MainHeader from '@/components/MainHeader'
import FileUpload from '@/components/FileUpload'
import DocumentPreview from '@/components/DocumentPreview'
import AnalysisControls from '@/components/AnalysisControls'
import DataTabs from '@/components/DataTabs'
import MetricCards from '@/components/MetricCards'
import ExportOptions from '@/components/ExportOptions'

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyVerified, setApiKeyVerified] = useState(false)
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [parsingStats, setParsingStats] = useState({
    attempts: 0,
    successes: 0
  })

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('groq_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setApiKeyVerified(true)
    }
  }, [])

  const verifyApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('groq_api_key', apiKey)
      setApiKeyVerified(true)
      toast.success('API Key saved successfully!')
    } else {
      toast.error('Please enter a valid API key')
    }
  }

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile)
    setParsedData(null)
    setExtractedText('')
  }

  const extractText = async () => {
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/parse?action=extract', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to extract text')
      }

      const data = await response.json()
      console.log('Extracted text length:', data.text?.length || 0)
      console.log('First 500 chars:', data.text?.substring(0, 500))
      
      setExtractedText(data.text)
      toast.success('Text extracted successfully!')
      return data.text
    } catch (error) {
      toast.error('Failed to extract text from document')
      console.error('Text extraction error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeDocument = async () => {
    if (!apiKeyVerified || !apiKey) {
      toast.error('Please verify your API key first')
      return
    }

    setIsLoading(true)
    setParsingStats(prev => ({ ...prev, attempts: prev.attempts + 1 }))

    try {
      // Extract text if not already done
      let textToAnalyze = extractedText
      if (!textToAnalyze && file) {
        textToAnalyze = await extractText()
      }

      if (!textToAnalyze) {
        throw new Error('No text to analyze')
      }

      console.log('Sending text to analyze, length:', textToAnalyze.length)

      // Parse the document
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToAnalyze,
          apiKey: apiKey
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Parse API error:', errorText)
        throw new Error('Failed to parse document')
      }

      const data = await response.json()
      console.log('Parsed data received:', data)
      
      if (data.parsing_error) {
        toast.error('Parsing error: ' + data.error_message)
        console.error('Parsing error details:', data)
      } else {
        setParsingStats(prev => ({ ...prev, successes: prev.successes + 1 }))
        toast.success('Document analyzed successfully!')
      }
      
      setParsedData(data)
    } catch (error) {
      toast.error('Failed to analyze document: ' + error.message)
      console.error('Analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!parsedData) return

    const dataStr = JSON.stringify(parsedData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `event_data_${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="container">
        <Sidebar
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiKeyVerified={apiKeyVerified}
          verifyApiKey={verifyApiKey}
          parsingStats={parsingStats}
        />
        
        <div className="main-content">
          <MainHeader />
          
          <div className="custom-card animate-fade-in">
            <h3 className="section-header">📤 Upload Document</h3>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
          
          {file && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <div>
                <h3 className="section-header">📄 Document Preview</h3>
                <DocumentPreview file={file} />
              </div>
              
              <div>
                <h3 className="section-header">🤖 Analysis Controls</h3>
                <AnalysisControls
                  file={file}
                  extractedText={extractedText}
                  onExtractText={extractText}
                  onAnalyze={analyzeDocument}
                  isLoading={isLoading}
                />
                {extractedText && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                    <h4>Extracted Text Preview:</h4>
                    <p style={{ fontSize: '0.875rem', maxHeight: '200px', overflow: 'auto' }}>
                      {extractedText.substring(0, 500)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {parsedData && (
            <div style={{ marginTop: '3rem' }}>
              <h2 className="section-header">📊 Extracted Event Data</h2>
              
              {parsedData.parsing_error && (
                <div className="custom-card" style={{ background: '#fee', borderColor: '#fcc' }}>
                  <h4>⚠️ Parsing Error</h4>
                  <p>{parsedData.error_message}</p>
                  {parsedData.suggested_fixes && (
                    <ul style={{ marginTop: '1rem' }}>
                      {parsedData.suggested_fixes.map((fix, index) => (
                        <li key={index}>• {fix}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              <DataTabs data={parsedData} />
              
              <h3 className="section-header">💰 Financial Summary</h3>
              <MetricCards totals={parsedData.totals || {}} />
              
              <ExportOptions
                onDownloadJSON={downloadJSON}
                parsedData={parsedData}
              />
            </div>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Analyzing document...</p>
          </div>
        </div>
      )}
    </>
  )
}