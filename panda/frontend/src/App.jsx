import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BuilderPage from './pages/BuilderPage';
import PreviewPage from './pages/PreviewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
