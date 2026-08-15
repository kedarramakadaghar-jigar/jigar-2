import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlayCircle, Lock, Clock, CheckCircle2, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export default function Courses() {
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Basic to Advanced Stock Market Course | TradeAcademy";
    api.get("/courses/course_main/full").then((r) => setCourse(r.data)).catch(() => {});
    if (user) api.get("/progress").then((r) => setCompleted(r.data.completed_ids)).catch(() => {});
  }, [user]);

  const hasPlan = user && (user.plan === "full" || user.plan === "premium" || user.role === "admin");

  const openLesson = (lesson) => {
    if (lesson.is_free) { navigate(`/learn/${lesson.lesson_id}`); return; }
    if (!user) { toast.info("Please log in to access this lesson."); navigate("/login"); return; }
    if (!hasPlan) { toast.info("Enrol in the Full Course to unlock this lesson."); navigate("/#pricing"); return; }
    navigate(`/learn/${lesson.lesson_id}`);
  };

  const totalLessons = course?.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="pt-16 relative z-10">
      <section className="border-b border-white/10 grid-lines">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <p className="overline text-emerald mb-3">The Curriculum</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold max-w-3xl">{course?.title || "Basic to Advanced Stock Market Course"}</h1>
          <p className="text-slate-300 mt-5 max-w-2xl leading-relaxed">{course?.description}</p>
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-slate-300">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald" /> {course?.modules?.length || 0} Modules</span>
            <span className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-emerald" /> {totalLessons} Lessons</span>
            <span className="flex items-center gap-2 font-mono">{course?.level}</span>
          </div>
          {!user && (
            <Link to="/login" className="btn-emerald inline-flex mt-8 font-semibold px-6 py-3 rounded-full" data-testid="courses-signup-cta">
              Log In to Start Learning
            </Link>
          )}
          {user && !hasPlan && (
            <Link to="/#pricing" className="btn-emerald inline-flex mt-8 font-semibold px-6 py-3 rounded-full" data-testid="courses-enrol-cta">
              Enrol to Unlock All 18 Modules
            </Link>
          )}
          {hasPlan && (
            <span className="inline-flex items-center gap-2 mt-8 text-sm text-emerald border border-emerald/40 rounded-full px-4 py-2" data-testid="courses-enrolled-badge">
              <CheckCircle2 className="w-4 h-4" /> You're enrolled — full access unlocked
            </span>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
        <Accordion type="single" collapsible defaultValue="mod-0" className="space-y-3">
          {(course?.modules || []).map((m, i) => (
            <AccordionItem key={m.module_id} value={`mod-${i}`} className="border border-white/10 rounded-xl bg-navy-2 px-5" data-testid={`module-${i}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <span className="font-mono text-emerald text-sm">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-heading font-bold">{m.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.lessons?.length || 0} lessons {m.is_free && "· Free"}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  {(m.lessons || []).map((l) => {
                    const isDone = completed.includes(l.lesson_id);
                    const locked = !l.is_free && !hasPlan;
                    return (
                      <button key={l.lesson_id} onClick={() => openLesson(l)} data-testid={`lesson-${l.lesson_id}`}
                        className="w-full flex items-center gap-3 rounded-lg border border-white/10 p-3 text-left hover:border-emerald/40 transition-colors">
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
                          : locked ? <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                          : <PlayCircle className="w-5 h-5 text-slate-300 shrink-0" />}
                        <span className="flex-1 text-sm">{l.title}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {l.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
