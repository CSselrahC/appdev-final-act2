// App.js
import React, { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import useReorderModel from './hooks/useReorderModel';
import { Container, Spinner, Alert } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PRODUCTS_API_URL = process.env.REACT_APP_PRODUCTS_API_URL || 'data/products.json';

function App() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const reorderThreshold = 0.75;

  const { predictions, isTraining, metrics } = useReorderModel(products, reorderThreshold);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      setError(null);
      try {
        const res = await fetch(PRODUCTS_API_URL);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        setError('Failed to load products. Please try again later.');
        console.error('Failed to fetch products:', e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  let reorderCount = 0;
  let noReorderCount = 0;
  products.forEach(product => {
    const prediction = predictions[product.id];
    if (prediction === 'Reorder') reorderCount++;
    else noReorderCount++;
  });

  useEffect(() => {
    document.title = "Forecast";
  }, []);

  return (
    <Container className="my-4">
      <h1 className="mb-4">Forecast - Inventory Reorder Predictor</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoadingProducts && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" />
          <div>Loading products...</div>
        </div>
      )}

      {!isLoadingProducts && !error && (
        <>
          <div className="mb-4">
            <h5>Summary</h5>
            <p>Total products: {totalProducts}</p>
            <p>Products to reorder: {reorderCount}</p>
            <p>Products sufficient in stock: {noReorderCount}</p>
            {isTraining && (
              <div className="text-info">
                Model is training, please wait...
              </div>
            )}
          </div>

          <ProductTable products={products} predictions={predictions} />
        </>
      )}
    </Container>
  );
}

export default App;
