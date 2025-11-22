// ProductTable.js
import React, { useState } from 'react';
import { Button, Table, Badge, ButtonGroup } from 'react-bootstrap';

function ProductTable({ products, predictions }) {
  const [filter, setFilter] = useState('all');

  const filteredProducts = products.filter((p) => {
    const prediction = predictions[p.id];
    if (filter === 'reorder') return prediction === 'Reorder';
    if (filter === 'noReorder') return prediction === 'No Reorder';
    return true;
  });

  return (
    <>
      <ButtonGroup className="mb-3">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('all')}
        >
          Show All
        </Button>
        <Button
          variant={filter === 'reorder' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('reorder')}
        >
          Show Reorder Only
        </Button>
        <Button
          variant={filter === 'noReorder' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('noReorder')}
        >
          Show No Reorder Only
        </Button>
      </ButtonGroup>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Current Inventory</th>
              <th>Avg Sales/Week</th>
              <th>Lead Time (Days)</th>
              <th>Reorder Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No products to display.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const prediction = predictions[p.id];
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.currentInventory}</td>
                    <td>{p.avgSalesPerWeek}</td>
                    <td>{p.leadTimeDays}</td>
                    <td>
                      {prediction === 'Reorder' ? (
                        <Badge bg="danger">{prediction}</Badge>
                      ) : (
                        <Badge bg="success">{prediction}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ProductTable;
