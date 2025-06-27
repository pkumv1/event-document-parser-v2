import { useState } from 'react'
import DataTable from './DataTable'

export default function DataTabs({ data }) {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { name: '📋 Event Info', icon: '📋' },
    { name: '🏢 Meeting Rooms', icon: '🏢' },
    { name: '🍽️ Food & Beverage', icon: '🍽️' },
    { name: '🛏️ Accommodations', icon: '🛏️' },
    { name: '🎤 Audio-Visual', icon: '🎤' },
    { name: '💰 Financial Summary', icon: '💰' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateStr, dayName) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      const formatted = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      return dayName ? `${dayName}, ${formatted.substring(4)}` : formatted
    } catch {
      return dateStr
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Event Info
        const eventInfo = data.event_info || {}
        return (
          <div className="custom-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                {eventInfo.organization && <p><strong>Organization:</strong> {eventInfo.organization}</p>}
                {eventInfo.event_name && <p><strong>Event Name:</strong> {eventInfo.event_name}</p>}
                {eventInfo.venue && <p><strong>Venue:</strong> {eventInfo.venue}</p>}
                {eventInfo.event_dates && <p><strong>Event Dates:</strong> {eventInfo.event_dates}</p>}
              </div>
              <div>
                {eventInfo.customer && <p><strong>Customer:</strong> {eventInfo.customer}</p>}
                {eventInfo.contact_person && <p><strong>Contact Person:</strong> {eventInfo.contact_person}</p>}
                {eventInfo.phone && <p><strong>Phone:</strong> {eventInfo.phone}</p>}
              </div>
            </div>
          </div>
        )

      case 1: // Meeting Rooms
        const meetingRooms = data.meeting_rooms || []
        const meetingColumns = ['Date', 'Time', 'Function', 'Room Setup', 'Location', 'Capacity', 'Room Rental', 'Order #']
        const meetingData = meetingRooms.map(room => [
          formatDate(room.date, room.day_name),
          room.time || '',
          room.function || '',
          room.room_setup || '',
          room.location || '',
          room.capacity || '',
          formatCurrency(room.room_rental),
          room.event_order_number || ''
        ])
        const meetingTotal = meetingRooms.reduce((sum, room) => sum + (parseFloat(room.room_rental) || 0), 0)
        
        return <DataTable 
          columns={meetingColumns} 
          data={meetingData} 
          total={meetingTotal}
          emptyMessage="No meeting room data found in the document."
        />

      case 2: // Food & Beverage
        const foodBeverage = data.food_beverage || []
        const fbColumns = ['Date', 'Time', 'Product Name', 'Meal Type', 'Location', 'Attendees', 'Per Person Cost', 'Total Cost', 'Order #']
        const fbData = foodBeverage.map(item => [
          formatDate(item.date, item.day_name),
          item.time || '',
          item.product_name || '',
          item.meal_type || '',
          item.location || '',
          item.attendees || '',
          formatCurrency(item.per_person_cost),
          formatCurrency(item.total_cost),
          item.event_order_number || ''
        ])
        
        // Add financial breakdown rows
        const financialTerms = data.financial_terms || {}
        const totals = data.totals || {}
        const extraRows = []
        
        if (totals.food_beverage_subtotal) {
          extraRows.push(['**SUBTOTAL**', '', '', '', '', '', '', formatCurrency(totals.food_beverage_subtotal), ''])
        }
        
        if (financialTerms.service_charge_rate && totals.service_charge) {
          const rate = financialTerms.service_charge_rate * 100
          extraRows.push([`**Service Charge (${rate.toFixed(1)}%)**`, '', '', '', '', '', '', formatCurrency(totals.service_charge), ''])
        }
        
        if (financialTerms.tax_rate && totals.tax) {
          const rate = financialTerms.tax_rate * 100
          extraRows.push([`**Tax (${rate.toFixed(2)}%)**`, '', '', '', '', '', '', formatCurrency(totals.tax), ''])
        }
        
        return <DataTable 
          columns={fbColumns} 
          data={fbData} 
          extraRows={extraRows}
          total={totals.food_beverage_total}
          totalLabel="TOTAL F&B"
          emptyMessage="No food & beverage data found in the document."
        />

      case 3: // Accommodations
        const sleepingRooms = data.sleeping_rooms || []
        const accColumns = ['Check-in', 'Check-out', 'Room Type', 'Guest Name', 'Rooms', 'Persons', 'Nights', 'Rate Type', 'Nightly Rate', 'Total Cost', 'Special Requests', 'Order #']
        const accData = sleepingRooms.map(room => [
          formatDate(room.check_in_date),
          formatDate(room.check_out_date),
          room.room_type || '',
          room.guest_name || '',
          room.number_of_rooms || '',
          room.number_of_persons || '',
          room.number_of_nights || '',
          room.rate_type || '',
          formatCurrency(room.nightly_rate),
          formatCurrency(room.total_room_cost),
          room.special_requests || '',
          room.event_order_number || ''
        ])
        const accTotal = sleepingRooms.reduce((sum, room) => sum + (parseFloat(room.total_room_cost) || 0), 0)
        
        return <DataTable 
          columns={accColumns} 
          data={accData} 
          total={accTotal}
          emptyMessage="No sleeping room/accommodation data found in the document."
        />

      case 4: // Audio-Visual
        const audioVisual = data.audio_visual || []
        const avColumns = ['Date', 'Time', 'Equipment/Service', 'Description', 'Location', 'Quantity', 'Unit Cost', 'Total Cost', 'Supplier', 'Order #']
        const avData = audioVisual.map(item => [
          formatDate(item.date),
          item.time || '',
          item.equipment_name || '',
          item.description || '',
          item.location || '',
          item.quantity || '',
          formatCurrency(item.unit_cost),
          formatCurrency(item.total_cost),
          item.supplier || '',
          item.event_order_number || ''
        ])
        const avTotal = audioVisual.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0)
        
        return <DataTable 
          columns={avColumns} 
          data={avData} 
          total={avTotal}
          emptyMessage="No audio-visual data found in the document."
        />

      case 5: // Financial Summary
        const financial = data.financial_terms || {}
        const totals = data.totals || {}
        return (
          <div className="custom-card">
            <h4 style={{ marginBottom: '1.5rem' }}>Financial Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h5 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Event Components</h5>
                <p><strong>Meeting Rooms:</strong> {formatCurrency(totals.meeting_room_rental_total)}</p>
                <p><strong>Food & Beverage:</strong> {formatCurrency(totals.food_beverage_total)}</p>
                <p><strong>Audio-Visual:</strong> {formatCurrency(totals.audio_visual_total)}</p>
                <p><strong>Accommodations:</strong> {formatCurrency(totals.sleeping_room_total)}</p>
              </div>
              <div>
                <h5 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Charges & Taxes</h5>
                {financial.service_charge_rate > 0 && (
                  <p><strong>Service Charge ({(financial.service_charge_rate * 100).toFixed(1)}%):</strong> {formatCurrency(totals.service_charge)}</p>
                )}
                {financial.tax_rate > 0 && (
                  <p><strong>Tax ({(financial.tax_rate * 100).toFixed(2)}%):</strong> {formatCurrency(totals.tax)}</p>
                )}
                {financial.vat_rate > 0 && (
                  <p><strong>VAT ({(financial.vat_rate * 100).toFixed(2)}%):</strong> {formatCurrency(totals.vat)}</p>
                )}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid var(--primary-light)' }}>
                  <p style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                    <strong>Grand Total: {formatCurrency(totals.grand_total)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      
      {renderTabContent()}
    </div>
  )
}