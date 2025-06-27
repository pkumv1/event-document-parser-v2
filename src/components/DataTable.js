export default function DataTable({ columns, data, total, totalLabel = 'TOTAL', extraRows = [], emptyMessage }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (!data || data.length === 0) {
    return (
      <div className="custom-card">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          📋 {emptyMessage || 'No data found.'}
        </p>
      </div>
    )
  }

  return (
    <div className="custom-card">
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
            
            {extraRows.map((row, rowIndex) => (
              <tr key={`extra-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
            
            {total !== undefined && (
              <tr className="total-row">
                <td colSpan={columns.length - 1}><strong>{totalLabel}</strong></td>
                <td><strong>{formatCurrency(total)}</strong></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}