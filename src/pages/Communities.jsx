import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ArrowRight, Globe } from 'lucide-react';
import { COMMUNITIES } from '../config/communities';
import { useCommunity } from '../context/CommunityContext';

const Communities = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { enterCommunity } = useCommunity();

    const handleEnterCommunity = (community) => {
        enterCommunity(community);
        navigate('/feed');
    };

    return (
        <div className="communities-page">
            {/* Hero */}
            <div className="communities-hero">
                <h1>Communities</h1>
                <p className="hero-subtitle">
                    Discover and join productive communities built on Nostr. Each community has its own identity, events, projects, and members.
                </p>
            </div>

            {/* Community Grid */}
            <div className="communities-grid">
                {COMMUNITIES.map((community) => (
                    <button
                        key={community.id}
                        className="community-card"
                        onClick={() => handleEnterCommunity(community)}
                    >
                        <div className="card-header" style={{ background: community.colors.primary }}>
                            <div className="card-logo">
                                {community.logo?.icon ? (
                                    <img src={community.logo.icon} alt={community.name} />
                                ) : (
                                    <Globe size={32} color="white" />
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            <h3>{community.name}</h3>
                            <p className="card-tagline">{community.tagline}</p>
                            {community.description && (
                                <p className="card-description">{community.description}</p>
                            )}
                            <div className="card-footer">
                                <div className="card-meta">
                                    <Users size={14} />
                                    <span>{community.memberCount || 'Open'}</span>
                                </div>
                                <div className="card-enter">
                                    Enter <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Accent bar in community's secondary colour */}
                        <div className="card-accent" style={{ background: community.colors.secondary }} />
                    </button>
                ))}

                {/* Placeholder for future communities */}
                <div className="community-card placeholder">
                    <div className="card-header placeholder-header">
                        <Globe size={32} color="var(--color-gray-400)" />
                    </div>
                    <div className="card-body">
                        <h3 style={{ color: 'var(--color-gray-400)' }}>Your Community</h3>
                        <p className="card-tagline">Start your own community on Nostrbook. Customize branding, invite members, and build something great.</p>
                        <div className="card-footer">
                            <span className="coming-soon-badge">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .communities-page {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 2rem var(--spacing-md);
                }

                .communities-hero {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .communities-hero h1 {
                    font-size: 2rem;
                    color: var(--color-gray-900);
                    margin-bottom: 0.5rem;
                }

                .hero-subtitle {
                    color: var(--color-gray-500);
                    font-size: 1rem;
                    max-width: 540px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                .communities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .community-card {
                    position: relative;
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-gray-200);
                    overflow: hidden;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    font-family: inherit;
                    width: 100%;
                }

                .community-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--color-gray-300);
                }

                .community-card.placeholder {
                    cursor: default;
                    opacity: 0.7;
                    border-style: dashed;
                }
                .community-card.placeholder:hover {
                    transform: none;
                    box-shadow: none;
                }

                .card-header {
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .placeholder-header {
                    background: var(--color-gray-100) !important;
                }

                .card-logo img {
                    height: 48px;
                    width: auto;
                    filter: brightness(0) invert(1);
                }

                .card-body {
                    padding: 1.25rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .card-body h3 {
                    font-size: 1.15rem;
                    color: var(--color-gray-900);
                    margin-bottom: 0.35rem;
                }

                .card-tagline {
                    font-size: 0.85rem;
                    color: var(--color-gray-500);
                    margin-bottom: 0.5rem;
                    line-height: 1.5;
                }

                .card-description {
                    font-size: 0.8rem;
                    color: var(--color-gray-400);
                    line-height: 1.5;
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: auto;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--color-gray-200);
                }

                .card-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--color-gray-400);
                    font-size: 0.8rem;
                }

                .card-enter {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--color-primary);
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .card-accent {
                    height: 3px;
                    width: 100%;
                }

                .coming-soon-badge {
                    font-size: 0.75rem;
                    color: var(--color-gray-400);
                    background: var(--color-gray-100);
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius-full);
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .communities-page {
                        padding: 1rem var(--spacing-sm);
                    }
                    .communities-hero h1 {
                        font-size: 1.5rem;
                    }
                    .communities-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Communities;
