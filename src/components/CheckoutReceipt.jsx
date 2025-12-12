import React, { useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { formatNaira } from '../utils/currency'

export default function CheckoutReceipt({ cart, total, storeName, waNumber }){
  const receiptRef = useRef(null)

  async function generatePDF(){
    if(!receiptRef.current) return;
    const doc = new jsPDF({ unit:'px', format:'a4' })
    const canvas = await html2canvas(receiptRef.current, { scale:2 })
    const img = canvas.toDataURL('image/png')
    const imgProps = doc.getImageProperties(img)
    const pdfWidth = doc.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
    const name = `${storeName}_Order_${Date.now()}.pdf`
    doc.save(name)
    alert('Receipt downloaded. Use the Send to WhatsApp button to open WhatsApp with the order details.')
  }

  function waText(){
    const lines = []
    lines.push(`${storeName} - New Order`)
    lines.push('---')
    cart.forEach(i=> lines.push(`${i.qty} x ${i.title} (${i.sku}) = ${formatNaira(i.price*i.qty)}`))
    lines.push('---')
    lines.push(`Total: ${formatNaira(total)}`)
    lines.push('Please confirm availability and delivery/pickup details.')
    return encodeURIComponent(lines.join('\n'))
  }

  function sendWA(){
    const number = waNumber.replace(/^\+/, '').replace(/\s+/g,'')
    const url = `https://wa.me/${number}?text=${waText()}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div ref={receiptRef} style={{padding:20, background:'#fff', width:800, color:'#111'}}>
        <h2 style={{color:'#3b82f6'}}>{storeName}</h2>
        <div>Order Receipt</div>
        <div style={{marginTop:8}}>---------------------------------------------</div>
        {cart.map(i=> (
          <div key={i.id} style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
            <div>{i.qty} x {i.title}</div>
            <div>{formatNaira(i.qty*i.price)}</div>
          </div>
        ))}
        <div style={{marginTop:12, fontWeight:700}}>Total: {formatNaira(total)}</div>
      </div>

      <div style={{marginTop:10, display:'flex', gap:8}}>
        <button className="btn btn-primary" onClick={generatePDF}>Generate PDF</button>
        <button className="btn btn-success" onClick={sendWA}>Send to WhatsApp</button>
      </div>
    </div>
  )
}
