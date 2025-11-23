import React from 'react';

import { Card, Row, Col, Alert } from 'react-bootstrap';

function SummaryDashboard({ total, reorder, noReorder, isTraining }) {
    return (
        <Row className="mb-4 g-3">
            <Col md={4}>
                <Card bg="info" text="dark" className="text-center">
                    <Card.Body>
                        <Card.Title>Total Products</Card.Title>
                        <Card.Text className="display-5">{total}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card bg="danger" text="light" className="text-center">
                    <Card.Body>
                        <Card.Title>Reorder Needed</Card.Title>
                        <Card.Text className="display-5">{reorder}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card bg="success" text="light" className="text-center">
                    <Card.Body>
                        <Card.Title>Sufficient Stock</Card.Title>
                        <Card.Text className="display-5">{noReorder}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            {isTraining && (
                <Col md={12}>
                    <Alert variant="info" className="mt-3">
                        Model is training, please wait...
                    </Alert>
                </Col>
            )}
        </Row>
    );
}

export default SummaryDashboard;
