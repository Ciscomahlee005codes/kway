import { HashRouter } from "react-router-dom"
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from "./Context/ThemeContext.jsx"
import { LanguageProvider } from "./Context/LanguageContext.jsx"
import App from './App.jsx'
import { AuthContextProvider } from "./Context/AuthContext.jsx"

createRoot(document.getElementById('root')).render(
  <HashRouter>
  <AuthContextProvider>
    <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider> 
  </AuthContextProvider>
  </HashRouter>,
)
