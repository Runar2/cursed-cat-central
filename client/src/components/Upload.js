import React, { useState } from 'react';

function Upload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes

        // validate file type
        if (selectedFile && !['image/jpeg', 'image/png'].includes(selectedFile.type)) {
            setMessage('only .jpg and .png files are allowed!');
            setFile(null);
            return;
        }

        // validate file size
        if (selectedFile && selectedFile.size > maxSize) {
            setMessage('file size must be under 5MB!');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return setMessage('please select a file first!');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setMessage('image uploaded successfully! :3');
                setFile(null); // reset file input

                // clear message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('upload failed!');
            }
        } catch (error) {
            setMessage('error during upload');
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <h1>upload new image :3</h1>
            <form onSubmit={handleUpload} style={styles.form}>
                <input type="file" onChange={handleFileChange} required style={styles.fileInput} />
                <button type="submit" style={styles.button}>upload</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#fffbf0',
        borderRadius: '10px',
        maxWidth: '400px',
        margin: 'auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    fileInput: {
        margin: '10px 0',
        padding: '8px',
        backgroundColor: '#ffccf9',
        border: '2px solid #ff99d5',
        borderRadius: '8px',
    },
    button: {
        backgroundColor: '#ff66b3',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s',
    },
    message: {
        color: '#ff66b3',
        fontWeight: 'bold',
        marginTop: '10px',
    },
};

export default Upload;
