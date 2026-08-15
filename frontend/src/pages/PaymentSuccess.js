import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const MAX_TRIES = 8;

export default function PaymentSuccess() {
  const [state, setState] = useState("checking"); // checking | paid | failed | timeout
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    document.title = "Payment | TradeAcademy";
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) { setState("failed"); return; }

    let tries = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setDetail(data);
          setState("paid");
          await checkAuth(); // refresh user so plan/access updates
          return;
        }
        if (["failed", "expired"].includes(data.payment_status)) { setState("failed"); return; }
      } catch { /* keep trying */ }
      tries += 1;
      if (tries >= MAX_TRIES) { setState("timeout"); return; }
      setTimeout(poll, 2000);
    };
    poll();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy relative px-5">
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-navy-2 p-10 text-center" data-testid="payment-success-page">
        {state === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-emerald animate-spin mx-auto mb-5" />
            <h1 className="font-heading text-2xl font-extrabold mb-2">Confirming your payment…</h1>
            <p className="text-slate-400 text-sm">Please wait a moment, don't close this page.</p>
          </>
        )}
        {state === "paid" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold mb-2" data-testid="payment-success-title">Payment successful! 🎉</h1>
            <p className="text-slate-400 text-sm mb-6">Your <span className="text-emerald font-semibold">{detail?.plan === "premium" ? "Premium / Advanced" : "Full Course"}</span> access is now unlocked. Happy learning!</p>
            <button onClick={() => navigate("/dashboard")} data-testid="go-dashboard-btn" className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
        {(state === "failed" || state === "timeout") && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-9 h-9 text-red-400" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold mb-2">{state === "timeout" ? "Still processing" : "Payment not completed"}</h1>
            <p className="text-slate-400 text-sm mb-6">
              {state === "timeout"
                ? "Your payment is taking longer than usual. If it went through, your access will unlock shortly — check your dashboard."
                : "We couldn't confirm your payment. If you were charged, please contact us and we'll sort it out."}
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn-emerald font-semibold px-6 py-3 rounded-full">Go to Dashboard</button>
          </>
        )}
      </div>
    </div>
  );
}
