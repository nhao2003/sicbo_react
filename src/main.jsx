import ReactDOM from 'react-dom/client';
import './index.css';
import React, { useState, useEffect } from 'react';
import WelcomePage from './Welcome.jsx';
import App from './App.jsx';

const Root = () => {
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

    useEffect(() => {
        const checkMetaMaskInstalled = async () => {
            // Kiểm tra xem MetaMask đã cài đặt hay chưa
            if (window.ethereum && window.ethereum.selectedAddress){
                setIsMetaMaskInstalled(true);
            } else {
                setIsMetaMaskInstalled(false);
            }
        };

        checkMetaMaskInstalled();
    }, []);

    return (
        <>
            {isMetaMaskInstalled ? <App /> : <WelcomePage />}
        </>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
