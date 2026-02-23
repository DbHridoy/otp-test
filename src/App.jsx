import { useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase";

const getFriendlyError = (error) => {
  const code = error?.code || "auth/unknown";
  const base = `${code}: ${error?.message || "Request failed"}`;

  if (code === "auth/operation-not-allowed") {
    return `${base}\nEnable Phone sign-in in Firebase Console > Authentication > Sign-in method.`;
  }
  if (code === "auth/invalid-phone-number") {
    return `${base}\nUse a real E.164 phone number, e.g. +14155552671.`;
  }
  if (code === "auth/invalid-app-credential") {
    return `${base}\nreCAPTCHA token is invalid/expired. Complete the checkbox again and retry.`;
  }
  if (code === "auth/too-many-requests") {
    return `${base}\nToo many attempts. Wait and try again later.`;
  }

  return base;
};

export default function App() {
  const [phone, setPhone] = useState("+14155552671");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [msg, setMsg] = useState("");
  const recaptchaVerifierRef = useRef(null);
  const confirmationResultRef = useRef(null);

  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal",
    });

    return recaptchaVerifierRef.current;
  };

  const clearRecaptcha = () => {
    if (!recaptchaVerifierRef.current) return;
    recaptchaVerifierRef.current.clear();
    recaptchaVerifierRef.current = null;
  };

  const sendOtp = async () => {
    try {
      setMsg("");
      const verifier = setupRecaptcha();

      const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);

      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setMsg("OTP sent. Now enter the code.");
    } catch (e) {
      if (e?.code === "auth/invalid-app-credential") {
        clearRecaptcha();
      }
      setMsg(getFriendlyError(e));
    }
  };

  const verifyOtp = async () => {
    try {
      setMsg("");
      if (!confirmationResultRef.current) {
        setMsg("Please request OTP first.");
        return;
      }

      const result = await confirmationResultRef.current.confirm(code);
      const user = result.user;

      const idToken = await user.getIdToken();
      setMsg(`✅ Verified! Phone: ${user.phoneNumber}\nToken: ${idToken.slice(0, 25)}...`);
    } catch (e) {
      setMsg(getFriendlyError(e));
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Firebase Phone OTP Test</h2>

      {step === "phone" ? (
        <>
          <label>Phone (E.164 format)</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 8 }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+14155552671"
          />
          <button style={{ marginTop: 12, padding: 10, width: "100%" }} onClick={sendOtp}>
            Send OTP
          </button>
        </>
      ) : (
        <>
          <label>OTP Code</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 8 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />
          <button style={{ marginTop: 12, padding: 10, width: "100%" }} onClick={verifyOtp}>
            Verify OTP
          </button>

          <button
            style={{ marginTop: 10, padding: 10, width: "100%" }}
            onClick={() => {
              setStep("phone");
              setCode("");
              setMsg("");
            }}
          >
            Back
          </button>
        </>
      )}

      {/* required for recaptcha */}
      <div id="recaptcha-container"></div>

      {msg && (
        <pre style={{ marginTop: 16, background: "#f5f5f5", padding: 12, whiteSpace: "pre-wrap" }}>
          {msg}
        </pre>
      )}
    </div>
  );
}
