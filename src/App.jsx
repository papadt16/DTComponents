import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import CheckoutReceipt from './components/CheckoutReceipt'
import AdminPanel from './components/AdminPanel'
import sampleProducts from './data/products.json'

const STORE_NAME = 'DTComponents'
const WA_NUMBER = '+2349038899075'

export default function App(){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  // load products (seed once from data) or from localStorage
  useEffect(()=>{
    const saved = localStorage.getItem('dt_products')
    if(saved) setProducts(JSON.parse(saved))
    else { setProducts(sampleProducts); localStorage.setItem('dt_products', JSON.stringify(sampleProducts)) }
  }, [])

  useEffect(()=> localStorage.setItem('dt_cart', JSON.stringify(cart)), [cart])

  useEffect(()=>{
    const saved = localStorage.getItem('dt_cart')
    if(saved) setCart(JSON.parse(saved))
  }, [])

  function addToCart(p){
    setCart(prev=>{
      const found = prev.find(x=>x.id===p.id)
      if(found) return prev.map(x=> x.id===p.id ? {...x, qty: x.qty+1} : x)
      return [...prev, {...p, qty:1}]
    })
  }

  function updateQty(id, qty){ if(qty<1) return remove(id); setCart(prev=> prev.map(i=> i.id===id ? {...i, qty} : i)) }
  function remove(id){ setCart(prev=> prev.filter(i=> i.id!==id)) }

  function total(){ return cart.reduce((s,i)=> s + i.price*i.qty, 0) }

  function handleProductsChanged(newProducts){ setProducts(newProducts); localStorage.setItem('dt_products', JSON.stringify(newProducts)) }

  const filtered = products.filter(p=> p.title.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="container">
        <header className="header">
          <div>
            <div className="brand">{STORE_NAME}</div>
            <div style={{fontSize:13, color:'#6b7280'}}>Electronics parts • Pickup on campus</div>
          </div>

          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input className="input" placeholder="Search products" value={query} onChange={e=>setQuery(e.target.value)} />
            <Link to="/admin" className="btn">Admin</Link>
            <button className="btn btn-primary" onClick={()=>navigate('/cart')}>Cart ({cart.reduce((s,i)=>s+i.qty,0)})</button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={(
            <main style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:16}}>
              <div>
                <h2>Products</h2>
                <ProductList products={filtered} onAdd={addToCart} />
              </div>
              <aside>
                <Cart cart={cart} updateQty={updateQty} remove={remove} total={total()} />
              </aside>
            </main>
          )} />

          <Route path="/cart" element={(
            <div>
              <h2>Your Cart</h2>
              <div style={{display:'grid', gridTemplateColumns:'1fr 420px', gap:16}}>
                <div>
                  {cart.length===0 ? <div style={{color:'#6b7280'}}>Cart empty</div> : cart.map(i=> (
                    <div key={i.id} className="card" style={{marginBottom:8}}>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontWeight:700}}>{i.title}</div>
                          <div style={{fontSize:12, color:'#6b7280'}}>{i.sku}</div>
                        </div>
                        <div>
                          <input className="input" type="number" value={i.qty} min={1} style={{width:60}} onChange={e=>updateQty(i.id, parseInt(e.target.value||1))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="card">
                    <div style={{fontWeight:700}}>Order Summary</div>
                    <div style={{marginTop:8}}>Total: ₦{total()}</div>
                    <div style={{marginTop:8}}>
                      <CheckoutReceipt cart={cart} total={total()} storeName={STORE_NAME} waNumber={WA_NUMBER} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} />

          <Route path="/admin" element={(
            <div>
              <AdminPanel onProductsChange={handleProductsChanged} />
            </div>
          )} />

        </Routes>

        <footer className="footer">© DTComponents • Orders: {WA_NUMBER}</footer>
      </div>
    </div>
  )
}
