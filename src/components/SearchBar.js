import React from 'react';
import { Form } from 'react-bootstrap';

function SearchBar({ filterText, onFilterTextChange }) {
    return (
        <Form className="mb-3">
            <Form.Control
                type="text"
                placeholder="Search products by name..."
                value={filterText}
                onChange={(e) => onFilterTextChange(e.target.value)}
                aria-label="Search products"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
        </Form>
    );
}

export default SearchBar;