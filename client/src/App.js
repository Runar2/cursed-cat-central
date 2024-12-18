import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImageLoader from './components/ImageLoader';
import Login from './components/Login';
import Upload from './components/Upload';

function App() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch('/check-admin-status');
                const data = await response.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        };

        checkAdminStatus();
    }, []);

    return (
        <Router>
            <div className="container">
                <Navbar isAdmin={isAdmin} />
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