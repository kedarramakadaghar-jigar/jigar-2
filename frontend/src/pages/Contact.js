import { useState, useEffect } from "react";
import { Mail, MessageCircle, Twitter, Linkedin, Youtube, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Contact Us | TradeAcademy"; }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch { toast.error("Could not send message. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="pt-16 relative z-10">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="overline text-emerald mb-3">Contact</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold">Get in touch</h1>
          <p className="text-slate-300 mt-4 max-w-md">Have a question about the course, live sessions or your account? Send us a message.</p>
          <div className="mt-10 space-y-4">
            <a href="mailto:hello@tradeacademy.com" className="flex items-center gap-3 text-slate-200 hover:text-emerald transition-colors">
              <span className="w-10 h-10 rounded-lg bg-emerald/15 flex items-center justify-center"><Mail className="w-5 h-5 text-emerald" /></span>
              hello@tradeacademy.com
            </a>
            <a href="#" className="flex items-center gap-3 text-slate-200 hover:text-emerald transition-colors">
              <span className="w-10 h-10 rounded-lg bg-emerald/15 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-emerald" /></span>
              WhatsApp: +91 00000 00000
            </a>
          </div>
          <div className="flex gap-3 mt-8">
            {[Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social" className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald hover:border-emerald/40 transition-colors"><Icon className="w-4 h-4" /></a>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-navy-2 p-8 space-y-4" data-testid="contact-form">
          <div>
            <Label className="text-slate-300">Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name" className="mt-1.5 bg-navy border-white/10" />
          </div>
          <div>
            <Label className="text-slate-300">Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email" className="mt-1.5 bg-navy border-white/10" />
          </div>
          <div>
            <Label className="text-slate-300">Subject</Label>
            <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="contact-subject" className="mt-1.5 bg-navy border-white/10" />
          </div>
          <div>
            <Label className="text-slate-300">Message</Label>
            <Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message" className="mt-1.5 bg-navy border-white/10" />
          </div>
          <button type="submit" disabled={loading} data-testid="contact-submit" className="btn-emerald w-full font-semibold py-3 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? "Sending…" : <>Submit <Send className="w-4 h-4" /></>}
          </button>
        </form>
      </section>
    </div>
  );
}
