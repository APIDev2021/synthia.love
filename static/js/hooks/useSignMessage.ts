import React from "react";
import * as ethers from "ethers";

export function useSignMessage() {
  const [signature, updateSignature] = React.useState("");
  const asyncSignMessage = async (message: string) => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      updateSignature(signature);
      return signature;
    }
  };
  return { asyncSignMessage, signature };
}
