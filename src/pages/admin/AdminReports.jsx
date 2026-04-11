import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, ChevronUp, MessageCircle, CheckCircle, Eye, XCircle } from 'lucide-react';
import { adminApi } from '../../services/api';

const STATUS_META = {
    PENDING:   { label: 'Pending',   color: '#b45309', bg: '#fffbeb', border: '#fbbf24' },
    REVIEWED:  { label: 'Reviewed',  color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
    RESOLVED:  { label: 'Resolved',  color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
    DISMISSED: { label: 'Dismissed', color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
};

const TYPE_META = {
    USER:    { label: 'User',    color: '#7c3aed', bg: '#f5f3ff' },
    POST:    { label: 'Post',    color: '#0891b2', bg: '#ecfeff' },
    EVENT:   { label: 'Event',   color: '#d97706', bg: '#fffbeb' },
    PROJECT: { label: 'Project', color: '#16a34a', bg: '#f0fdf4' },
    MESSAGE: { label: 'Message', color: '#dc2626', bg: '#fef2f2' },
};

const REASON_LABELS = {
    SPAM:               'Spam',
    HARASSMENT:         'Harassment',
    VIOLENCE_THREATS:   'Violence/Threats',
    ILLEGAL_CONTENT:    'Illegal Content',
    INAPPROPRIATE_NSFW: 'Inappropriate/NSFW',
    OTHER:              'Other',
};

const STATUS_OPTIONS = ['', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
const TYPE_OPTIONS   = ['', 'USER', 'POST', 'EVENT', 'PROJECT', 'MESSAGE'];

const formatRelative = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const formatDate = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
});

const truncate = (str, len = 20) => {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '…' : str;
};

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.PENDING;
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: meta.color,
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            whiteSpace: 'nowrap',
        }}>
            {meta.label}
        </span>
    );
};

const TypeBadge = ({ type }) => {
    const meta = TYPE_META[type?.toUpperCase()] || { label: type, color: '#6b7280', bg: '#f3f4f6' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: meta.color,
            background: meta.bg,
            whiteSpace: 'nowrap',
        }}>
            {meta.label}
        </span>
    );
};

const AdminReports = () => {
    const [items, setItems]           = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [loading, setLoading]       = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter]     = useState('');
    const [expandedId, setExpandedId]     = useState(null);
    const [noteText, setNoteText]         = useState('');
    const [saving, setSaving]             = useState(null);

    const fetchReports = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 30 };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter)   params.targetType = typeFilter;
            const res = await adminApi.reports(params);
            setItems(Array.isArray(res?.data) ? res.data : []);
            setPagination(res?.pagination || { page: 1, total: 0, totalPages: 1 });
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => { fetchReports(1); }, [fetchReports]);

    const handleStatusUpdate = async (id, status) => {
        setSaving(id + status);
        try {
            const updated = await adminApi.updateReport(id, { status });
            setItems(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
        } catch (err) {
            console.error('Failed to update report:', err);
        } finally {
            setSaving(null);
        }
    };

    const handleSaveNote = async (id) => {
        setSaving(id + 'note');
        try {
            const updated = await adminApi.updateReport(id, { adminNote: noteText });
            setItems(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
            setExpandedId(null);
        } catch (err) {
            console.error('Failed to save note:', err);
        } finally {
            setSaving(null);
        }
    };

    const toggleExpand = (id, currentNote) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            setNoteText(currentNote || '');
        }
    };

    const isSaving = (id, suffix) => saving === id + suffix;

    return (
        <>
            <div className="rpt-header">
                <div>
                    <h1>
                        Content Reports
                        {pagination.total > 0 && (
                            <span className="rpt-count-badge">{pagination.total}</span>
                        )}
                    </h1>
                    <p className="rpt-subtitle">Review and action user-submitted content reports</p>
                </div>
            </div>

            {/* Filter bar */}
            <div className="rpt-toolbar">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rpt-select"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.filter(Boolean).map(s => (
                        <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                    ))}
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rpt-select"
                >
                    <option value="">All Types</option>
                    {TYPE_OPTIONS.filter(Boolean).map(t => (
                        <option key={t} value={t}>{TYPE_META[t]?.label || t}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="rpt-state-center">
                    <Loader2 size={24} className="rpt-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="rpt-state-center rpt-empty">
                    <CheckCircle size={40} color="#16a34a" />
                    <p>No reports found.</p>
                    {(statusFilter || typeFilter) && (
                        <button
                            className="rpt-clear-btn"
                            onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="rpt-table-wrap">
                    <table className="rpt-table">
                        <thead>
                            <tr>
                                <th>Reporter</th>
                                <th>Type</th>
                                <th>Target ID</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const isExpanded = expandedId === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr className={`rpt-row ${isExpanded ? 'rpt-row-open' : ''}`}>
                                            {/* Reporter */}
                                            <td>
                                                <div className="rpt-reporter">
                                                    <div className="rpt-avatar">
                                                        {item.reporter?.profile?.avatar
                                                            ? <img src={item.reporter.profile.avatar} alt="" />
                                                            : <span>{(item.reporter?.profile?.name || item.reporter?.email || '?')[0].toUpperCase()}</span>
                                                        }
                                                    </div>
                                                    <span className="rpt-reporter-name">
                                                        {item.reporter?.profile?.name || item.reporter?.email || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td><TypeBadge type={item.targetType} /></td>

                                            {/* Target ID */}
                                            <td>
                                                <code
                                                    className="rpt-target-id"
                                                    title={item.targetId}
                                                >
                                                    {truncate(item.targetId, 16)}
                                                </code>
                                            </td>

                                            {/* Reason */}
                                            <td className="rpt-reason">
                                                {REASON_LABELS[item.reason] || item.reason}
                                            </td>

                                            {/* Status */}
                                            <td><StatusBadge status={item.status} /></td>

                                            {/* Created */}
                                            <td
                                                className="rpt-date"
                                                title={formatDate(item.createdAt)}
                                            >
                                                {formatRelative(item.createdAt)}
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="rpt-actions">
                                                    {item.status !== 'REVIEWED' && (
                                                        <button
                                                            className="rpt-action-btn rpt-action-review"
                                                            title="Mark Reviewed"
                                                            disabled={!!saving}
                                                            onClick={() => handleStatusUpdate(item.id, 'REVIEWED')}
                                                        >
                                                            {isSaving(item.id, 'REVIEWED')
                                                                ? <Loader2 size={13} className="rpt-spin" />
                                                                : <Eye size={13} />
                                                            }
                                                        </button>
                                                    )}
                                                    {item.status !== 'RESOLVED' && (
                                                        <button
                                                            className="rpt-action-btn rpt-action-resolve"
                                                            title="Resolve"
                                                            disabled={!!saving}
                                                            onClick={() => handleStatusUpdate(item.id, 'RESOLVED')}
                                                        >
                                                            {isSaving(item.id, 'RESOLVED')
                                                                ? <Loader2 size={13} className="rpt-spin" />
                                                                : <CheckCircle size={13} />
                                                            }
                                                        </button>
                                                    )}
                                                    {item.status !== 'DISMISSED' && (
                                                        <button
                                                            className="rpt-action-btn rpt-action-dismiss"
                                                            title="Dismiss"
                                                            disabled={!!saving}
                                                            onClick={() => handleStatusUpdate(item.id, 'DISMISSED')}
                                                        >
                                                            {isSaving(item.id, 'DISMISSED')
                                                                ? <Loader2 size={13} className="rpt-spin" />
                                                                : <XCircle size={13} />
                                                            }
                                                        </button>
                                                    )}
                                                    <button
                                                        className={`rpt-action-btn rpt-action-note ${item.adminNote ? 'has-note' : ''}`}
                                                        title={item.adminNote ? 'Edit note' : 'Add note'}
                                                        onClick={() => toggleExpand(item.id, item.adminNote)}
                                                    >
                                                        <MessageCircle size={13} />
                                                        {isExpanded
                                                            ? <ChevronUp size={11} />
                                                            : <ChevronDown size={11} />
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable detail panel */}
                                        {isExpanded && (
                                            <tr className="rpt-detail-row">
                                                <td colSpan={7}>
                                                    <div className="rpt-detail-panel">
                                                        {item.details && (
                                                            <div className="rpt-detail-section">
                                                                <span className="rpt-detail-label">Details from reporter</span>
                                                                <p className="rpt-detail-text">{item.details}</p>
                                                            </div>
                                                        )}
                                                        <div className="rpt-note-editor">
                                                            <label className="rpt-detail-label">Admin Note</label>
                                                            <textarea
                                                                className="rpt-note-textarea"
                                                                value={noteText}
                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                placeholder="Internal note — not visible to the user..."
                                                                rows={2}
                                                            />
                                                            <div className="rpt-note-actions">
                                                                <button
                                                                    className="rpt-note-save"
                                                                    onClick={() => handleSaveNote(item.id)}
                                                                    disabled={isSaving(item.id, 'note')}
                                                                >
                                                                    {isSaving(item.id, 'note')
                                                                        ? <><Loader2 size={13} className="rpt-spin" /> Saving...</>
                                                                        : 'Save Note'
                                                                    }
                                                                </button>
                                                                <button
                                                                    className="rpt-note-cancel"
                                                                    onClick={() => setExpandedId(null)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="rpt-pagination">
                    <button
                        className="rpt-page-btn"
                        onClick={() => fetchReports(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Prev
                    </button>
                    <span className="rpt-page-info">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="rpt-page-btn"
                        onClick={() => fetchReports(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <style jsx>{`
                /* Header */
                .rpt-header { margin-bottom: 1.5rem; }
                .rpt-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .rpt-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.1rem 0.55rem;
                    border-radius: 9999px;
                    background: var(--color-primary);
                    color: white;
                    font-size: 0.78rem;
                    font-weight: 700;
                    min-width: 24px;
                }
                .rpt-subtitle { color: var(--color-gray-500); font-size: 0.9rem; }

                /* Toolbar */
                .rpt-toolbar {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                .rpt-select {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    background: var(--color-surface);
                    color: var(--color-text);
                    cursor: pointer;
                }

                /* States */
                .rpt-state-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 4rem 1rem;
                    color: var(--color-gray-500);
                }
                .rpt-empty p { font-size: 0.95rem; margin: 0; }
                .rpt-clear-btn {
                    padding: 0.4rem 1rem;
                    border: 1px solid var(--color-gray-300);
                    border-radius: 9999px;
                    background: var(--color-surface);
                    color: var(--color-text);
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .rpt-clear-btn:hover { background: var(--color-gray-100); }

                /* Table */
                .rpt-table-wrap {
                    overflow-x: auto;
                    border-radius: 0.75rem;
                    border: 1px solid var(--color-gray-200);
                    background: var(--color-surface);
                }
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .rpt-table th {
                    text-align: left;
                    padding: 0.7rem 0.9rem;
                    font-size: 0.73rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: var(--color-gray-500);
                    border-bottom: 1px solid var(--color-gray-200);
                    white-space: nowrap;
                    background: var(--color-gray-50);
                }
                .rpt-row td {
                    padding: 0.75rem 0.9rem;
                    border-bottom: 1px solid var(--color-gray-100);
                    vertical-align: middle;
                }
                .rpt-row:hover td { background: var(--color-gray-50); }
                .rpt-row-open td { background: var(--color-gray-50); }
                .rpt-row:last-child td { border-bottom: none; }

                /* Reporter cell */
                .rpt-reporter {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .rpt-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: var(--color-gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--color-gray-600);
                    flex-shrink: 0;
                }
                .rpt-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .rpt-reporter-name {
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: var(--color-text);
                    white-space: nowrap;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Other cells */
                .rpt-target-id {
                    font-family: monospace;
                    font-size: 0.75rem;
                    color: var(--color-gray-500);
                    background: var(--color-gray-100);
                    padding: 0.1rem 0.35rem;
                    border-radius: 4px;
                }
                .rpt-reason {
                    color: var(--color-text);
                    white-space: nowrap;
                }
                .rpt-date {
                    color: var(--color-gray-400);
                    white-space: nowrap;
                    font-size: 0.8rem;
                }

                /* Action buttons */
                .rpt-actions {
                    display: flex;
                    gap: 0.3rem;
                    align-items: center;
                }
                .rpt-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 5px 7px;
                    border: 1px solid var(--color-gray-200);
                    border-radius: 6px;
                    background: var(--color-surface);
                    cursor: pointer;
                    color: var(--color-gray-500);
                    transition: all 0.15s;
                    font-size: 0.75rem;
                }
                .rpt-action-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                .rpt-action-review:hover  { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }
                .rpt-action-resolve:hover { color: #15803d; border-color: #86efac; background: #f0fdf4; }
                .rpt-action-dismiss:hover { color: #6b7280; border-color: #d1d5db; background: #f3f4f6; }
                .rpt-action-note:hover    { color: var(--color-primary); border-color: var(--color-primary); background: var(--color-blue-tint); }
                .rpt-action-note.has-note { color: var(--color-primary); border-color: var(--color-primary); }

                /* Detail / expand row */
                .rpt-detail-row td { padding: 0; border-bottom: 1px solid var(--color-gray-200); }
                .rpt-detail-panel {
                    padding: 1rem 1.25rem;
                    background: var(--color-gray-50);
                    border-top: 1px solid var(--color-gray-100);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .rpt-detail-section { display: flex; flex-direction: column; gap: 0.25rem; }
                .rpt-detail-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-gray-400);
                }
                .rpt-detail-text {
                    font-size: 0.875rem;
                    color: var(--color-text);
                    line-height: 1.5;
                    margin: 0;
                    white-space: pre-wrap;
                }
                .rpt-note-editor { display: flex; flex-direction: column; gap: 0.4rem; }
                .rpt-note-textarea {
                    width: 100%;
                    padding: 0.5rem 0.65rem;
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    font-family: inherit;
                    resize: vertical;
                    outline: none;
                    background: var(--color-surface);
                    color: var(--color-text);
                    box-sizing: border-box;
                }
                .rpt-note-textarea:focus { border-color: var(--color-primary); }
                .rpt-note-actions { display: flex; gap: 0.5rem; }
                .rpt-note-save {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0.35rem 0.75rem;
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .rpt-note-save:disabled { opacity: 0.5; cursor: not-allowed; }
                .rpt-note-cancel {
                    padding: 0.35rem 0.75rem;
                    background: none;
                    color: var(--color-gray-500);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    cursor: pointer;
                }

                /* Pagination */
                .rpt-pagination {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                    align-items: center;
                    margin-top: 1.5rem;
                }
                .rpt-page-btn {
                    padding: 0.4rem 1rem;
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-sm);
                    background: var(--color-surface);
                    color: var(--color-text);
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .rpt-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .rpt-page-btn:not(:disabled):hover { background: var(--color-gray-100); }
                .rpt-page-info { font-size: 0.85rem; color: var(--color-gray-500); }

                /* Spinner */
                .rpt-spin { animation: rpt-spin 1s linear infinite; }
                @keyframes rpt-spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .rpt-table th:nth-child(3),
                    .rpt-table td:nth-child(3),
                    .rpt-table th:nth-child(6),
                    .rpt-table td:nth-child(6) { display: none; }
                }
            `}</style>
        </>
    );
};

export default AdminReports;
