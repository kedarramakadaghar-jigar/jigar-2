import { useEffect, useState } from "react";
import { Calendar, Clock, User, Radio } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    document.title = "Live Trading & Learning Sessions | TradeAcademy";
    api.get("/live-sessions").then((r) => setSessions(r.data)).catch(() => {});
  }, []);

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="pt-16 relative z-10">
      <section className="border-b border-white/10 grid-lines">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/10 mb-5">
            <Radio className="w-4 h-4 text-emerald" /><span className="overline text-emerald">Live Learning</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold">Live Trading & Learning Sessions</h1>
          <p className="text-slate-300 mt-4 max-w-2xl">Join upcoming live educational sessions to reinforce concepts and ask questions in real time.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-navy-2 p-6 card-hover flex flex-col" data-testid={`live-session-${s.id}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-emerald border border-emerald/40 rounded-full px-2.5 py-1">{s.level}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">{s.topic}</h3>
              <p className="text-sm text-slate-400 mb-5 flex-1">{s.description}</p>
              <div className="space-y-2 text-sm text-slate-300 mb-5">
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald" /> {fmt(s.date)}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald" /> {s.time}</p>
                <p className="flex items-center gap-2"><User className="w-4 h-4 text-emerald" /> {s.instructor}</p>
              </div>
              <button onClick={() => toast.info("Session link will be shared with registered students before it starts.")}
                data-testid={`join-session-${s.id}`} className="btn-emerald w-full font-semibold py-2.5 rounded-full">
                Join Session
              </button>
            </div>
          ))}
        </div>
        {sessions.length === 0 && <p className="text-slate-500 text-center py-20">No upcoming sessions scheduled right now. Check back soon.</p>}
      </section>
    </div>
  );
}
