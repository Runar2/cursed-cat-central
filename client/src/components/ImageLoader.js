import React, { useState, useEffect, useRef } from 'react';
import './ImageLoader.css';

function ImageLoader() {
    const [currentImage, setCurrentImage] = useState(null);
    const [isSpinningOut, setIsSpinningOut] = useState(false);
    const [shouldSpin, setShouldSpin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // state to check admin status
    const incomingImageRef = useRef(null);

    // fetches and preloads the next image
    const preloadNextImage = async () => {
        try {
            const response = await fetch('/local-images');
            if (response.ok) {
                const newImageUrl = response.url + '?' + new Date().getTime();
                incomingImageRef.current = newImageUrl;
            } else {
                console.error('error loading image');
            }
        } catch (error) {
            console.error('error:', error);
        }
    };

    // handles the full transition when button is clicked
    const loadRandomImage = () => {
        setIsSpinningOut(true);
        setShouldSpin(true);

        setTimeout(() => {
            setCurrentImage(incomingImageRef.current);
            setIsSpinningOut(false);
            preloadNextImage();
        }, 1000);
    };

    // check if the user is admin on component load
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch('/check-admin-status');
                const data = await response.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error('error checking admin status:', error);
            }
        };
    
        checkAdminStatus();
        preloadNextImage().then(() => {
            // set the initial image
            setCurrentImage(incomingImageRef.current);
            setShouldSpin(false);
            // immediately preload another one so we have a new random image ready for the first click :3
            preloadNextImage();
        });
    }, []);

    // delete the current image
    const deleteImage = async () => {
        try {
            // make sure we are getting the correct filename after the last "/"
            let filename = currentImage.split('/').pop();
    
            // if for some reason filename is still not right, log an error and return
            if (!filename || filename.includes('/')) {
                console.error('Error: Filename is still incorrect:', filename);
                return;
            }
    
            // strip off any query parameters
            filename = filename.split('?')[0];
    
            console.log('Filename to delete:', filename); // double-check in the logs
    
            const response = await fetch('/delete-image', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
            });
    
            if (response.ok) {
                alert(`Image ${filename} deleted successfully!`);
                preloadNextImage().then(() => {
                    setCurrentImage(incomingImageRef.current);
                });
            } else {
                alert('Failed to delete image');
            }
        } catch (error) {
            console.error('error deleting image:', error);
        }
    };

    return (
        <div className="image-loader-container">
            <h1>Cursed Cat Central :3</h1>
            {currentImage ? (
                <img
                    src={currentImage}
                    alt="random from cursed cat central"
                    className={`image ${shouldSpin && (isSpinningOut ? 'spin-out' : 'spin-in')}`}
                />
            ) : (
                <p>loading image...</p>
            )}
            <br />
            <button onClick={loadRandomImage} className="button">load new image</button>
            {isAdmin && (
                <button onClick={deleteImage} className="button">delete current image</button>
            )}
        </div>
    );
}

export default ImageLoader;