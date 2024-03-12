import React, { useEffect } from "react";
import script from "./script";
import "./MetaMaskLogo.css";
function MetaMaskLogo() {
  useEffect(() => {
    console.log("script", script.length);
    const scriptElement = document.createElement("script");
    scriptElement.innerHTML = script;
    document
      .getElementById("metamask-logo")
      .appendChild(scriptElement);
  }, []);

  return (
    <div id="metamask-logo"></div>
  );
}

export { MetaMaskLogo };
