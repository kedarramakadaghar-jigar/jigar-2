import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Target, ArrowLeft, PlayCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const hasPlan = user && (user.plan === "full" || user.plan === "premium" || user.role === "admin");

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      api.get("/courses/course_main/full"),
      api.get("/progress"),
    ]);
    setCourse(c.data);
    setCompletedIds(p.data.completed_ids);
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const allLessons = (course?.modules || []).flatMap((m) => (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title })));
  const idx = allLessons.findIndex((l) => l.lesson_id === lessonId);
  const lesson = allLessons[idx];
  const prev = idx > 0 ? allLessons[idx - 1] : null;
  const next = idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  const isDone = completedIds.includes(lessonId);

  useEffect(() => { if (lesson) document.title = `${lesson.title} | TradeAcademy`; window.scrollTo(0, 0); }, [lesson]);

  const toggleComplete = async () => {
    try {
      if (isDone) {
        await api.post("/progress/uncomplete", { lesson_id: lessonId });
        setCompletedIds(completedIds.filter((i) => i !== lessonId));
        toast("Marked as incomplete");
      } else {
        await api.post("/progress/complete", { lesson_id: lessonId });
        setCompletedIds([...completedIds, lessonId]);
        toast.success("Lesson completed! 🎉");
      }
    } catch { toast.error("Could not update progress"); }
  };

  if (!lesson) return <div className="pt-32 text-center text-slate-500 min-h-screen">Loading lesson…</div>;

  if (!lesson.is_free && !hasPlan) {
    return (
      <div className="pt-16 relative z-10 min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-navy-2 p-10 text-center" data-testid="lesson-locked">
          <div className="w-16 h-16 rounded-full bg-emerald/15 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-emerald" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold mb-2">This lesson is locked</h1>
          <p className="text-slate-400 text-sm mb-6">Enrol in the Full Course to unlock <span className="text-slate-200 font-semibold">{lesson.title}</span> and all 18 modules.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/#pricing")} data-testid="lesson-enrol-btn" className="btn-emerald font-semibold px-6 py-3 rounded-full">Enrol Now</button>
            <button onClick={() => navigate("/dashboard")} className="px-6 py-3 rounded-full border border-white/15 hover:border-emerald/50 transition-colors">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 relative z-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald mb-5"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
          <div className="rounded-xl border border-white/10 bg-navy-2 p-4 max-h-[70vh] overflow-y-auto">
            {(course?.modules || []).map((m, mi) => (
              <div key={m.module_id} className="mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2 px-1">{String(mi + 1).padStart(2, "0")}. {m.title}</p>
                <div className="space-y-1">
                  {(m.lessons || []).map((l) => {
                    const active = l.lesson_id === lessonId;
                    const done = completedIds.includes(l.lesson_id);
                    return (
                      <button key={l.lesson_id} onClick={() => navigate(`/learn/${l.lesson_id}`)} data-testid={`sidebar-lesson-${l.lesson_id}`}
                        className={`w-full flex items-center gap-2 rounded-lg p-2 text-left text-sm transition-colors ${active ? "bg-emerald/15 text-emerald" : "hover:bg-white/5 text-slate-300"}`}>
                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" /> : <PlayCircle className="w-4 h-4 shrink-0 opacity-60" />}
                        <span className="truncate">{l.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-8 order-1 lg:order-2">
          <p className="overline text-emerald mb-2">{lesson.moduleTitle}</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold mb-5" data-testid="lesson-title">{lesson.title}</h1>

          <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black mb-6" data-testid="lesson-video">
            {lesson.video_url ? (
              <iframe src={lesson.video_url} title={lesson.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">Video coming soon</div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-navy-2 p-6 mb-6">
            <h3 className="font-heading font-bold mb-2">Description</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{lesson.description}</p>
          </div>

          {lesson.objectives?.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-navy-2 p-6 mb-6">
              <h3 className="font-heading font-bold mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-emerald" /> Learning Objectives</h3>
              <ul className="space-y-2">
                {lesson.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald mt-0.5 shrink-0" /> {o}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={toggleComplete} data-testid="mark-complete-btn"
            className={`w-full font-semibold py-3 rounded-full mb-5 inline-flex items-center justify-center gap-2 transition-colors ${isDone ? "border border-emerald/50 text-emerald" : "btn-emerald"}`}>
            <CheckCircle2 className="w-5 h-5" /> {isDone ? "Completed — Mark as Incomplete" : "Mark as Complete"}
          </button>

          <div className="flex justify-between gap-4">
            <button disabled={!prev} onClick={() => prev && navigate(`/learn/${prev.lesson_id}`)} data-testid="prev-lesson-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-sm hover:border-emerald/50 transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button disabled={!next} onClick={() => next && navigate(`/learn/${next.lesson_id}`)} data-testid="next-lesson-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-sm hover:border-emerald/50 transition-colors disabled:opacity-30">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
