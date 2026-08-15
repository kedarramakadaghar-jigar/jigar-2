import { Link } from "react-router-dom";
import { TrendingUp, Mail, MessageCircle, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-navy-2 border-t border-white/10 pt-16 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-navy" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-lg font-extrabold">TradeAcademy</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Structured stock market education — from fundamentals to advanced trading concepts. Learn at your own pace.
            </p>
            <div className="flex gap-3 mt-5">
              {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald hover:border-emerald/40 transition-colors" aria-label="Social link">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="overline text-emerald mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-emerald">Home</Link></li>
              <li><Link to="/courses" className="hover:text-emerald">Courses</Link></li>
              <li><Link to="/live-sessions" className="hover:text-emerald">Live Sessions</Link></li>
              <li><Link to="/#about" className="hover:text-emerald">About</Link></li>
              <li><Link to="/#faq" className="hover:text-emerald">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="overline text-emerald mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald" /> hello@tradeacademy.com</li>
              <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald" /> <a href="https://wa.me/917777930377" target="_blank" rel="noopener noreferrer" className="hover:text-emerald">WhatsApp: +91 77779 30377</a></li>
              <li><Link to="/contact" className="hover:text-emerald">Contact Form →</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="overline text-emerald mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-emerald">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="text-slate-400 font-semibold">Disclaimer:</span> This website provides educational information about financial markets and trading. It does not provide personalized financial advice, investment advice, or guaranteed returns. Trading and investing involve risk, and users should make their own informed decisions.
          </p>
          <p className="text-xs text-slate-600 mt-4">© {new Date().getFullYear()} TradeAcademy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
