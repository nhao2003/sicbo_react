import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./Welcome.css";
import Web3 from "web3";
import { MetaMaskLogo } from "./components/MetaMaskLogo/MetaMaskLogo.jsx";

function WelcomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const isInstalled = typeof window.ethereum !== "undefined";
  useEffect(() => {
    const checkMetamaskConnection = async () => {
      // Kiểm tra xem có kết nối Metamask không
      // CHeck of the user installed Metamask
      if (window.ethereum && window.ethereum.selectedAddress) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };

    checkMetamaskConnection();

    if (window.ethereum)
      window.ethereum.on("accountsChanged", async (accounts) => {
        // Reload lại trang khi tài khoản thay đổi
        window.location.reload();
      });

    return () => {
      window.ethereum.removeAllListeners("accountsChanged");
    };
  }, []);

  const connectMetamask = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("Kết nối Metamask thất bại:", error);
    }
  };
  const installMetamask = async () => {
    window.open("https://metamask.io/download/", "_blank");
  };
  return (
    <div style={{ textAlign: "center" }}>
              <MetaMaskLogo />

      <h1>Welcome to Sicbo game</h1>
      <button onClick={isInstalled ? connectMetamask : installMetamask}>
          {isInstalled ? "Connect" : "Install"} Metamask
        </button>
    </div>
  );
}

export default WelcomePage;
