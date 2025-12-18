import { HashRouter } from "react-router-dom"
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from "./Context/ThemeContext.jsx"
import { LanguageProvider } from "./Context/LanguageContext.jsx"
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <HashRouter>
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider> 
  </HashRouter>,
)
