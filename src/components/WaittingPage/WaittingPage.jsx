import { Button } from "antd/es/radio";
import { MetaMaskLogo } from "../MetaMaskLogo/MetaMaskLogo";

function WaittingPage() {
  return (
    <div style={{ textAlign: "center" }}>
      <MetaMaskLogo />

      <h1>Game is not started</h1>
      {/* Subtitle */}
        <p>Please wait for the game to start</p>
      <button
        onClick={() => {
          window.location.reload();
        }}
        type="primary"
      >
        Refresh
      </button>
    </div>
  );
}

export { WaittingPage };
