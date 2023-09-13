import React, { useState, useEffect } from "react";
import { Container, Col, Row } from "react-bootstrap";
import "./App.css";
import Register from "./Register";
import Login from "./Login";

function App() {
  // const [message, setMessage] = useState("");

  // useEffect(() => {
  //   fetch("/app")
  //     .then((res) => res.json())
  //     .then((data) => setMessage(data.message));
  // }, []);

  return (
    <Container>
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Register />
          <Login />
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}></Col>
      </Row>
    </Container>
  );
}

export default App;
