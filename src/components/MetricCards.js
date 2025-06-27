export default function MetricCards({ totals }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const metrics = [
    {
      icon: '🏢',
      label: 'Meeting Rooms',
      value: formatCurrency(totals.meeting_room_rental_total || 0),
      delay: '0s'
    },
    {
      icon: '🍽️',
      label: 'Food & Beverage',
      value: formatCurrency(totals.food_beverage_total || 0),
      delay: '0.1s'
    },
    {
      icon: '🎤',
      label: 'Audio-Visual',
      value: formatCurrency(totals.audio_visual_total || 0),
      delay: '0.2s'
    },
    {
      icon: '🛏️',
      label: 'Accommodations',
      value: formatCurrency(totals.sleeping_room_total || 0),
      delay: '0.3s'
    },
    {
      icon: '💎',
      label: 'GRAND TOTAL',
      value: formatCurrency(totals.grand_total || 0),
      isPrimary: true,
      delay: '0.4s'
    }
  ]

  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className={`metric-card ${metric.isPrimary ? 'primary' : ''} animate-fade-in`}
          style={{ animationDelay: metric.delay }}
        >
          <div className="metric-icon">{metric.icon}</div>
          <div className="metric-label">{metric.label}</div>
          <div className="metric-value">{metric.value}</div>
        </div>
      ))}
    </div>
  )
}