import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// TODO: Replace with your actual Firebase config from the console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [phone, setPhone] = useState('+1');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const sendSms = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setStep('otp');
      alert("SMS Sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send SMS. Check console.");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      console.log("Result: ", result)
      
      // SEND TO YOUR NODE.JS SERVER
      // const response = await fetch('http://localhost:5000/verify-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ idToken })
      // });
      
      // const data = await response.json();
      // console.log("Server Response:", data);
      // alert(`Verified! Server says user is: ${data.uid}`);
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h2>Firebase OTP Tester</h2>
      <div id="recaptcha-container"></div>

      {step === 'phone' ? (
        <>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+123456789" />
          <button onClick={sendSms}>Send SMS</button>
        </>
      ) : (
        <>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
          <button onClick={verifyOtp}>Verify & Send to Server</button>
        </>
      )}
    </div>
  );
}

export default App;