import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
import AIBannerGenerator from './AIBannerGenerator.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <AIBannerGenerator />
    {/* <CanvasEditor /> */}
  </StrictMode>,
)
