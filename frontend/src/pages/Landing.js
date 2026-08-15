import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, ArrowRight, CandlestickChart, ShieldCheck, GraduationCap, Layers,
  Gauge, Radio, CheckCircle2, Star, BarChart3, LineChart, Brain, Target, Clock,
} from "lucide-react";
import api from "@/lib/api";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const HERO_IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";
const ABOUT_IMG = "https://images.unsplash.com/photo-1602016736566-7ed6a58894bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const whyCards = [
  { icon: Layers, title: "Step-by-Step Learning", desc: "Learn concepts in a structured order, building from fundamentals upward." },
  { icon: BarChart3, title: "Practical Knowledge", desc: "Understand how market concepts are applied to real charts and setups." },
  { icon: GraduationCap, title: "Beginner Friendly", desc: "Start with the basics and progress toward advanced trading concepts." },
  { icon: ShieldCheck, title: "Risk Management", desc: "Learn how to manage trading risk and protect your capital." },
  { icon: Clock, title: "Learn at Your Own Pace", desc: "Access lessons anytime and track your progress lesson by lesson." },
  { icon: Radio, title: "Live Learning", desc: "Join live educational sessions to reinforce what you learn." },
];

const howSteps = [
  { icon: GraduationCap, title: "Create a Free Account", desc: "Sign up in seconds — no payment required to get started." },
  { icon: CandlestickChart, title: "Follow the Structured Course", desc: "Move through 18 modules from fundamentals to advanced concepts." },
  { icon: Gauge, title: "Track Your Progress", desc: "Mark lessons complete and watch your progress grow on your dashboard." },
];

const WA_ENROLL = "https://wa.me/917777930377?text=" + encodeURIComponent("Hi, I'd like to enrol in the TradeAcademy stock market course. Please share the details.");

const pricing = [
  { name: "Free", price: "₹0", tag: "Included", features: ["Access to intro modules", "Personal dashboard", "Progress tracking", "Community updates"], cta: "Login", to: "/login", highlight: false },
  { name: "Full Course", price: "₹3,999", tag: "Most popular", features: ["All 18 modules", "Every lesson & objective", "Downloadable resources", "Live session access"], cta: "Enrol via WhatsApp", to: WA_ENROLL, external: true, highlight: true },
  { name: "Premium / Advanced", price: "₹6,999", tag: "For serious learners", features: ["Everything in Full Course", "Advanced strategy modules", "Priority live Q&A", "1:1 mentorship"], cta: "Enrol via WhatsApp", to: WA_ENROLL, external: true, highlight: false },
];

const faqs = [
  ["Who is this course for?", "Anyone who wants to understand the stock market — from complete beginners to intermediate learners looking to strengthen their technical analysis and risk management."],
  ["Is the course suitable for beginners?", "Yes. We start with the absolute fundamentals and progress step by step toward advanced concepts, so no prior experience is needed."],
  ["How do I create an account?", "Click 'Create Free Account', enter your name, email and a password, and you'll be taken straight to your student dashboard."],
  ["Is signup free?", "Yes — creating an account is completely free and gives you access to introductory lessons and your progress dashboard."],
  ["What topics are covered?", "Fundamentals, exchanges & indices, candlesticks, support & resistance, indicators, chart patterns, technical analysis, trading strategies, options basics, risk management, trading psychology and more."],
  ["Can I learn at my own pace?", "Absolutely. Lessons are available on demand and your progress is saved so you can continue anytime."],
  ["Are live sessions available?", "Yes, we host live educational sessions. You can view upcoming sessions on the Live Sessions page."],
  ["Does the course guarantee profits?", "No. This is educational content only. Trading and investing involve risk, and no profits or returns are guaranteed."],
  ["What is risk management?", "Risk management is the practice of protecting your capital using tools like stop-losses and position sizing — a core focus of this course."],
  ["How do I access my lessons?", "Log in and open your dashboard, then click 'Continue Learning' or pick any lesson from the course modules."],
];

export default function Landing() {
  const [testimonials, setTestimonials] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    document.title = "Stock Market Learning Course | Basic to Advanced Trading Education";
    api.get("/testimonials").then((r) => setTestimonials(r.data)).catch(() => {});
    api.get("/courses/course_main/full").then((r) => setCourse(r.data)).catch(() => {});
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, []);

  return (
    <div className="pt-16">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true">
          <img src={HERO_IMG} alt="Stock market candlestick chart on a trading screen" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-navy/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="overline text-emerald">Members-only · 18 structured modules</span>
            </motion.div>
            <motion.h1 initial="hidden" animate="show" custom={1} variants={fadeUp} className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              Learn the Stock Market.<br /><span className="text-emerald">Build Real Trading Skills.</span>
            </motion.h1>
            <motion.p initial="hidden" animate="show" custom={2} variants={fadeUp} className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              A structured stock market learning course designed to take you from the basics to advanced trading concepts — step by step.
            </motion.p>
            <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" data-testid="hero-start-learning" className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2">
                Student Login <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/courses" data-testid="hero-explore-course" className="px-6 py-3 rounded-full border border-white/15 text-slate-100 font-semibold hover:border-emerald/50 transition-colors">
                Explore Course
              </Link>
            </motion.div>
            <motion.p initial="hidden" animate="show" custom={4} variants={fadeUp} className="mt-6 text-xs text-slate-400 max-w-md">
              Educational content only. Trading and investing involve risk. No profits or returns are guaranteed.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-navy-2/80 backdrop-blur p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-slate-400">NIFTY 50 · 1D</span>
                <span className="font-mono text-sm text-emerald flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +1.24%</span>
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {[40, 55, 48, 62, 58, 72, 68, 80, 74, 88, 82, 95].map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className={`flex-1 rounded-t ${i % 3 === 0 ? "bg-red-500/60" : "bg-emerald/70"}`} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[["Modules", "18"], ["Lessons", "36"], ["Learners", "400+"]].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-white/10 p-3">
                    <p className="font-mono text-xl font-bold text-white">{v}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{k}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="relative z-10 border-b border-white/10 bg-navy-2/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["400+", "Learners enrolled"],
            ["18", "Structured modules"],
            ["36", "Video lessons"],
            ["4.9★", "Average rating"],
          ].map(([value, label], i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }} className="text-center" data-testid={`stat-strip-${i}`}>
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-emerald">{value}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY LEARN WITH US */}
      <Section id="why" overline="Why Learn With Us" title="Everything you need to learn trading the right way">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyCards.map((c, i) => (
            <motion.div key={c.title} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="card-hover rounded-xl border border-white/10 bg-navy-2 p-7" data-testid={`why-card-${i}`}>
              <div className="w-11 h-11 rounded-lg bg-emerald/15 flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-emerald" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how-it-works" overline="How It Works" title="Start learning in three simple steps" dark>
        <div className="grid md:grid-cols-3 gap-6">
          {howSteps.map((s, i) => (
            <motion.div key={s.title} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="relative rounded-xl border border-white/10 p-8" data-testid={`how-step-${i}`}>
              <span className="font-mono text-5xl font-bold text-emerald/20 absolute top-4 right-5">0{i + 1}</span>
              <div className="w-12 h-12 rounded-lg bg-emerald/15 flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-emerald" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* COURSE PREVIEW */}
      <Section id="course" overline="The Course" title="Basic to Advanced Stock Market Course">
        <div className="grid lg:grid-cols-2 gap-4">
          {(course?.modules || []).slice(0, 8).map((m, i) => (
            <motion.div key={m.module_id} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i % 4} variants={fadeUp}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-navy-2 p-4 card-hover">
              <span className="font-mono text-emerald text-sm w-8">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{m.title}</p>
                <p className="text-xs text-slate-500">{m.lessons?.length || 0} lessons</p>
              </div>
              {m.is_free && <span className="text-[10px] font-semibold text-emerald border border-emerald/40 rounded-full px-2 py-0.5">FREE</span>}
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/courses" className="btn-emerald font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2">
            View Full Curriculum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* ABOUT */}
      <Section id="about" overline="About Us" title="Practical stock market education, done properly" dark>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-slate-300 leading-relaxed mb-6">
              TradeAcademy is focused on practical stock market education and structured learning. We believe skill is built through clear fundamentals, real chart examples, and disciplined habits — not hype or promises.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                [Layers, "Step-by-step education"],
                [LineChart, "Practical examples"],
                [CandlestickChart, "Technical analysis"],
                [ShieldCheck, "Risk management"],
                [Brain, "Trading psychology"],
                [Target, "Continuous learning"],
              ].map(([Icon, label], i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
                  <Icon className="w-5 h-5 text-emerald shrink-0" /> {label}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <img src={ABOUT_IMG} alt="A learner studying stock market charts on a laptop" className="w-full h-full object-cover max-h-[420px]" />
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" overline="Pricing" title="Simple plans, built to grow with you">
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((p, i) => (
            <motion.div key={p.name} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp}
              className={`rounded-2xl border p-8 relative ${p.highlight ? "border-emerald/60 bg-emerald/5" : "border-white/10 bg-navy-2"}`} data-testid={`pricing-${p.name.toLowerCase().replace(/\W/g, "-")}`}>
              {p.highlight && <span className="absolute -top-3 left-8 text-[10px] font-bold text-navy bg-emerald px-3 py-1 rounded-full">MOST POPULAR</span>}
              <p className="overline text-emerald mb-2">{p.tag}</p>
              <h3 className="font-heading text-2xl font-extrabold">{p.name}</h3>
              <p className="font-mono text-3xl font-bold mt-3 mb-6">{p.price}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              {p.external ? (
                <a href={p.to} target="_blank" rel="noopener noreferrer" data-testid={`pricing-cta-${i}`}
                  className={`block text-center font-semibold px-5 py-3 rounded-full ${p.highlight ? "btn-emerald" : "border border-white/15 hover:border-emerald/50 transition-colors"}`}>
                  {p.cta}
                </a>
              ) : (
                <Link to={p.to} data-testid={`pricing-cta-${i}`} className={`block text-center font-semibold px-5 py-3 rounded-full ${p.highlight ? "btn-emerald" : "border border-white/15 hover:border-emerald/50 transition-colors"}`}>
                  {p.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">To enrol in a paid plan, message us on WhatsApp — we'll create your account and share your login details.</p>
      </Section>

      {/* TESTIMONIALS */}
      <Section id="testimonials" overline="Testimonials" title="What learners say" dark>
        <div className="flex items-center gap-3 -mt-6 mb-10" data-testid="trust-line">
          <div className="flex -space-x-2">
            {["A", "M", "S", "R", "P"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-emerald/20 text-emerald border-2 border-navy-2 flex items-center justify-center text-xs font-semibold">{c}</div>
            ))}
          </div>
          <p className="text-sm text-slate-300">
            <span className="text-emerald font-semibold">Trusted by 400+ learners across India</span> — rated 4.9 out of 5
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="rounded-xl border border-white/10 bg-navy-2 p-6 card-hover">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`w-4 h-4 ${s < t.rating ? "text-emerald fill-emerald" : "text-slate-700"}`} />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald/20 text-emerald flex items-center justify-center font-semibold text-sm">{t.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" overline="FAQ" title="Frequently asked questions">
        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 rounded-xl px-5 bg-navy-2" data-testid={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-400 leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold mb-4">Ready to start learning?</h2>
          <p className="text-slate-300 mb-8">Log in with the account your administrator created for you and continue your journey from beginner to advanced trader.</p>
          <Link to="/login" className="btn-emerald font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 text-lg">
            Student Login <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Section({ id, overline, title, children, dark }) {
  return (
    <section id={id} className={`relative z-10 py-20 ${dark ? "bg-navy-2/40 border-y border-white/10" : ""}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 max-w-2xl">
          <p className="overline text-emerald mb-3">{overline}</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
