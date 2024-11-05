import React, { useEffect, useRef, useState } from 'react';
import './ImageLoader.css';

const ImageLoader = () => {
    const [currentImage, setCurrentImage] = useState(null);
    const [isSpinningOut, setIsSpinningOut] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const incomingImageRef = useRef(null);

    const preloadNextImage = async () => {
        try {
            const response = await fetch('YOUR_IMAGE_API_ENDPOINT');
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

    const loadRandomImage = () => {
        setIsSpinningOut(true);

        setTimeout(() => {
            setCurrentImage(incomingImageRef.current);
            setIsSpinningOut(false);
            preloadNextImage();
        }, 1000);
    };

    useEffect(() => {
        preloadNextImage().then(() => {
            setCurrentImage(incomingImageRef.current);
            setIsInitialLoad(false);
        });
    }, []);

    return (
        <div className="image-loader-container">
            <h1>random image loader nya~ :3</h1>
            {currentImage ? (
                <img
                    src={currentImage}
                    alt="random from cursed cat central"
                    className={`image ${isInitialLoad ? '' : isSpinningOut ? 'spin-out' : 'spin-in'}`}
                />
            ) : (
                <p>loading image...</p>
            )}
            <br />
            <button onClick={loadRandomImage} className="button">load new image</button>
        </div>
    );
}

export default ImageLoader;
