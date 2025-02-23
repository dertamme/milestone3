import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div>
      <h2>Product Catalog</h2>
      <div className='products'>
        {products.map((product) => (
          <div key={product.product_id} className='product-card'>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <Link to={`/product/${product.product_id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
