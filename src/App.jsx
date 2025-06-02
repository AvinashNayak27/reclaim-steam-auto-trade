const app_id = "0x6B30EdbC32CfD801F3A8F0E7e95C6Ebd43E22589";
const app_secret =
  "0x2ca6534d0c704b99e9a5df01f3f74dc458b393b4d3c92f0c7d3deaf1ffca63e7";
const provider_id = "e811d463-5f22-417d-97c8-e82d91373935";

import { useState } from "react";
import QRCode from "react-qr-code";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import "./App.css";

function ReclaimDemo() {
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState([]);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");

  const getVerificationReq = async () => {
    // Your credentials from the Reclaim Protocol Developer Portal
    const APP_ID = app_id;
    const APP_SECRET = app_secret;
    const PROVIDER_ID = provider_id;

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID
    );

    reclaimProofRequest.setParams({
      item: item.toString(),
      amount: (amount * 100).toString(),
    });

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: (proofs) => {
        setProofs(proofs);
      },
      // Called if there's an error during verification
      onError: (error) => {
        console.error("Verification failed", error);
      },
    });
  };

  return (
    <div className="reclaim-container">
      <div className="input-group">
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Enter item name"
          className="reclaim-input"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="reclaim-input"
        />
      </div>
      <button onClick={getVerificationReq} className="reclaim-button">
        Get Verification Request
      </button>
      {requestUrl && (
        <div className="qr-container" onClick={() => window.open(requestUrl, "_blank")}>
          <QRCode value={requestUrl} />
        </div>
      )}
      {proofs && (
        <div className="proof-container">
          <h2>Verification Successful!</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ReclaimDemo;
