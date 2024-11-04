import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImageLoader from './components/ImageLoader';
import Login from './components/Login';
import Upload from './components/Upload';

function App() {
    return (
        <Router>
            <div className="container">
                <Navbar />
                <Routes>
                    <Route path="/" element={<ImageLoader />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/upload" element={<Upload />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;