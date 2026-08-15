import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Mail, Shield, LogOut, Save, Lock, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const hasPassword = user?.auth_provider === "password";
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const navigate = useNavigate();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      setUser(data);
      toast.success("Profile updated");
    } catch { toast.error("Could not update profile"); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) return toast.error("New passwords do not match");
    if (pw.new_password.length < 6) return toast.error("New password must be at least 6 characters");
    setChangingPw(true);
    try {
      const { data } = await api.post("/auth/change-password", {
        current_password: hasPassword ? pw.current_password : undefined,
        new_password: pw.new_password,
      });
      toast.success(data.message);
      setPw({ current_password: "", new_password: "", confirm: "" });
      if (!hasPassword) setUser({ ...user, auth_provider: "password" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update password");
    } finally { setChangingPw(false); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <div className="pt-16 relative z-10 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <p className="overline text-emerald mb-2">Profile Settings</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mb-8">Your Profile</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald/20 text-emerald flex items-center justify-center text-2xl font-bold font-heading">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-xl font-bold">{user?.name}</p>
            <p className="text-sm text-slate-400 capitalize">{user?.role} account · via {user?.auth_provider}</p>
          </div>
        </div>

        <form onSubmit={save} className="rounded-2xl border border-white/10 bg-navy-2 p-7 space-y-5" data-testid="profile-form">
          <div>
            <Label className="text-slate-300 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="profile-name" className="mt-1.5 bg-navy border-white/10" />
          </div>
          <div>
            <Label className="text-slate-300 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</Label>
            <Input value={user?.email} disabled className="mt-1.5 bg-navy border-white/10 opacity-60" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <Label className="text-slate-300 flex items-center gap-2"><Shield className="w-4 h-4" /> Role</Label>
            <Input value={user?.role} disabled className="mt-1.5 bg-navy border-white/10 opacity-60 capitalize" />
          </div>
          <button type="submit" disabled={saving} data-testid="profile-save"
            className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-white/10 bg-navy-2 p-7 space-y-5 mt-6" data-testid="password-form">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald" />
            <h3 className="font-heading text-lg font-bold">{hasPassword ? "Change Password" : "Set a Password"}</h3>
          </div>
          {!hasPassword && (
            <p className="text-sm text-slate-400 -mt-2">You signed in with Google. Set a password to also enable email + password login.</p>
          )}
          {hasPassword && (
            <div>
              <Label className="text-slate-300 flex items-center gap-2"><Lock className="w-4 h-4" /> Current Password</Label>
              <Input type="password" required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                data-testid="current-password" className="mt-1.5 bg-navy border-white/10" placeholder="••••••••" />
            </div>
          )}
          <div>
            <Label className="text-slate-300 flex items-center gap-2"><Lock className="w-4 h-4" /> New Password</Label>
            <Input type="password" required value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
              data-testid="new-password" className="mt-1.5 bg-navy border-white/10" placeholder="At least 6 characters" />
          </div>
          <div>
            <Label className="text-slate-300 flex items-center gap-2"><Lock className="w-4 h-4" /> Confirm New Password</Label>
            <Input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              data-testid="confirm-password" className="mt-1.5 bg-navy border-white/10" placeholder="Re-enter new password" />
          </div>
          <button type="submit" disabled={changingPw} data-testid="password-save"
            className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 disabled:opacity-60">
            <KeyRound className="w-4 h-4" /> {changingPw ? "Updating…" : hasPassword ? "Update Password" : "Set Password"}
          </button>
        </form>

        <button onClick={handleLogout} data-testid="profile-logout"
          className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
