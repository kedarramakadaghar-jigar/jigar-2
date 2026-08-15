import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import AuthShell from "@/pages/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success(data.message);
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send reset instructions."
      footer={<>Remembered it? <Link to="/login" className="text-emerald hover:underline">Back to Login</Link></>}>
      {sent ? (
        <div className="rounded-xl border border-emerald/30 bg-emerald/10 p-6 text-sm text-slate-200" data-testid="forgot-sent">
          If an account exists for <span className="font-semibold">{email}</span>, password reset instructions have been sent to your email.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
          <div>
            <Label className="text-slate-300">Email Address</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              data-testid="forgot-email" className="mt-1.5 bg-navy-2 border-white/10" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} data-testid="forgot-submit"
            className="btn-emerald w-full font-semibold py-3 rounded-full disabled:opacity-60">
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
