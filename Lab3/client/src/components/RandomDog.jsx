import { useState } from 'react';
import './RandomDog.css';

const RandomDog = ({ onImageUploaded }) => {
  const [dogImage, setDogImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRandomDog = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.message) {
        setDogImage(data.message);
        setMessage('Random dog image fetched successfully!');
      } else {
        throw new Error('Failed to fetch dog image');
      }
    } catch (err) {
      console.error('Error fetching random dog:', err);
      setError(`Failed to fetch random dog: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadToServer = async () => {
    if (!dogImage) {
      setError('No dog image to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setMessage('Uploading image...');

      // Fetch the dog image as a blob
      const imageResponse = await fetch(dogImage);
      
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch dog image for upload');
      }
      
      const imageBlob = await imageResponse.blob();
      
      // Create FormData to send the image
      const formData = new FormData();
      formData.append('image', imageBlob, 'random-dog.jpg');
      formData.append('source', 'random-dog');

      // Upload to our server
      const uploadResponse = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      
      if (result.success) {
        setMessage('🎉 Image uploaded successfully to server!');
        // Clear current image and notify parent to refresh gallery
        setDogImage(null);
        if (onImageUploaded) {
          onImageUploaded(result.image);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="random-dog">
      <h2>Random Dog Fetcher</h2>
      
      <div className="controls">
        <button 
          onClick={fetchRandomDog} 
          disabled={loading}
          className="fetch-btn"
        >
          {loading ? 'Fetching...' : 'Get Random Dog 🐕'}
        </button>
      </div>

      {message && (
        <div className="message success">
          {message}
        </div>
      )}

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {dogImage && (
        <div className="dog-display">
          <img 
            src={dogImage} 
            alt="Random dog" 
            className="dog-image"
          />
          <div className="upload-section">
            <p className="upload-prompt">
              Like this dog? Upload it to your gallery!
            </p>
            <button 
              onClick={uploadToServer}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? 'Uploading...' : 'Upload to Server 📤'}
            </button>
          </div>
        </div>
      )}

      <div className="instructions">
        <p>
          Click "Get Random Dog" to fetch a random dog image from dog.ceo API, 
          then click "Upload to Server" to save it to your gallery.
        </p>
      </div>
    </div>
  );
};

export default RandomDog;