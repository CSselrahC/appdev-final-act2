import React from 'react';
import { Alert } from 'react-bootstrap';

function SummaryDashboard({ total, reorder, noReorder, isTraining }) {
    return (
        <>
            <h5>Summary</h5>
            <p>Total products: {total}</p>
            <p>Products to reorder: {reorder}</p>
            <p>Products sufficient in stock: {noReorder}</p>

            {isTraining && <Alert variant="info">Model is training, please wait...</Alert>}
        </>
    );
}

export default SummaryDashboard;