import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { reportsApi } from '../services/api';

const REASONS = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'VIOLENCE_THREATS', label: 'Violence/Threats' },
    { value: 'ILLEGAL_CONTENT', label: 'Illegal Content' },
    { value: 'INAPPROPRIATE_NSFW', label: 'Inappropriate/NSFW' },
    { value: 'OTHER', label: 'Other' },
];

/**
 * Reusable report modal for flagging content or users.
 *
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {string} props.targetType - e.g. 'post', 'user', 'event', 'project', 'message'
 * @param {string} props.targetId
 * @param {string} props.targetLabel - display label, e.g. "Post" or "User"
 */
const ReportModal = ({ isOpen, onClose, targetType, targetId, targetLabel = 'Content' }) => {
    const [reason, setReason] = useState('SPAM');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Lock body scroll while open
    useEffect(() => {
        if (!isOpen) return;
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setReason('SPAM');
            setDetails('');
            setSubmitting(false);
            setSuccess(false);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await reportsApi.create({
                targetType,
                targetId,
                reason,
                details: details.trim() || undefined,
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div
            className="report-overlay"
            onClick={handleOverlayClick}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="report-card" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
                {/* Header */}
                <div className="report-header">
                    <h3 id="report-modal-title" className="report-title">
                        <AlertTriangle size={18} />
                        Report {targetLabel}
                    </h3>
                    <button className="report-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="report-body">
                    {success ? (
                        <div className="report-success">
                            <CheckCircle size={40} color="#16a34a" />
                            <p className="success-text">Report submitted</p>
                            <p className="success-sub">Thank you for helping keep the community safe.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="report-desc">
                                Select the reason that best describes the issue with this {targetLabel.toLowerCase()}.
                            </p>

                            <div className="reason-list">
                                {REASONS.map((r) => (
                                    <label key={r.value} className={`reason-option ${reason === r.value ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="report-reason"
                                            value={r.value}
                                            checked={reason === r.value}
                                            onChange={() => setReason(r.value)}
                                        />
                                        <span className="reason-label">{r.label}</span>
                                    </label>
                                ))}
                            </div>

                            <textarea
                                className="report-textarea"
                                placeholder="Additional details (optional)"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                maxLength={1000}
                                rows={3}
                            />
                            <div className="char-count">{details.length} / 1000</div>

                            {error && <p className="error-text">{error}</p>}

                            <button
                                type="submit"
                                className="report-submit-btn"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="report-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Report'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
                .report-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                }

                .report-card {
                    background: var(--color-surface);
                    border-radius: 16px;
                    width: 90vw;
                    max-width: 420px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                }

                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .report-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 1.05rem;
                    font-family: var(--font-display, 'PP Formula Narrow', sans-serif);
                    margin: 0;
                    color: var(--color-gray-900);
                }

                .report-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--color-gray-500);
                    padding: 4px;
                    display: flex;
                    border-radius: 6px;
                    transition: color 0.15s;
                }
                .report-close:hover { color: var(--color-gray-900); }

                .report-body {
                    padding: 1.25rem;
                }

                .report-desc {
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                    margin: 0 0 1rem 0;
                    line-height: 1.5;
                }

                .reason-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    margin-bottom: 1rem;
                }

                .reason-option {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.55rem 0.75rem;
                    border: 1.5px solid var(--color-gray-200);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    background: var(--color-surface);
                }

                .reason-option:hover {
                    border-color: var(--color-gray-400);
                    background: var(--color-gray-50);
                }

                .reason-option.selected {
                    border-color: var(--color-primary);
                    background: var(--color-blue-tint);
                }

                .reason-option input[type="radio"] {
                    accent-color: var(--color-primary);
                    width: 15px;
                    height: 15px;
                    flex-shrink: 0;
                    cursor: pointer;
                }

                .reason-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-text);
                }

                .report-textarea {
                    width: 100%;
                    padding: 0.65rem 0.75rem;
                    border: 1.5px solid var(--color-gray-200);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-family: inherit;
                    resize: vertical;
                    outline: none;
                    background: var(--color-surface);
                    color: var(--color-text);
                    transition: border-color 0.15s;
                    box-sizing: border-box;
                    min-height: 80px;
                }

                .report-textarea:focus {
                    border-color: var(--color-primary);
                }

                .report-textarea::placeholder {
                    color: var(--color-gray-400);
                }

                .char-count {
                    text-align: right;
                    font-size: 0.73rem;
                    color: var(--color-gray-400);
                    margin-top: 0.25rem;
                    margin-bottom: 1rem;
                }

                .error-text {
                    color: var(--color-error, #dc2626);
                    font-size: 0.85rem;
                    margin-bottom: 0.75rem;
                }

                .report-submit-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.7rem;
                    background: var(--color-error, #dc2626);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: var(--font-sans, 'Inter', sans-serif);
                    transition: opacity 0.15s;
                }

                .report-submit-btn:hover { opacity: 0.88; }
                .report-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .report-spin {
                    animation: report-spin 1s linear infinite;
                }

                @keyframes report-spin {
                    to { transform: rotate(360deg); }
                }

                /* Success state */
                .report-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2rem 0;
                    text-align: center;
                }

                .success-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--color-gray-900);
                    margin: 0;
                }

                .success-sub {
                    font-size: 0.875rem;
                    color: var(--color-gray-500);
                    margin: 0;
                    max-width: 280px;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default ReportModal;
