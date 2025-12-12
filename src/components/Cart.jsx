import React from 'react'
import { formatNaira } from '../utils/currency'

export default function Cart({ cart, updateQty, remove, total }){
  return (
    <div className="card aside">
      <h3>Cart</h3>
      {cart.length === 0 ? (
        <div style={{color:'#6b7280'}}>Your cart is empty</div>
      ) : (
        <div>
          {cart.map(i => (
            <div key={i.id} style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
              <div>
                <div style={{fontWeight:600}}>{i.title}</div>
                <div style={{fontSize:12, color:'#6b7280'}}>{i.sku}</div>
              </div>
              <div>
                <input className="input" type="number" value={i.qty} min={1} style={{width:60}} onChange={e=>updateQty(i.id, parseInt(e.target.value||1))} />
                <div style={{marginTop:6}}>{formatNaira(i.price*i.qty)}</div>
                <button style={{marginTop:6}} onClick={()=>remove(i.id)} className="btn">Remove</button>
              </div>
            </div>
          ))}

          <div style={{borderTop:'1px solid #e5e7eb', marginTop:12, paddingTop:12}}>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:700}}>Total: <span>{formatNaira(total)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
