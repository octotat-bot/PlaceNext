import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/ui/Loading';

// Eagerly loaded components (needed immediately)
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './components/auth/AuthLayout';
import WelcomeSplash from './components/onboarding/WelcomeSplash';
import ProfileNudge from './components/onboarding/ProfileNudge';
import ProductTour from './components/onboarding/ProductTour';
import { useAuth } from './context/AuthContext';

// Lazy loaded auth pages
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));

// Lazy loaded Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const Drives = lazy(() => import('./pages/student/Drives'));
const Applications = lazy(() => import('./pages/student/Applications'));
const Profile = lazy(() => import('./pages/student/Profile'));
const ResumeAnalyzer = lazy(() => import('./pages/student/ResumeAnalyzer'));

// Lazy loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Companies = lazy(() => import('./pages/admin/Companies'));
const ManageDrives = lazy(() => import('./pages/admin/ManageDrives'));
const Students = lazy(() => import('./pages/admin/Students'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminRecruiters = lazy(() => import('./pages/admin/Recruiters'));

// Lazy loaded Recruiter Pages
const RecruiterDashboard = lazy(() => import('./pages/recruiter/Dashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/Jobs'));
const RecruiterApplications = lazy(() => import('./pages/recruiter/Applications'));
const RecruiterInterviews = lazy(() => import('./pages/recruiter/Interviews'));
const RecruiterSettings = lazy(() => import('./pages/recruiter/Settings'));

function AppShell({ children }) {
  const { user, profile } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  const splashKey = user ? `onboarding_splash_${user._id}` : null;
  const showSplash = splashKey && !localStorage.getItem(splashKey) && !splashDone;

  return (
    <>
      {showSplash && (
        <WelcomeSplash onComplete={() => setSplashDone(true)} />
      )}

      {!showSplash && user?.role === 'student' && profile && (
        <ProfileNudge completeness={profile.profileCompleteness || 0} />
      )}

      {children}

      {!showSplash && <ProductTour />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader message="Loading..." />}>
              <AppShell>
                <Routes>
                {/* Public Routes with Animation */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Password Reset Routes (outside AuthLayout) */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/drives" element={<Drives />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                    <Route path="/settings" element={<Profile />} />
                  </Route>
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<Layout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/companies" element={<Companies />} />
                    <Route path="/admin/drives" element={<ManageDrives />} />
                    <Route path="/admin/students" element={<Students />} />
                    <Route path="/admin/recruiters" element={<AdminRecruiters />} />
                    <Route path="/admin/schedule" element={<ManageDrives />} />
                    <Route path="/admin/analytics" element={<AdminDashboard />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* Protected Recruiter Routes */}
                <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                  <Route element={<Layout />}>
                    <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                    <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                    <Route path="/recruiter/applications" element={<RecruiterApplications />} />
                    <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
                    <Route path="/recruiter/settings" element={<RecruiterSettings />} />
                  </Route>
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </AppShell>
            </Suspense>
          </Router>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-soft)',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

