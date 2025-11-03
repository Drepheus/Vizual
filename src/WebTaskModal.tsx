import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import './WebTaskModal.css';

interface WebTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskResult {
  success: boolean;
  task_id: string;
  status: 'created' | 'queued' | 'running' | 'completed' | 'failed' | 'terminated';
  output?: Record<string, any> | string;
  screenshot_urls?: string[];
  recording_url?: string;
  app_url?: string;
  downloaded_files?: Array<{
    url: string;
    filename: string;
  }>;
  failure_reason?: string;
  educational_tip?: string;
  usage?: {
    current: number;
    limit: number;
    remaining: number;
  };
}

const WebTaskModal: React.FC<WebTaskModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<'skyvern-2.0' | 'skyvern-1.0'>('skyvern-2.0');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Example prompts for inspiration
  const examplePrompts = [
    'Search Amazon for laptops under $1000 and summarize the top 3 results',
    'Find the latest job openings for Software Engineers on LinkedIn',
    'Navigate to Airbnb and find 3-bedroom rentals in San Francisco for next month',
    'Go to GitHub and search for trending JavaScript repositories',
    'Visit Booking.com and find hotels in Paris with ratings above 8.5',
  ];

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a task description');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to use AI Web Task');
      }

      // Call the Skyvern API endpoint
      const response = await fetch('/api/ai-web-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          url: url.trim() || undefined,
          engine: selectedEngine,
          max_steps: 15,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle upgrade required error
        if (data.upgrade_required) {
          throw new Error('AI Web Task is a PRO feature. Upgrade to Pro or Ultra to access intelligent web automation!');
        }
        
        // Handle rate limit
        if (response.status === 429) {
          throw new Error(data.details || 'Usage limit exceeded. Please upgrade or wait until next month.');
        }

        throw new Error(data.details || data.error || 'Failed to process AI Web Task');
      }

      setResult(data);

    } catch (err) {
      console.error('Web task error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleReset = () => {
    setPrompt('');
    setUrl('');
    setResult(null);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="webtask-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="webtask-modal-container"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="webtask-modal-header">
              <div className="webtask-header-content">
                <div className="webtask-icon-wrapper">
                  <div className="webtask-icon">🧭</div>
                  <div className="webtask-icon-glow"></div>
                </div>
                <div className="webtask-header-text">
                  <h2 className="webtask-title">AI Web Task</h2>
                  <p className="webtask-subtitle">Let AI navigate the web like a human</p>
                </div>
              </div>
              <button className="webtask-close-btn" onClick={onClose} title="Close">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="webtask-modal-body">
              {!result ? (
                <>
                  {/* Educational Banner */}
                  <div className="webtask-info-banner">
                    <span className="info-icon">💡</span>
                    <p className="info-text">
                      Powered by <strong>Skyvern</strong> - AI that uses computer vision and LLMs 
                      to understand websites and complete tasks like a real person would!
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="webtask-form">
                    {/* Engine Selector */}
                    <div className="engine-selector">
                      <label className="engine-label">AI Engine:</label>
                      <div className="engine-buttons">
                        <button
                          type="button"
                          className={`engine-btn ${selectedEngine === 'skyvern-2.0' ? 'active' : ''}`}
                          onClick={() => setSelectedEngine('skyvern-2.0')}
                        >
                          <span className="engine-icon">⚡</span>
                          <span className="engine-name">Skyvern 2.0</span>
                          <span className="engine-badge">Recommended</span>
                        </button>
                        <button
                          type="button"
                          className={`engine-btn ${selectedEngine === 'skyvern-1.0' ? 'active' : ''}`}
                          onClick={() => setSelectedEngine('skyvern-1.0')}
                        >
                          <span className="engine-icon">◈</span>
                          <span className="engine-name">Skyvern 1.0</span>
                          <span className="engine-badge">Simple Tasks</span>
                        </button>
                      </div>
                    </div>

                    {/* Task Prompt */}
                    <div className="form-group">
                      <label htmlFor="task-prompt" className="form-label">
                        <span className="label-icon">📝</span>
                        What should the AI do?
                      </label>
                      <textarea
                        ref={textareaRef}
                        id="task-prompt"
                        className="webtask-textarea"
                        placeholder="E.g., Search Amazon for wireless headphones under $100 and summarize the top 3 options..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    {/* Optional URL */}
                    <div className="form-group">
                      <label htmlFor="start-url" className="form-label">
                        <span className="label-icon">🔗</span>
                        Starting URL (optional)
                      </label>
                      <input
                        type="url"
                        id="start-url"
                        className="webtask-input"
                        placeholder="https://example.com (leave empty for AI to decide)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>

                    {/* Example Prompts */}
                    <div className="example-prompts">
                      <div className="example-header">
                        <span className="example-icon">✨</span>
                        <span className="example-label">Try an example:</span>
                      </div>
                      <div className="example-grid">
                        {examplePrompts.slice(0, 3).map((example, index) => (
                          <button
                            key={index}
                            type="button"
                            className="example-btn"
                            onClick={() => handleExampleClick(example)}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        className="webtask-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="webtask-submit-btn"
                      disabled={isProcessing || !prompt.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <div className="submit-spinner"></div>
                          <span>AI is working...</span>
                        </>
                      ) : (
                        <>
                          <span className="submit-icon">🚀</span>
                          <span>Run AI Web Task</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Results Display */
                <div className="webtask-results">
                  {/* Status Badge */}
                  <div className={`status-badge status-${result.status}`}>
                    <span className="status-icon">
                      {result.status === 'completed' ? '✓' : 
                       result.status === 'running' ? '⏳' : 
                       result.status === 'failed' ? '✗' : '◯'}
                    </span>
                    <span className="status-text">
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </div>

                  {/* Educational Tip */}
                  {result.educational_tip && (
                    <div className="result-tip">
                      <span className="tip-icon">💡</span>
                      <p className="tip-text">{result.educational_tip}</p>
                    </div>
                  )}

                  {/* Task Output */}
                  {result.output && (
                    <div className="result-section">
                      <h3 className="result-section-title">
                        <span className="section-icon">📊</span>
                        Task Output
                      </h3>
                      <div className="result-output">
                        {typeof result.output === 'string' ? (
                          <p className="output-text">{result.output}</p>
                        ) : (
                          <pre className="output-json">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screenshots */}
                  {result.screenshot_urls && result.screenshot_urls.length > 0 && (
                    <div className="result-section">
                      <h3 className="result-section-title">
                        <span className="section-icon">📸</span>
                        Screenshots
                      </h3>
                      <div className="screenshot-grid">
                        {result.screenshot_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="screenshot-link"
                          >
                            <img
                              src={url}
                              alt={`Screenshot ${index + 1}`}
                              className="screenshot-img"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recording */}
                  {result.recording_url && (
                    <div className="result-section">
                      <h3 className="result-section-title">
                        <span className="section-icon">🎥</span>
                        Recording
                      </h3>
                      <a
                        href={result.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="recording-link"
                      >
                        <span className="link-icon">▶️</span>
                        <span className="link-text">Watch AI in Action</span>
                        <span className="link-arrow">→</span>
                      </a>
                    </div>
                  )}

                  {/* Downloaded Files */}
                  {result.downloaded_files && result.downloaded_files.length > 0 && (
                    <div className="result-section">
                      <h3 className="result-section-title">
                        <span className="section-icon">📥</span>
                        Downloaded Files
                      </h3>
                      <div className="files-list">
                        {result.downloaded_files.map((file, index) => (
                          <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file.filename}</span>
                            <span className="file-arrow">↓</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failure Reason */}
                  {result.failure_reason && (
                    <div className="result-section error-section">
                      <h3 className="result-section-title">
                        <span className="section-icon">⚠️</span>
                        Failure Reason
                      </h3>
                      <p className="failure-text">{result.failure_reason}</p>
                    </div>
                  )}

                  {/* Usage Info */}
                  {result.usage && (
                    <div className="usage-info">
                      <span className="usage-icon">📊</span>
                      <span className="usage-text">
                        {result.usage.current}/{result.usage.limit} AI Web Tasks used this month
                        {result.usage.remaining > 0 && ` • ${result.usage.remaining} remaining`}
                      </span>
                    </div>
                  )}

                  {/* View on Skyvern */}
                  {result.app_url && (
                    <div className="result-section">
                      <a
                        href={result.app_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="skyvern-link"
                      >
                        <span className="link-icon">🔗</span>
                        <span className="link-text">View Full Details on Skyvern</span>
                        <span className="link-arrow">→</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="result-actions">
                    <button className="action-btn primary" onClick={handleReset}>
                      <span className="btn-icon">✨</span>
                      <span>New Task</span>
                    </button>
                    <button className="action-btn secondary" onClick={onClose}>
                      <span className="btn-icon">✓</span>
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="webtask-modal-footer">
              <div className="footer-info">
                <span className="footer-icon">🔒</span>
                <span className="footer-text">
                  Powered by Skyvern • Secure & Private
                </span>
              </div>
            </div>

            {/* Animated background particles */}
            <div className="webtask-particles">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${10 + Math.random() * 10}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WebTaskModal;
