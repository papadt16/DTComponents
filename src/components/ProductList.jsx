import React from 'react'
import ProductCard from './ProductCard'

export default function ProductList({ products, onAdd }){
  return (
    <div className="grid products">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={() => onAdd(p)} />
      ))}
    </div>
  )
}
