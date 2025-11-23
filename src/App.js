import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Button } from 'react-bootstrap';

import ProductTable from './components/ProductTable';
import SummaryDashboard from './components/SummaryDashboard';
import SearchBar from './components/SearchBar';

import useReorderModel from './hooks/useReorderModel';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PRODUCTS_API_URL = process.env.REACT_APP_PRODUCTS_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  const reorderThreshold = 0.75;
  const { predictions, isTraining } = useReorderModel(products, reorderThreshold);

  const fetchProducts = async () => {
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
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    document.title = "Forecast";
  }, []);

  // Filter products by name
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // Calculate counts for summary
  const totalProducts = products.length;
  let reorderCount = 0;
  let noReorderCount = 0;

  products.forEach(product => {
    const prediction = predictions[product.id];
    if (prediction === 'Reorder') reorderCount++;
    else noReorderCount++;
  });

  return (
    <div className="app-container">
      <h1 className="mb-1 text-start text-info">Forecast</h1>
      <h5 className="mb-4 text-start text-light">Inventory Reorder Predictor</h5>

      {error && <Alert variant="danger">{error}</Alert>}

      <SearchBar filterText={filterText} onFilterTextChange={setFilterText} />

      <div className="mb-3 text-center text-info">
        <Button onClick={fetchProducts} disabled={isLoadingProducts}>
          {isLoadingProducts ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {isLoadingProducts && <Spinner animation="border" role="status"><span className="visually-hidden">Loading products...</span></Spinner>}

      {!isLoadingProducts && !error && (
        <>
          <SummaryDashboard total={totalProducts} reorder={reorderCount} noReorder={noReorderCount} isTraining={isTraining} />

          <ProductTable products={filteredProducts} predictions={predictions} />
        </>
      )}

      <p className="text-light">Powered by TensorFlow.js | Created by Charles Carreon</p>
    </div>
  );
}

export default App;
