import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'
import './index.css'

// Apply saved invert mode immediately on page load
const isInverted = localStorage.getItem('invertMode') === 'true'
if (isInverted) {
    document.documentElement.style.filter = 'invert(1)'
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)