import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayCircle, CheckCircle2, Clock, ArrowRight, BookOpen, Trophy, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completed_ids: [], percentage: 0, completed_lessons: 0, total_lessons: 0 });

  useEffect(() => {
    document.title = "Dashboard | TradeAcademy";
    api.get("/courses/course_main/full").then((r) => setCourse(r.data)).catch(() => {});
    api.get("/progress").then((r) => setProgress(r.data)).catch(() => {});
  }, []);

  const allLessons = (course?.modules || []).flatMap((m) => (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title })));
  const doneSet = new Set(progress.completed_ids);
  const nextLesson = allLessons.find((l) => !doneSet.has(l.lesson_id));
  const completedLessons = allLessons.filter((l) => doneSet.has(l.lesson_id));
  const upcomingLessons = allLessons.filter((l) => !doneSet.has(l.lesson_id)).slice(0, 5);

  return (
    <div className="pt-16 relative z-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="overline text-emerald mb-2">Student Dashboard</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold" data-testid="dashboard-welcome">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <div className="mt-3">
            {user?.plan === "premium" || user?.plan === "full" || user?.role === "admin" ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald border border-emerald/40 rounded-full px-4 py-1.5" data-testid="dashboard-plan-badge">
                <Trophy className="w-4 h-4" /> {user?.role === "admin" ? "Admin — full access" : user?.plan === "premium" ? "Premium / Advanced — full access" : "Full Course — full access"}
              </span>
            ) : (
              <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-emerald/40 bg-emerald/5 pl-4 pr-2 py-1.5" data-testid="dashboard-upgrade-cta">
                <span className="text-sm text-slate-200">You're on the Free plan — unlock all 18 modules.</span>
                <button onClick={() => navigate("/#pricing")} className="btn-emerald text-xs font-semibold px-4 py-1.5 rounded-full">Enrol Now</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: TrendingUp, label: "Course Progress", value: `${progress.percentage}%` },
            { icon: CheckCircle2, label: "Lessons Completed", value: `${progress.completed_lessons}/${progress.total_lessons}` },
            { icon: Trophy, label: "Modules", value: course?.modules?.length || 0 },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-navy-2 p-6" data-testid={`stat-${i}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{s.label}</span>
                <s.icon className="w-5 h-5 text-emerald" />
              </div>
              <p className="font-mono text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-7 mt-6" data-testid="continue-learning">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex-1">
              <p className="overline text-emerald mb-2">Continue Learning</p>
              {nextLesson ? (
                <>
                  <h3 className="font-heading text-xl font-bold">{nextLesson.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{nextLesson.moduleTitle}</p>
                </>
              ) : (
                <h3 className="font-heading text-xl font-bold">You've completed every lesson! 🎉</h3>
              )}
              <div className="mt-4 max-w-md">
                <Progress value={progress.percentage} className="h-2 bg-navy" />
                <p className="text-xs text-slate-400 mt-2">{progress.percentage}% complete</p>
              </div>
            </div>
            {nextLesson && (
              <button onClick={() => navigate(`/learn/${nextLesson.lesson_id}`)} data-testid="continue-btn"
                className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2 shrink-0">
                Continue Learning <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Modules */}
          <div className="rounded-2xl border border-white/10 bg-navy-2 p-6">
            <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald" /> Course Modules</h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {(course?.modules || []).map((m, i) => {
                const total = m.lessons?.length || 0;
                const done = (m.lessons || []).filter((l) => doneSet.has(l.lesson_id)).length;
                const first = m.lessons?.[0];
                return (
                  <button key={m.module_id} onClick={() => first && navigate(`/learn/${first.lesson_id}`)}
                    className="w-full flex items-center gap-3 rounded-lg border border-white/10 p-3 text-left hover:border-emerald/40 transition-colors" data-testid={`dash-module-${i}`}>
                    <span className="font-mono text-emerald text-xs w-6">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-slate-500">{done}/{total} lessons</p>
                    </div>
                    {done === total && total > 0 && <CheckCircle2 className="w-4 h-4 text-emerald" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completed + Upcoming */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-navy-2 p-6">
              <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald" /> Upcoming Lessons</h3>
              <div className="space-y-2">
                {upcomingLessons.map((l) => (
                  <Link key={l.lesson_id} to={`/learn/${l.lesson_id}`} className="flex items-center gap-3 rounded-lg border border-white/10 p-3 hover:border-emerald/40 transition-colors">
                    <PlayCircle className="w-4 h-4 text-slate-300" /><span className="text-sm flex-1 truncate">{l.title}</span><span className="text-xs text-slate-500">{l.duration}</span>
                  </Link>
                ))}
                {upcomingLessons.length === 0 && <p className="text-sm text-slate-500">Nothing upcoming — great job!</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-navy-2 p-6">
              <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald" /> Completed Lessons</h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {completedLessons.map((l) => (
                  <Link key={l.lesson_id} to={`/learn/${l.lesson_id}`} className="flex items-center gap-3 rounded-lg border border-white/10 p-3 hover:border-emerald/40 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald" /><span className="text-sm flex-1 truncate text-slate-300">{l.title}</span>
                  </Link>
                ))}
                {completedLessons.length === 0 && <p className="text-sm text-slate-500">No lessons completed yet. Start learning!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
