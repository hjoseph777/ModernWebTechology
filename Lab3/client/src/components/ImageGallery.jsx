import { useState, useEffect } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ refreshTrigger }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/images');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.images) {
        setImages(data.images);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId, imageName) => {
    // Confirm deletion with user
    const confirmed = window.confirm(
      `Are you sure you want to delete this image?\n\nFile: ${imageName || 'Unknown'}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(imageId);
      setMessage(null);
      
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: `✅ Image deleted successfully! ${data.remainingCount} images remaining.`
        });
        
        // Refresh images after successful deletion
        await fetchImages();
      } else {
        throw new Error(data.error || 'Failed to delete image');
      }
      
    } catch (err) {
      console.error('Error deleting image:', err);
      setMessage({
        type: 'error', 
        text: `❌ Error deleting image: ${err.message}`
      });
    } finally {
      setDeleting(null);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="image-gallery">
        <h2>Image Gallery</h2>
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="image-gallery">
        <h2>Image Gallery</h2>
        <div className="error">
          Error loading images: {error}
          <button onClick={fetchImages} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h2>Image Gallery ({images.length} images)</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {images.length === 0 ? (
        <div className="no-images">
          <p>No images found.</p>
        </div>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <div className="image-container">
                <img 
                  src={image.url} 
                  alt={`Image ${image.id}`}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f0f0f0"/><text x="100" y="75" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="%23666">Image not found</text></svg>';
                  }}
                />
                {image.source !== 'seed' && (
                  <button
                    className={`delete-btn ${deleting === image.id ? 'deleting' : ''}`}
                    onClick={() => handleDelete(image.id, image.filename)}
                    disabled={deleting === image.id}
                    title="Delete this image"
                  >
                    {deleting === image.id ? '⏳' : '🗑️'}
                  </button>
                )}
              </div>
              <div className="image-info">
                <p className="image-source">
                  <strong>Source:</strong> {image.source}
                </p>
                <p className="image-date">
                  <strong>Uploaded:</strong> {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
                {image.filename && (
                  <p className="image-filename">
                    <strong>File:</strong> {image.filename}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={fetchImages} className="refresh-btn">
        Refresh Gallery
      </button>
    </div>
  );
};

export default ImageGallery;