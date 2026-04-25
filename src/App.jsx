import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from './firebase';

function App() {
  const [phone, setPhone] = useState('+880');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'

  const setupRecaptcha = () => {
    // Always clear old verifier to avoid "container already used" errors
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal'
      });
    } catch (err) {
      console.error("Recaptcha initialization failed:", err);
    }
  };

  const sendSms = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      await appVerifier.render();
      window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setStep('otp');
      alert("SMS Sent! (If using a test number, use your test code)");
    } catch (err) {
      console.error("Full error object:", err);
      
      // Cleanup on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      if (err.code === 'auth/invalid-app-credential') {
        alert("Error: auth/invalid-app-credential\n\nCheck Firebase Console > Authentication > Settings > Authorized Domains and add 'localhost'.");
      } else if (err.code === 'auth/too-many-requests') {
        alert("Error: too-many-requests\n\nFirebase has blocked this number temporarily. PLEASE ADD THIS NUMBER AS A TEST NUMBER in the Firebase Console to bypass this block.");
      } else {
        alert(`Failed to send SMS: ${err.code || err.message}`);
      }
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log("Result: ", result)
      alert("Verified successfully!");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h2>Firebase OTP Tester</h2>
      <p>Enter number in E.164 format (e.g., +8801712345678)</p>
      
      <div style={{ marginBottom: '20px' }}>
        <div id="recaptcha-container"></div>
      </div>

      {step === 'phone' ? (
        <>
          <input 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            placeholder="+123456789" 
            style={{ padding: '10px', width: '200px', marginRight: '10px' }}
          />
          <button onClick={sendSms} style={{ padding: '10px' }}>Send SMS</button>
        </>
      ) : (
        <>
          <input 
            value={otp} 
            onChange={e => setOtp(e.target.value)} 
            placeholder="Enter 6-digit OTP" 
            style={{ padding: '10px', width: '200px', marginRight: '10px' }}
          />
          <button onClick={verifyOtp} style={{ padding: '10px' }}>Verify</button>
        </>
      )}
    </div>
  );
}

export default App;