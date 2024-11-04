import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/upload" style={styles.link}>Upload</Link>
        </nav>
    );
}

const styles = {
    nav: {
        backgroundColor: '#ff66b3',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.2em',
    },
};

export default Navbar;