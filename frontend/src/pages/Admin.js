import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Users, BookOpen, Layers, PlayCircle, Radio, MessageSquare, Plus, Trash2, Pencil, Shield, Mail, ShieldCheck, ShieldOff, UserPlus, KeyRound,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search } from "lucide-react";

const emptyLive = { topic: "", description: "", date: "", time: "", instructor: "", level: "All Levels", join_url: "" };
const emptyTest = { name: "", role: "", content: "", rating: 5, avatar: "" };
const emptyLesson = { module_id: "", title: "", description: "", objectives: [], video_url: "", duration: "10 min", order: 0, is_free: false };
const emptyModule = { course_id: "course_main", title: "", description: "", order: 0, is_free: false };

export default function Admin() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [course, setCourse] = useState(null);
  const [live, setLive] = useState([]);
  const [tests, setTests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [pendingRole, setPendingRole] = useState(null); // { user, role }
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student", plan: "" });
  const [resetTarget, setResetTarget] = useState(null); // user
  const [resetPw, setResetPw] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // user

  const loadAll = useCallback(async () => {
    try {
      const [s, u, c, l, t, ct] = await Promise.all([
        api.get("/admin/stats"), api.get("/admin/users"), api.get("/courses/course_main/full"),
        api.get("/live-sessions"), api.get("/testimonials"), api.get("/admin/contacts"),
      ]);
      setStats(s.data); setUsers(u.data); setCourse(c.data); setLive(l.data); setTests(t.data); setContacts(ct.data);
    } catch { toast.error("Failed to load admin data"); }
  }, []);

  useEffect(() => { document.title = "Admin Panel | TradeAcademy"; loadAll(); }, [loadAll]);

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(role === "admin" ? "User promoted to admin" : "Admin access revoked");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not update role");
    } finally {
      setPendingRole(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return true;
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const createUser = async () => {
    if (!newUser.name || !newUser.email || newUser.password.length < 6) {
      return toast.error("Enter name, email and a password of at least 6 characters");
    }
    try {
      await api.post("/admin/users", newUser);
      toast.success(`Account created for ${newUser.name}`);
      setNewUserOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "student", plan: "" });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not create account");
    }
  };

  const resetPassword = async () => {
    if (resetPw.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      await api.post(`/admin/users/${resetTarget.user_id}/reset-password`, { new_password: resetPw });
      toast.success(`Password reset for ${resetTarget.name}`);
      setResetTarget(null);
      setResetPw("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not reset password");
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete(`/admin/users/${pendingDelete.user_id}`);
      toast.success("Account deleted");
      setPendingDelete(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not delete account");
    }
  };

  const genPassword = () => Math.random().toString(36).slice(-4) + Math.random().toString(36).toUpperCase().slice(-4) + "!" + Math.floor(Math.random() * 90 + 10);

  const statCards = [
    { icon: Users, label: "Users", value: stats.users }, { icon: BookOpen, label: "Courses", value: stats.courses },
    { icon: Layers, label: "Modules", value: stats.modules }, { icon: PlayCircle, label: "Lessons", value: stats.lessons },
    { icon: Radio, label: "Live Sessions", value: stats.live_sessions }, { icon: MessageSquare, label: "Messages", value: stats.contacts },
  ];

  return (
    <div className="pt-16 relative z-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-emerald" /><p className="overline text-emerald">Admin Panel</p></div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mb-8">Manage your platform</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-navy-2 p-5" data-testid={`admin-stat-${s.label.toLowerCase()}`}>
              <s.icon className="w-5 h-5 text-emerald mb-3" />
              <p className="font-mono text-2xl font-bold">{s.value ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="content">
          <TabsList className="bg-navy-2 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="live" data-testid="tab-live">Live Sessions</TabsTrigger>
            <TabsTrigger value="testimonials" data-testid="tab-testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          </TabsList>

          {/* CONTENT */}
          <TabsContent value="content" className="mt-6">
            <ContentManager course={course} reload={loadAll} />
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} data-testid="user-search"
                  placeholder="Search by name, email or role…" className="pl-9 bg-navy-2 border-white/10" />
              </div>
              <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                <DialogTrigger asChild>
                  <button data-testid="create-user-btn" className="btn-emerald text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1 shrink-0"><UserPlus className="w-4 h-4" /> Create Student</button>
                </DialogTrigger>
                <DialogContent className="bg-navy-2 border-white/10 text-white">
                  <DialogHeader><DialogTitle>Create Student Account</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label className="text-slate-300">Full Name</Label><Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} data-testid="new-user-name" className="mt-1.5 bg-navy border-white/10" /></div>
                    <div><Label className="text-slate-300">Email (username)</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} data-testid="new-user-email" className="mt-1.5 bg-navy border-white/10" /></div>
                    <div>
                      <Label className="text-slate-300">Password</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} data-testid="new-user-password" className="bg-navy border-white/10" placeholder="At least 6 characters" />
                        <button type="button" onClick={() => setNewUser({ ...newUser, password: genPassword() })} className="text-xs px-3 rounded-lg border border-white/15 text-slate-300 hover:border-emerald/50 whitespace-nowrap">Generate</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={newUser.role === "admin"} onCheckedChange={(v) => setNewUser({ ...newUser, role: v ? "admin" : "student" })} />
                      <Label className="text-slate-300">Make this an admin account</Label>
                    </div>
                    <div>
                      <Label className="text-slate-300">Course access</Label>
                      <select value={newUser.plan} onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })} data-testid="new-user-plan"
                        className="mt-1.5 w-full bg-navy border border-white/10 rounded-md px-3 py-2 text-sm">
                        <option value="">Free (intro modules only)</option>
                        <option value="full">Full Course (all 18 modules)</option>
                        <option value="premium">Premium / Advanced</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500">Share these credentials with the student. They can change their password after logging in.</p>
                  </div>
                  <DialogFooter><button onClick={createUser} data-testid="new-user-save" className="btn-emerald font-semibold px-5 py-2 rounded-full">Create Account</button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-white/10 bg-navy-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-400 border-b border-white/10">
                  <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Plan</th><th className="p-4">Progress</th><th className="p-4 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="border-b border-white/5" data-testid={`user-row-${u.user_id}`}>
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-emerald/20 text-emerald" : "bg-white/5 text-slate-300"}`}>{u.role}</span></td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.plan ? "bg-emerald/15 text-emerald" : "bg-white/5 text-slate-400"}`}>
                          {u.plan === "premium" ? "Premium" : u.plan === "full" ? "Full" : "Free"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{u.progress.completed}/{u.progress.total} ({u.progress.percentage}%)</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setResetTarget(u); setResetPw(""); }} data-testid={`reset-pw-${u.user_id}`}
                            className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/15 text-slate-300 hover:border-emerald/50 hover:text-emerald transition-colors">
                            <KeyRound className="w-3.5 h-3.5" /> Reset PW
                          </button>
                          {u.user_id === me?.user_id ? (
                            <span className="text-xs text-slate-600">You</span>
                          ) : (
                            <>
                              {u.role === "admin" ? (
                                <button onClick={() => setPendingRole({ user: u, role: "student" })} data-testid={`demote-${u.user_id}`}
                                  className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/15 text-slate-300 hover:border-red-400/50 hover:text-red-400 transition-colors">
                                  <ShieldOff className="w-3.5 h-3.5" /> Revoke
                                </button>
                              ) : (
                                <button onClick={() => setPendingRole({ user: u, role: "admin" })} data-testid={`promote-${u.user_id}`}
                                  className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-emerald/40 text-emerald hover:bg-emerald/10 transition-colors">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                                </button>
                              )}
                              <button onClick={() => setPendingDelete(u)} data-testid={`delete-user-${u.user_id}`}
                                className="text-slate-400 hover:text-red-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users match "{userQuery}".</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reset password dialog */}
            <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
              <DialogContent className="bg-navy-2 border-white/10 text-white">
                <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
                <p className="text-sm text-slate-400">Set a new password for <span className="text-slate-200 font-semibold">{resetTarget?.name}</span> ({resetTarget?.email}).</p>
                <div className="flex gap-2 mt-2">
                  <Input value={resetPw} onChange={(e) => setResetPw(e.target.value)} data-testid="reset-pw-input" className="bg-navy border-white/10" placeholder="New password (min 6 chars)" />
                  <button type="button" onClick={() => setResetPw(genPassword())} className="text-xs px-3 rounded-lg border border-white/15 text-slate-300 hover:border-emerald/50 whitespace-nowrap">Generate</button>
                </div>
                <DialogFooter><button onClick={resetPassword} data-testid="reset-pw-save" className="btn-emerald font-semibold px-5 py-2 rounded-full">Reset Password</button></DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
              <AlertDialogContent className="bg-navy-2 border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This permanently deletes <span className="text-slate-200 font-semibold">{pendingDelete?.name}</span> ({pendingDelete?.email}) and their progress. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-white/15 text-slate-200 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction data-testid="delete-user-confirm" onClick={deleteUser} className="bg-red-500 text-white hover:bg-red-600">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!pendingRole} onOpenChange={(o) => !o && setPendingRole(null)}>
              <AlertDialogContent className="bg-navy-2 border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {pendingRole?.role === "admin" ? "Promote to admin?" : "Revoke admin access?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    {pendingRole?.role === "admin"
                      ? <>This will give <span className="text-emerald font-semibold">{pendingRole?.user?.name}</span> ({pendingRole?.user?.email}) full admin access to manage courses, users and content.</>
                      : <>This will remove admin access from <span className="text-slate-200 font-semibold">{pendingRole?.user?.name}</span> ({pendingRole?.user?.email}). They will become a regular student.</>}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="role-cancel" className="bg-transparent border-white/15 text-slate-200 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction data-testid="role-confirm" onClick={() => changeRole(pendingRole.user.user_id, pendingRole.role)}
                    className={pendingRole?.role === "admin" ? "bg-emerald text-navy hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}>
                    {pendingRole?.role === "admin" ? "Promote" : "Revoke"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* LIVE */}
          <TabsContent value="live" className="mt-6">
            <CrudList
              title="Live Sessions" items={live} empty={emptyLive}
              fields={[["topic", "Topic"], ["description", "Description", "textarea"], ["date", "Date (YYYY-MM-DD)"], ["time", "Time"], ["instructor", "Instructor"], ["level", "Level"], ["join_url", "Join URL"]]}
              render={(s) => <><p className="font-semibold">{s.topic}</p><p className="text-xs text-slate-500">{s.date} · {s.time} · {s.instructor}</p></>}
              idKey="id" createUrl="/admin/live-sessions" delUrl="/admin/live-sessions" reload={loadAll}
            />
          </TabsContent>

          {/* TESTIMONIALS */}
          <TabsContent value="testimonials" className="mt-6">
            <CrudList
              title="Testimonials" items={tests} empty={emptyTest}
              fields={[["name", "Name"], ["role", "Role"], ["content", "Content", "textarea"], ["rating", "Rating (1-5)", "number"]]}
              render={(t) => <><p className="font-semibold">{t.name} <span className="text-xs text-slate-500">· {t.role}</span></p><p className="text-xs text-slate-500 line-clamp-1">"{t.content}"</p></>}
              idKey="id" createUrl="/admin/testimonials" delUrl="/admin/testimonials" reload={loadAll} noEdit
            />
          </TabsContent>

          {/* MESSAGES */}
          <TabsContent value="messages" className="mt-6">
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-xl border border-white/10 bg-navy-2 p-5" data-testid={`message-${c.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-emerald" /> {c.subject}</p>
                    <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{c.name} · {c.email}</p>
                  <p className="text-sm text-slate-300">{c.message}</p>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-slate-500 text-center py-10">No messages yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- Generic CRUD list (create + delete, optional edit) ---------------- */
function CrudList({ title, items, empty, fields, render, idKey, createUrl, delUrl, reload, noEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const openNew = () => { setForm(empty); setEditing(null); setOpen(true); };
  const openEdit = (item) => { setForm(item); setEditing(item[idKey]); setOpen(true); };

  const save = async () => {
    try {
      const payload = { ...form };
      if (payload.rating) payload.rating = Number(payload.rating);
      if (editing) await api.put(`${createUrl}/${editing}`, payload);
      else await api.post(createUrl, payload);
      toast.success("Saved"); setOpen(false); reload();
    } catch { toast.error("Save failed"); }
  };
  const del = async (id) => { try { await api.delete(`${delUrl}/${id}`); toast.success("Deleted"); reload(); } catch { toast.error("Delete failed"); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-xl font-bold">{title}</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button onClick={openNew} data-testid={`add-${title.toLowerCase().replace(/\s/g, "-")}`} className="btn-emerald text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
          </DialogTrigger>
          <DialogContent className="bg-navy-2 border-white/10 text-white max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} {title}</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {fields.map(([key, label, type]) => (
                <div key={key}>
                  <Label className="text-slate-300">{label}</Label>
                  {type === "textarea"
                    ? <Textarea value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1.5 bg-navy border-white/10" />
                    : <Input type={type === "number" ? "number" : "text"} value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1.5 bg-navy border-white/10" />}
                </div>
              ))}
            </div>
            <DialogFooter><button onClick={save} data-testid="crud-save" className="btn-emerald font-semibold px-5 py-2 rounded-full">Save</button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item[idKey]} className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-2 p-4">
            <div className="flex-1 min-w-0">{render(item)}</div>
            {!noEdit && <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-emerald p-2"><Pencil className="w-4 h-4" /></button>}
            <button onClick={() => del(item[idKey])} data-testid={`delete-${item[idKey]}`} className="text-slate-400 hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Content manager (modules + lessons) ---------------- */
function ContentManager({ course, reload }) {
  const [modOpen, setModOpen] = useState(false);
  const [lesOpen, setLesOpen] = useState(false);
  const [modForm, setModForm] = useState(emptyModule);
  const [lesForm, setLesForm] = useState(emptyLesson);
  const [editModId, setEditModId] = useState(null);
  const [editLesId, setEditLesId] = useState(null);

  const saveMod = async () => {
    try {
      const p = { ...modForm, order: Number(modForm.order) || 0 };
      if (editModId) await api.put(`/admin/modules/${editModId}`, p);
      else await api.post("/admin/modules", p);
      toast.success("Module saved"); setModOpen(false); reload();
    } catch { toast.error("Failed"); }
  };
  const delMod = async (id) => { try { await api.delete(`/admin/modules/${id}`); toast.success("Module deleted"); reload(); } catch { toast.error("Failed"); } };

  const saveLes = async () => {
    try {
      const p = { ...lesForm, order: Number(lesForm.order) || 0, objectives: typeof lesForm.objectives === "string" ? lesForm.objectives.split("\n").filter(Boolean) : lesForm.objectives };
      if (editLesId) await api.put(`/admin/lessons/${editLesId}`, p);
      else await api.post("/admin/lessons", p);
      toast.success("Lesson saved"); setLesOpen(false); reload();
    } catch { toast.error("Failed"); }
  };
  const delLes = async (id) => { try { await api.delete(`/admin/lessons/${id}`); toast.success("Lesson deleted"); reload(); } catch { toast.error("Failed"); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-xl font-bold">{course?.title || "Course"}</h3>
        <Dialog open={modOpen} onOpenChange={setModOpen}>
          <DialogTrigger asChild>
            <button onClick={() => { setModForm(emptyModule); setEditModId(null); setModOpen(true); }} data-testid="add-module" className="btn-emerald text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add Module</button>
          </DialogTrigger>
          <DialogContent className="bg-navy-2 border-white/10 text-white">
            <DialogHeader><DialogTitle>{editModId ? "Edit" : "Add"} Module</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-slate-300">Title</Label><Input value={modForm.title} onChange={(e) => setModForm({ ...modForm, title: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
              <div><Label className="text-slate-300">Description</Label><Textarea value={modForm.description} onChange={(e) => setModForm({ ...modForm, description: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
              <div><Label className="text-slate-300">Order</Label><Input type="number" value={modForm.order} onChange={(e) => setModForm({ ...modForm, order: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
              <div className="flex items-center gap-3"><Switch checked={modForm.is_free} onCheckedChange={(v) => setModForm({ ...modForm, is_free: v })} /><Label className="text-slate-300">Free module</Label></div>
            </div>
            <DialogFooter><button onClick={saveMod} data-testid="module-save" className="btn-emerald font-semibold px-5 py-2 rounded-full">Save</button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lesson dialog (shared) */}
      <Dialog open={lesOpen} onOpenChange={setLesOpen}>
        <DialogContent className="bg-navy-2 border-white/10 text-white">
          <DialogHeader><DialogTitle>{editLesId ? "Edit" : "Add"} Lesson</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div><Label className="text-slate-300">Title</Label><Input value={lesForm.title} onChange={(e) => setLesForm({ ...lesForm, title: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
            <div><Label className="text-slate-300">Description</Label><Textarea value={lesForm.description} onChange={(e) => setLesForm({ ...lesForm, description: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
            <div><Label className="text-slate-300">Video URL (embed)</Label><Input value={lesForm.video_url} onChange={(e) => setLesForm({ ...lesForm, video_url: e.target.value })} className="mt-1.5 bg-navy border-white/10" placeholder="https://www.youtube.com/embed/..." /></div>
            <div><Label className="text-slate-300">Objectives (one per line)</Label><Textarea value={Array.isArray(lesForm.objectives) ? lesForm.objectives.join("\n") : lesForm.objectives} onChange={(e) => setLesForm({ ...lesForm, objectives: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Duration</Label><Input value={lesForm.duration} onChange={(e) => setLesForm({ ...lesForm, duration: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
              <div><Label className="text-slate-300">Order</Label><Input type="number" value={lesForm.order} onChange={(e) => setLesForm({ ...lesForm, order: e.target.value })} className="mt-1.5 bg-navy border-white/10" /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={lesForm.is_free} onCheckedChange={(v) => setLesForm({ ...lesForm, is_free: v })} /><Label className="text-slate-300">Free lesson</Label></div>
          </div>
          <DialogFooter><button onClick={saveLes} data-testid="lesson-save" className="btn-emerald font-semibold px-5 py-2 rounded-full">Save</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {(course?.modules || []).map((m, i) => (
          <div key={m.module_id} className="rounded-xl border border-white/10 bg-navy-2 p-5" data-testid={`admin-module-${m.module_id}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-emerald text-sm">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-semibold flex-1">{m.title} {m.is_free && <span className="text-[10px] text-emerald border border-emerald/40 rounded-full px-2 py-0.5 ml-2">FREE</span>}</p>
              <button onClick={() => { setLesForm({ ...emptyLesson, module_id: m.module_id }); setEditLesId(null); setLesOpen(true); }} data-testid={`add-lesson-${m.module_id}`} className="text-xs text-emerald hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Lesson</button>
              <button onClick={() => { setModForm(m); setEditModId(m.module_id); setModOpen(true); }} className="text-slate-400 hover:text-emerald p-1"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => delMod(m.module_id)} data-testid={`delete-module-${m.module_id}`} className="text-slate-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1 pl-8">
              {(m.lessons || []).map((l) => (
                <div key={l.lesson_id} className="flex items-center gap-2 text-sm text-slate-300 border border-white/5 rounded-lg p-2">
                  <PlayCircle className="w-4 h-4 text-slate-500" /><span className="flex-1 truncate">{l.title}</span>
                  <span className="text-xs text-slate-500">{l.duration}</span>
                  <button onClick={() => { setLesForm(l); setEditLesId(l.lesson_id); setLesOpen(true); }} className="text-slate-400 hover:text-emerald p-1"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => delLes(l.lesson_id)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
