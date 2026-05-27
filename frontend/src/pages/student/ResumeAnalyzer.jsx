import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, CheckCircle, XCircle, Sparkles,
  TrendingUp, Target, Lightbulb, Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { LoadingPage } from '../../components/ui/LoadingSpinner';
import { getScoreLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

/* ─── Score Gauge SVG ─── */
const ScoreGauge = ({ score }) => {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: 128, height: 128, margin: '0 auto' }}>
      <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="64" cy="64" r={r} stroke="var(--color-border-secondary)" strokeWidth="8" fill="none" />
        <circle
          cx="64" cy="64" r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>ATS Score</span>
      </div>
    </div>
  );
};

const Card = ({ children, style }) => (
  <div style={{
    background: 'var(--color-background-primary)',
    border: '1px solid var(--color-border-tertiary)',
    borderRadius: 12,
    padding: 20,
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, color, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
    {Icon && <Icon size={14} style={{ color: color || 'var(--color-text-tertiary)' }} />}
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {children}
    </span>
  </div>
);

/* ─── Main Component ─── */
const ResumeAnalyzer = () => {
  const { profile, updateProfile } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingAnalysis, setFetchingAnalysis] = useState(true);

  useEffect(() => { fetchExistingAnalysis(); }, []);

  const fetchExistingAnalysis = async () => {
    try {
      const { data } = await studentAPI.getResumeAnalysis();
      setAnalysis(data.analysis);
    } catch { /* no existing analysis */ }
    finally { setFetchingAnalysis(false); }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await studentAPI.uploadResume(fd);
      updateProfile({ ...profile, resumeUrl: data.resumeUrl });
      toast.success('Resume uploaded! Click "Analyze Resume" to get AI feedback.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, [profile, updateProfile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, disabled: uploading,
  });

  const handleAnalyze = async () => {
    if (!profile?.resumeUrl) { toast.error('Please upload a resume first'); return; }
    setAnalyzing(true);
    try {
      const { data } = await studentAPI.analyzeResume();
      setAnalysis(data.analysis);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze');
    } finally {
      setAnalyzing(false);
    }
  };

  if (fetchingAnalysis) return <LoadingPage message="Loading resume analysis…" />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <div className="eyebrow">Student</div>
        <h1 className="page-title"><em>AI</em> Resume Analyzer</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Get instant AI-powered feedback with ATS compatibility scoring
        </p>
      </div>

      {/* Upload Card */}
      <Card style={{ padding: 24 }}>
        <SectionTitle>Upload Resume</SectionTitle>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            border: `1.5px dashed ${isDragActive ? 'var(--color-text-primary)' : 'var(--color-border-secondary)'}`,
            borderRadius: 10,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            background: isDragActive ? 'rgba(255,255,255,0.04)' : 'var(--color-background-secondary)',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} />
          {uploading
            ? <Loader2 size={28} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--color-text-tertiary)', animation: 'spin 1s linear infinite' }} />
            : <Upload size={28} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--color-text-tertiary)' }} />
          }
          {isDragActive ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Drop your resume here…</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {uploading ? 'Uploading…' : <>Drag &amp; drop your PDF here, or <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>browse</span></>}
              </p>
              {!uploading && <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>PDF only · max 5MB</p>}
            </>
          )}
        </div>

        {/* Status bar */}
        {profile?.resumeUrl ? (
          <div style={{
            marginTop: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Resume uploaded</div>
                <a href={`http://localhost:5001${profile.resumeUrl}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: '#10b981', textDecoration: 'none' }}>
                  View resume →
                </a>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: analyzing ? 'not-allowed' : 'pointer',
                background: 'var(--color-text-primary)', color: 'var(--color-background-primary)',
                border: 'none', opacity: analyzing ? 0.7 : 1, whiteSpace: 'nowrap',
                transition: 'opacity 0.15s',
              }}>
              {analyzing
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
                : <><Sparkles size={14} /> {analysis ? 'Re-Analyze' : 'Analyze Resume'}</>
              }
            </button>
          </div>
        ) : (
          <div style={{
            marginTop: 14, padding: '12px 16px',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <FileText size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Upload your resume above to get AI-powered feedback and ATS compatibility score.
            </span>
          </div>
        )}
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ATS Score */}
          <Card style={{ textAlign: 'center', padding: 28 }}>
            <SectionTitle>ATS Compatibility Score</SectionTitle>
            <ScoreGauge score={analysis.atsScore} />
            <p style={{ marginTop: 14, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {getScoreLabel(analysis.atsScore)}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {analysis.atsScore >= 80
                ? 'Your resume is well-optimized for ATS systems!'
                : analysis.atsScore >= 60
                  ? 'Some improvements needed for better ATS compatibility.'
                  : 'Significant improvements needed to pass ATS filters.'}
            </p>
          </Card>

          {/* Strengths + Weaknesses side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            <Card>
              <SectionTitle icon={CheckCircle} color="#10b981">Strengths</SectionTitle>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                {analysis.strengths?.map((s, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: 5 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <SectionTitle icon={XCircle} color="#ef4444">Areas to Improve</SectionTitle>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 5 }} />
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Missing Keywords */}
          <Card>
            <SectionTitle icon={Target} color="#f59e0b">Missing Keywords</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Add these to improve your ATS score:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analysis.missingKeywords?.map((kw, i) => (
                <span key={i} style={{
                  padding: '5px 12px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b', borderRadius: 100, fontSize: 12,
                }}>
                  {kw}
                </span>
              ))}
            </div>
          </Card>

          {/* Suggestions */}
          <Card>
            <SectionTitle icon={Lightbulb} color="#3b82f6">Actionable Suggestions</SectionTitle>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
              {analysis.suggestions?.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#3b82f6',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', paddingTop: 2, lineHeight: 1.5 }}>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Improved Bullets */}
          {analysis.improvedBullets?.length > 0 && (
            <Card>
              <SectionTitle icon={TrendingUp} color="#8b5cf6">Improved Bullet Points</SectionTitle>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Examples of how to rewrite your bullet points:</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {analysis.improvedBullets.map((b, i) => (
                  <li key={i} style={{
                    padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
                    background: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderLeft: '3px solid #8b5cf6',
                    borderRadius: 6, color: 'var(--color-text-secondary)',
                  }}>
                    {b}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {analysis.analyzedAt && (
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Last analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
