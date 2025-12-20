import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function AdminProductForm({ onSave, product }){
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState('General')
  const [img, setImg] = useState('')
  const [stock, setStock] = useState(0)

  useEffect(()=>{
    if(product){ setTitle(product.title); setSku(product.sku); setPrice(product.price); setCategory(product.category); setImg(product.img); setStock(product.stock) }
  },[product])

  function submit(e){
    e.preventDefault()
    const p = product ? { ...product, title, sku, price: Number(price), category, img, stock: Number(stock) } : { id: uuidv4(), title, sku, price: Number(price), category, img, stock: Number(stock) }
    onSave(p)
    // clear form when adding new
    if(!product){ setTitle(''); setSku(''); setPrice(0); setCategory('General'); setImg(''); setStock(0) }
  }

  return (
    <form onSubmit={submit} style={{display:'grid', gap:8}}>
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
      <input className="input" value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU" />
      <input className="input" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" required />
      <input className="input" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" />
      <input className="input" value={img} onChange={e=>setImg(e.target.value)} placeholder="Image URL" />
      <input className="input" type="number" value={stock} onChange={e=>setStock(e.target.value)} placeholder="Stock" />
      <div style={{display:'flex', gap:8}}>
        <button className="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  )
}
