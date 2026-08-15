import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/pages/AuthShell";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  const waLink = "https://wa.me/917777930377?text=" + encodeURIComponent("Hi, I'd like to get access to the TradeAcademy stock market course.");

  return (
    <AuthShell title="Student Login" subtitle="Log in with the credentials issued by your administrator."
      footer={
        <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
          Don't have an account?
          <a href={waLink} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-contact-link"
            className="inline-flex items-center gap-1.5 text-emerald font-semibold hover:underline">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.96 11.96 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.945a11.9 11.9 0 00-3.481-8.418" />
            </svg>
            Contact us on WhatsApp
          </a>
        </span>
      }>
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div>
          <Label className="text-slate-300">Email Address</Label>
          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-testid="login-email" className="mt-1.5 bg-navy-2 border-white/10" placeholder="you@example.com" />
        </div>
        <div>
          <Label className="text-slate-300">Password</Label>
          <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            data-testid="login-password" className="mt-1.5 bg-navy-2 border-white/10" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} data-testid="login-submit"
          className="btn-emerald w-full font-semibold py-3 rounded-full disabled:opacity-60">
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      <p className="mt-5 text-xs text-slate-500 text-center">
        Accounts are created by an administrator. Once you log in, you can change your password from your profile.
      </p>
    </AuthShell>
  );
}
