import React from 'react'
import { formatNaira } from '../utils/currency'

export default function ProductCard({ product, onAdd }){
  return (
    <div className="card">
      <img src={product.img} alt={product.title} />
      <h4 style={{margin:'8px 0'}}>{product.title}</h4>
      <div style={{color:'#6b7280', fontSize:13}}>{product.sku} • {product.category}</div>
      <div style={{marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:700}}>{formatNaira(product.price)}</div>
        <button className="btn btn-success" onClick={onAdd}>Add</button>
      </div>
    </div>
  )
}
