import React from 'react';
import { Form } from 'react-bootstrap';

function SearchBar({ filterText, onFilterTextChange }) {
    return (
        <Form className="mb-3">
            <Form.Control
                type="text"
                placeholder="Search products by name..."
                value={filterText}
                onChange={e => onFilterTextChange(e.target.value)}
                aria-label="Search products"
            />
        </Form>
    );
}

export default SearchBar;