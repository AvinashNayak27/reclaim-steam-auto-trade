
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  ReclaimProofRequest,
} from "@reclaimprotocol/js-sdk";

function ReclaimDemo() {
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const getVerificationReq = async () => {
    const app_id = "0x6B30EdbC32CfD801F3A8F0E7e95C6Ebd43E22589";
    const app_secret =
      "0x2ca6534d0c704b99e9a5df01f3f74dc458b393b4d3c92f0c7d3deaf1ffca63e7";
    const provider_id = "e811d463-5f22-417d-97c8-e82d91373935";

    let isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLocaleLowerCase()
      ) || window.orientation > -1;
    navigator.userAgent.toLocaleLowerCase().includes("android");
    let isAppleDevice =
      /mac|iphone|ipad|ipod/i.test(navigator.userAgent.toLocaleLowerCase()) ||
      void 0;
    let deviceType = isMobileDevice
      ? isAppleDevice
        ? "ios"
        : "android"
      : "desktop";

    const reclaimProofRequest = await ReclaimProofRequest.init(
      app_id,
      app_secret,
      provider_id,
      {
        device: deviceType,
        useAppClip: "desktop" !== deviceType,
      }
    );
    reclaimProofRequest.setParams({
      item: itemName,
      amount: itemPrice,
    });
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    const statusUrl = await reclaimProofRequest.getStatusUrl();
    localStorage.setItem("statusUrl", statusUrl);

    setRequestUrl(requestUrl);

    await reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        if (typeof proofs === "string") return proofs;
        let proofsArray = [];
        if (proofs) {
          proofsArray = Array.isArray(proofs) ? proofs : [proofs];
        }

        setProofs(proofsArray);
        setRequestUrl("");
      },
      onError: (error) => {
        console.error("Verification failed", error);
      },
    });
  };

  useEffect(() => {
    const statusUrl = localStorage.getItem("statusUrl");
    if (statusUrl) {
      console.log("Status URL:", statusUrl);
      fetch(statusUrl)
        .then((response) => response.json())
        .then((res) => {
          if (res.session?.proofs) {
            setProofs(res.session.proofs);
          }
        })
        .catch((error) => {
          console.error("Error fetching proofs:", error);
        });
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      padding: '1.5rem',
      backgroundColor: '#111827',
      color: 'white',
      minHeight: '100vh',
      width: '100%'
    }}>
      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Auto Steam Market Trade
      </h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '32rem'
      }}>
        <input 
          type="text" 
          placeholder="Item Name" 
          value={itemName} 
          onChange={(e) => setItemName(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #374151',
            backgroundColor: '#1F2937',
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <input 
          type="text" 
          placeholder="Item Price" 
          value={itemPrice} 
          onChange={(e) => setItemPrice(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #374151',
            backgroundColor: '#1F2937',
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>
      <button 
        onClick={getVerificationReq}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3B82F6',
          color: 'white',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          ':hover': {
            backgroundColor: '#2563EB'
          }
        }}
      >
        Get Verification Request
      </button>
      {requestUrl && !proofs.length && (
        <div style={{
          width: '100%',
          maxWidth: '32rem',
          padding: '1.5rem',
          backgroundColor: '#1F2937',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
            <div style={{
              margin: '1.25rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <p style={{
                fontSize: '1.125rem',
                marginBottom: '0.75rem'
              }}>
                Scan or tap (if on mobile) the QR Code to Verify
              </p>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onClick={() => window.open(requestUrl, "_blank")}
              >
                <QRCode
                  value={requestUrl}
                  size={180}
                  onClick={() => window.open(requestUrl, "_blank")}
                />
              </div>
            </div>
        </div>
      )}
      {proofs.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '32rem',
          padding: '1.5rem',
          backgroundColor: '#1F2937',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#4ADE80'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{width: '1.5rem', height: '1.5rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>Verification Successful!</p>
            </div>
            <div style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#374151',
              borderRadius: '0.5rem',
              overflow: 'auto',
              maxHeight: '12rem'
            }}>
              <pre style={{
                fontSize: '0.875rem',
                color: '#D1D5DB'
              }}>
                {JSON.stringify(proofs, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReclaimDemo;