import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bug, Loader2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { getWidgetConfig, createWidgetBug } from '@/lib/api/widget';
import type { Priority, Source } from '@/types';

type WidgetView = 'form' | 'success' | 'error';

export function WidgetPage() {
  const { token } = useParams<{ token: string }>();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [view, setView] = useState<WidgetView>('form');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadConfig();
  }, [token]);

  const loadConfig = async () => {
    try {
      const response = await getWidgetConfig(token!);
      setProjectName(response.project.name);
      setLoading(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Failed to load widget';
      setConfigError(message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createWidgetBug(token!, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        source: 'CUSTOMER_REPORT' as Source,
        reporterEmail: reporterEmail.trim() || undefined,
      });

      setView('success');

      // Notify parent window
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'bugfixer:success' }, '*');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Failed to submit bug';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'bugfixer:close' }, '*');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setReporterEmail('');
    setSubmitError(null);
    setView('form');
  };

  // Loading state
  if (loading) {
    return (
      <div className="widget-container">
        <div className="widget-center">
          <Loader2 className="widget-spinner" />
        </div>
      </div>
    );
  }

  // Config error state
  if (configError) {
    return (
      <div className="widget-container">
        <div className="widget-center">
          <AlertTriangle className="widget-icon-error" />
          <p className="widget-text-error">{configError}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (view === 'success') {
    return (
      <div className="widget-container">
        <div className="widget-center">
          <div className="widget-success-icon">
            <CheckCircle size={32} />
          </div>
          <h3 className="widget-title" style={{ marginTop: '12px' }}>Bug Reported!</h3>
          <p className="widget-subtitle">
            Your bug report has been submitted to <strong>{projectName}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="widget-btn widget-btn-secondary" onClick={resetForm}>
              Report Another
            </button>
            <button className="widget-btn widget-btn-primary" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="widget-container">
      {/* Header */}
      <div className="widget-header">
        <div className="widget-header-left">
          <div className="widget-logo">
            <Bug size={16} />
          </div>
          <div>
            <h3 className="widget-title">Report a Bug</h3>
            <p className="widget-subtitle">{projectName}</p>
          </div>
        </div>
        <button className="widget-close-btn" onClick={handleClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="widget-form">
        {/* Title */}
        <div className="widget-field">
          <label className="widget-label">
            Title <span className="widget-required">*</span>
          </label>
          <input
            type="text"
            className="widget-input"
            placeholder="Describe the bug briefly..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={500}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="widget-field">
          <label className="widget-label">Description</label>
          <textarea
            className="widget-textarea"
            placeholder="Steps to reproduce, expected behavior, actual behavior..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={5000}
          />
        </div>

        {/* Priority */}
        <div className="widget-field">
          <label className="widget-label">Priority</label>
          <div className="widget-priority-group">
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`widget-priority-btn ${priority === p ? `widget-priority-active widget-priority-${p.toLowerCase()}` : ''}`}
                onClick={() => setPriority(p)}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Reporter Email */}
        <div className="widget-field">
          <label className="widget-label">Your Email <span className="widget-optional">(optional)</span></label>
          <input
            type="email"
            className="widget-input"
            placeholder="your@email.com"
            value={reporterEmail}
            onChange={(e) => setReporterEmail(e.target.value)}
          />
          <p className="widget-hint">Get notified when the bug is resolved</p>
        </div>

        {/* Error */}
        {submitError && (
          <div className="widget-error">
            <AlertTriangle size={14} />
            {submitError}
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="widget-btn widget-btn-primary widget-btn-full" disabled={submitting || !title.trim()}>
          {submitting ? (
            <>
              <Loader2 size={16} className="widget-spinner-inline" />
              Submitting...
            </>
          ) : (
            <>
              <Bug size={16} />
              Submit Bug Report
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="widget-footer">
        <span>Powered by </span>
        <a href="https://fix.bizer.dev" target="_blank" rel="noopener noreferrer">
          BugFixer
        </a>
      </div>

      <style>{widgetStyles}</style>
    </div>
  );
}

// Self-contained styles for the widget - avoids dependency on the main app's CSS
const widgetStyles = `
  .widget-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #ffffff;
    color: #18181b;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.5;
  }

  .widget-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e4e7;
    flex-shrink: 0;
  }

  .widget-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .widget-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #18181b;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .widget-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    color: #18181b;
  }

  .widget-subtitle {
    font-size: 12px;
    color: #71717a;
    margin: 0;
  }

  .widget-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #71717a;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }

  .widget-close-btn:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .widget-form {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .widget-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .widget-label {
    font-size: 13px;
    font-weight: 500;
    color: #3f3f46;
  }

  .widget-required {
    color: #ef4444;
  }

  .widget-optional {
    color: #a1a1aa;
    font-weight: 400;
  }

  .widget-input, .widget-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #18181b;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .widget-input:focus, .widget-textarea:focus {
    border-color: #18181b;
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1);
  }

  .widget-input::placeholder, .widget-textarea::placeholder {
    color: #a1a1aa;
  }

  .widget-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .widget-hint {
    font-size: 11px;
    color: #a1a1aa;
    margin: 2px 0 0 0;
  }

  .widget-priority-group {
    display: flex;
    gap: 6px;
  }

  .widget-priority-btn {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    background: #ffffff;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    color: #52525b;
    transition: all 0.15s;
    font-family: inherit;
  }

  .widget-priority-btn:hover {
    border-color: #a1a1aa;
  }

  .widget-priority-active {
    color: #ffffff;
    border-color: transparent;
  }

  .widget-priority-low {
    background: #94a3b8;
    border-color: #94a3b8;
  }

  .widget-priority-medium {
    background: #eab308;
    border-color: #eab308;
    color: #18181b;
  }

  .widget-priority-high {
    background: #f97316;
    border-color: #f97316;
  }

  .widget-priority-critical {
    background: #ef4444;
    border-color: #ef4444;
  }

  .widget-error {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 13px;
  }

  .widget-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    font-family: inherit;
  }

  .widget-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .widget-btn-primary {
    background: #18181b;
    color: #ffffff;
  }

  .widget-btn-primary:hover:not(:disabled) {
    background: #27272a;
  }

  .widget-btn-secondary {
    background: #f4f4f5;
    color: #18181b;
  }

  .widget-btn-secondary:hover:not(:disabled) {
    background: #e4e4e7;
  }

  .widget-btn-full {
    width: 100%;
  }

  .widget-footer {
    padding: 10px 20px;
    text-align: center;
    border-top: 1px solid #e4e4e7;
    font-size: 11px;
    color: #a1a1aa;
    flex-shrink: 0;
  }

  .widget-footer a {
    color: #18181b;
    text-decoration: none;
    font-weight: 500;
  }

  .widget-footer a:hover {
    text-decoration: underline;
  }

  .widget-spinner {
    width: 24px;
    height: 24px;
    color: #18181b;
    animation: widget-spin 1s linear infinite;
  }

  .widget-spinner-inline {
    animation: widget-spin 1s linear infinite;
  }

  .widget-icon-error {
    width: 32px;
    height: 32px;
    color: #ef4444;
    margin-bottom: 8px;
  }

  .widget-text-error {
    color: #71717a;
    font-size: 13px;
    margin: 0;
  }

  .widget-success-icon {
    color: #22c55e;
  }

  @keyframes widget-spin {
    to { transform: rotate(360deg); }
  }
`;

export default WidgetPage;
