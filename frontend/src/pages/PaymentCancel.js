import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy relative px-5">
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-navy-2 p-10 text-center" data-testid="payment-cancel-page">
        <div className="w-16 h-16 rounded-full bg-slate-500/15 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-9 h-9 text-slate-400" />
        </div>
        <h1 className="font-heading text-2xl font-extrabold mb-2">Payment cancelled</h1>
        <p className="text-slate-400 text-sm mb-6">No charge was made. You can enrol anytime whenever you're ready.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/#pricing")} className="btn-emerald font-semibold px-6 py-3 rounded-full">View Plans</button>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-3 rounded-full border border-white/15 hover:border-emerald/50 transition-colors">Dashboard</button>
        </div>
      </div>
    </div>
  );
}
