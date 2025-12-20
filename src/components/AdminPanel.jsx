import React, { useState, useEffect } from 'react'
import AdminProductForm from './AdminProductForm'

export default function AdminPanel({ onProductsChange }){
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)

  const ADMIN_PASSWORD = 'dtadmin123'

  useEffect(()=>{
    const saved = localStorage.getItem('dt_products')
    if(saved) setProducts(JSON.parse(saved))
    onProductsChange && onProductsChange(JSON.parse(saved || '[]'))
  }, [])

  useEffect(()=>{
    localStorage.setItem('dt_products', JSON.stringify(products))
    onProductsChange && onProductsChange(products)
  }, [products])

  function login(e){ e.preventDefault(); if(password === ADMIN_PASSWORD){ setAuthed(true) } else alert('Wrong password') }

  function saveProduct(p){
    setProducts(prev => {
      const found = prev.find(x=>x.id===p.id)
      if(found) return prev.map(x=> x.id===p.id ? p : x)
      return [p, ...prev]
    })
    setEditing(null)
  }

  function removeProduct(id){ if(!confirm('Delete product?')) return; setProducts(prev => prev.filter(p=>p.id!==id)) }

  if(!authed) return (
    <div className="card">
      <h3>Admin Login</h3>
      <form onSubmit={login} style={{display:'grid', gap:8}}>
        <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
      <div style={{marginTop:12, fontSize:12, color:'#6b7280'}}>Default password for prototype: <strong>dtadmin123</strong></div>
    </div>
  )

  return (
    <div>
      <h3>Admin Panel</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:12}}>
        <div>
          <h4>Products</h4>
          <div style={{display:'grid', gap:8}}>
            {products.map(p=> (
              <div key={p.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700}}>{p.title}</div>
                  <div style={{fontSize:12, color:'#6b7280'}}>{p.sku} • {p.category} • {p.stock} in stock</div>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={()=>setEditing(p)}>Edit</button>
                  <button className="btn" onClick={()=>removeProduct(p.id)}>Delete</button>
                </div>
              </div>
            ))}
            {products.length===0 && <div style={{color:'#6b7280'}}>No products yet</div>}
          </div>
        </div>

        <div>
          <h4>{editing ? 'Edit Product' : 'Add Product'}</h4>
          <AdminProductForm onSave={saveProduct} product={editing} />
        </div>
      </div>
    </div>
  )
}
