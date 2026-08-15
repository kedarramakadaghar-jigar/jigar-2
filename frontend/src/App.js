import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import AuthCallback from "@/components/AuthCallback";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WhatsAppButton from "@/components/WhatsAppButton";
import Landing from "@/pages/Landing";
import Courses from "@/pages/Courses";
import LiveSessions from "@/pages/LiveSessions";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import LessonView from "@/pages/LessonView";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";

function SiteLayout() {
  return (
    <div className="App relative">
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main className="relative z-10"><Outlet /></main>
      <Footer />
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/live-sessions" element={<LiveSessions />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/learn/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <WhatsAppButton />
        <Toaster position="top-right" theme="dark" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
