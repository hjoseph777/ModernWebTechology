import { useState } from 'react'
import ImageGallery from './components/ImageGallery'
import RandomDog from './components/RandomDog'
import './App.css'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleImageUploaded = (newImage) => {
    console.log('New image uploaded:', newImage)
    // Trigger gallery refresh when new image is uploaded
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>CPAN 212 - Lab 3: Express + React Image Gallery</h1>
        <p>Upload and view images with random dog fetching functionality</p>
      </header>

      <main className="app-main">
        <RandomDog onImageUploaded={handleImageUploaded} />
        <ImageGallery refreshTrigger={refreshTrigger} />
      </main>

      <footer className="app-footer">
        <p>Built with Vite + React + Express</p>
      </footer>
    </div>
  )
}

export default App
