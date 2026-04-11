import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, Database, Share2, Clock, UserCheck, Lock, Cookie, AlertTriangle, RefreshCw, Mail } from 'lucide-react';

const LAST_UPDATED = 'April 11, 2026';

const Section = ({ icon: Icon, title, children }) => (
    <div className="policy-section">
        <div className="section-header">
            <div className="section-icon">
                <Icon size={18} />
            </div>
            <h2>{title}</h2>
        </div>
        <div className="section-body">
            {children}
        </div>
    </div>
);

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="policy-page">
            <div className="container max-w-3xl">

                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} />
                    <span>{t('common.back', 'Back')}</span>
                </Link>

                <div className="policy-hero">
                    <h1>Privacy Policy</h1>
                    <p className="policy-subtitle">
                        Nostrbook is a Nostr-native community platform. We are committed to being
                        transparent about how we collect and use your information.
                    </p>
                    <p className="policy-updated">Last updated: {LAST_UPDATED}</p>
                </div>

                {/* 1. Information We Collect */}
                <Section icon={Database} title="Information We Collect">
                    <p>We collect the following categories of information when you use Nostrbook:</p>

                    <h3>Account &amp; Identity</h3>
                    <ul>
                        <li><strong>Display name</strong> — the name you choose when setting up your profile.</li>
                        <li><strong>Nostr public key (npub)</strong> — your cryptographic identity on the Nostr protocol. This is always public by design.</li>
                        <li><strong>Email address</strong> — optional, used for account recovery and platform announcements only.</li>
                        <li><strong>Profile photo and media</strong> — images or files you upload to your profile or posts.</li>
                        <li><strong>Location text</strong> — optional free-text field on your public profile (e.g. "Berlin, DE").</li>
                    </ul>

                    <h3>Technical &amp; Security Data</h3>
                    <ul>
                        <li><strong>IP addresses</strong> — logged per session and request for security monitoring and abuse prevention.</li>
                        <li><strong>Browser fingerprint hashes</strong> — a one-way hash derived from browser characteristics, used solely for ban evasion detection. The raw fingerprint is never stored.</li>
                        <li><strong>Push notification tokens</strong> — device tokens used to deliver push notifications when you opt in.</li>
                        <li><strong>Session metadata</strong> — user agent string, login timestamps, and session identifiers.</li>
                    </ul>

                    <h3>User-Generated Content</h3>
                    <ul>
                        <li>Posts, replies, reactions, and Nostr events you publish through the platform.</li>
                        <li>Direct messages sent through the platform (encrypted — see Section 3).</li>
                        <li>Projects, events, and other structured content you create.</li>
                    </ul>
                </Section>

                {/* 2. How We Use Your Information */}
                <Section icon={Shield} title="How We Use Your Information">
                    <p>We use the information we collect for the following purposes:</p>
                    <ul>
                        <li><strong>Providing platform services</strong> — to operate your account, display your profile, and deliver content.</li>
                        <li><strong>Nostr identity authentication</strong> — to verify your cryptographic identity via the Nostr protocol and issue authenticated sessions.</li>
                        <li><strong>Notifications</strong> — to deliver push notifications, email digests, or in-app alerts you have subscribed to.</li>
                        <li><strong>Community guidelines enforcement</strong> — to review reported content and take moderation action where required.</li>
                        <li><strong>Abuse and ban evasion prevention</strong> — to detect and block accounts that repeatedly violate our terms after banning.</li>
                        <li><strong>Platform improvement</strong> — to understand how features are used in aggregate, diagnose bugs, and improve reliability. We do not sell this data or use it for advertising.</li>
                    </ul>
                    <p>
                        We do not sell your personal data to third parties. We do not use your data to
                        build advertising profiles or share it with advertising networks.
                    </p>
                </Section>

                {/* 3. Nostr Protocol & Data Sharing */}
                <Section icon={Share2} title="Nostr Protocol &amp; Data Sharing">
                    <h3>Public Nature of Nostr</h3>
                    <p>
                        Nostrbook is built on the open Nostr protocol. Content you publish to Nostr
                        relays — including posts, profiles, reactions, and public events — is
                        <strong> public by design</strong> and propagates across a decentralised
                        network of relays. Once published to the network, this content cannot be
                        reliably recalled or deleted by us or anyone else.
                    </p>

                    <h3>Direct Messages</h3>
                    <p>
                        Direct messages sent through Nostrbook use{' '}
                        <strong>NIP-17 encrypted direct messages</strong>. Message content is
                        end-to-end encrypted between sender and recipient. We cannot read the content
                        of your direct messages; however, metadata (who messaged whom and when) may
                        be visible to relay operators.
                    </p>

                    <h3>Community Relays</h3>
                    <p>
                        Nostrbook operates community Nostr relays that require{' '}
                        <strong>NIP-42 authentication</strong> to read or write. Access to these
                        relays is restricted to authenticated members of the community.
                    </p>

                    <h3>Third-Party Services</h3>
                    <p>We integrate with the following third-party services:</p>
                    <ul>
                        <li>
                            <strong>keytr.org</strong> — passkey-based Nostr key recovery. If you
                            use this feature, an encrypted copy of your Nostr private key is stored
                            on keytr.org relays, accessible only via your passkey. See{' '}
                            <a href="https://keytr.org" target="_blank" rel="noopener noreferrer">keytr.org</a>{' '}
                            for their privacy policy.
                        </li>
                        <li>
                            <strong>Coinos</strong> — optional Lightning Network payment processing.
                            If you connect a Lightning wallet via Coinos, payment data is handled by
                            Coinos under their own privacy policy. This feature is entirely optional.
                        </li>
                        <li>
                            <strong>Public Nostr relays</strong> — content you publish may be
                            propagated to public relays including damus.io, primal.net, and others
                            in the broader Nostr network. These relays operate independently of
                            Nostrbook.
                        </li>
                    </ul>
                </Section>

                {/* 4. Data Retention */}
                <Section icon={Clock} title="Data Retention">
                    <ul>
                        <li>
                            <strong>Active accounts</strong> — your account data is retained for as
                            long as your account is active and in good standing.
                        </li>
                        <li>
                            <strong>Deleted accounts</strong> — when you delete your account, your
                            personal data enters a <strong>30-day grace period</strong> during which
                            deletion can be reversed on request. After 30 days, your account data is
                            permanently and irreversibly deleted from our systems.
                        </li>
                        <li>
                            <strong>Security and audit logs</strong> — IP address logs, session
                            records, and moderation audit logs are retained for security and
                            compliance purposes for up to 12 months after the relevant event.
                        </li>
                        <li>
                            <strong>Nostr network content</strong> — events you have published to
                            public Nostr relays cannot be deleted by us. Deletion requests to the
                            broader Nostr network are best-effort via NIP-09 delete events; relay
                            operators are not obligated to honour them.
                        </li>
                    </ul>
                </Section>

                {/* 5. Your Rights */}
                <Section icon={UserCheck} title="Your Rights &amp; Controls">
                    <p>You have the following rights over your data:</p>
                    <ul>
                        <li>
                            <strong>Access your data</strong> — go to{' '}
                            <Link to="/settings">Settings &gt; Export Data</Link> to download a
                            copy of your account data in JSON format.
                        </li>
                        <li>
                            <strong>Correct your information</strong> — update your profile at any
                            time via <Link to="/profile/edit">Profile Edit</Link>.
                        </li>
                        <li>
                            <strong>Delete your account</strong> — go to{' '}
                            <Link to="/settings">Settings &gt; Delete Account</Link>. Deletion is
                            permanent after the 30-day grace period.
                        </li>
                        <li>
                            <strong>Data portability</strong> — export your data as a structured
                            JSON file from Settings at any time.
                        </li>
                    </ul>

                    <h3>EU / GDPR</h3>
                    <p>
                        If you are located in the European Economic Area, you have additional rights
                        under the General Data Protection Regulation (GDPR), including the right to
                        object to processing, the right to erasure, and the right to lodge a
                        complaint with your local supervisory authority. Our legal basis for
                        processing your data is performance of a contract (providing the service you
                        signed up for) and legitimate interests (security and abuse prevention).
                        Contact us at{' '}
                        <a href="mailto:privacy@nostrbook.app">privacy@nostrbook.app</a> to exercise
                        your GDPR rights.
                    </p>

                    <h3>California / CCPA</h3>
                    <p>
                        If you are a California resident, the California Consumer Privacy Act (CCPA)
                        grants you the right to know what personal information we collect, the right
                        to delete your personal information, and the right to opt out of the sale of
                        your personal information. We do not sell personal information. To exercise
                        your CCPA rights, contact{' '}
                        <a href="mailto:privacy@nostrbook.app">privacy@nostrbook.app</a>.
                    </p>
                </Section>

                {/* 6. Security */}
                <Section icon={Lock} title="Security">
                    <ul>
                        <li>
                            <strong>Private keys never touch our servers.</strong> Your Nostr private
                            key is managed entirely in your browser or via a Nostr signing extension.
                            If you use passkey-based recovery, your key is encrypted client-side
                            before being stored.
                        </li>
                        <li>
                            <strong>Passwords are bcrypt hashed</strong> with a strong work factor.
                            We never store plaintext passwords.
                        </li>
                        <li>
                            <strong>Sessions are tracked</strong> by IP address and user agent to
                            detect suspicious access and allow you to review active sessions.
                        </li>
                        <li>
                            <strong>Browser fingerprinting</strong> is used exclusively for abuse
                            and ban evasion prevention. Fingerprint data is stored only as a
                            one-way hash and is never shared with third parties or used for
                            advertising.
                        </li>
                        <li>
                            All data in transit is encrypted via TLS. We follow industry-standard
                            security practices and conduct periodic reviews of our infrastructure.
                        </li>
                    </ul>
                </Section>

                {/* 7. Cookies & Local Storage */}
                <Section icon={Cookie} title="Cookies &amp; Local Storage">
                    <p>
                        <strong>We do not use tracking cookies or advertising cookies.</strong>
                    </p>

                    <h3>localStorage</h3>
                    <p>We store the following in your browser's localStorage:</p>
                    <ul>
                        <li>Authentication tokens (to keep you logged in)</li>
                        <li>Theme preference (light / dark / system)</li>
                        <li>Language preference</li>
                        <li>View preferences (list vs. grid layouts)</li>
                    </ul>

                    <h3>sessionStorage</h3>
                    <p>We store the following in your browser's sessionStorage:</p>
                    <ul>
                        <li>
                            Temporary Nostr key material — only while a signing session is active.
                            This data is automatically cleared when the browser tab is closed.
                        </li>
                    </ul>

                    <p>
                        No third-party analytics scripts, advertising pixels, or cross-site tracking
                        cookies are used on this platform.
                    </p>
                </Section>

                {/* 8. Children */}
                <Section icon={AlertTriangle} title="Children">
                    <p>
                        Nostrbook is not intended for users under the age of 18. We do not
                        knowingly collect personal information from anyone under 18. If you believe
                        a minor has created an account, please contact us at{' '}
                        <a href="mailto:privacy@nostrbook.app">privacy@nostrbook.app</a> and we
                        will promptly delete the account and associated data.
                    </p>
                </Section>

                {/* 9. Changes to This Policy */}
                <Section icon={RefreshCw} title="Changes to This Policy">
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in
                        our practices, legal requirements, or platform features. When we make
                        material changes, we will update the "Last updated" date at the top of this
                        page and, where appropriate, notify you via email or an in-app notification.
                    </p>
                    <p>
                        Your continued use of Nostrbook after any changes take effect constitutes
                        your acceptance of the revised policy. We encourage you to review this page
                        periodically.
                    </p>
                    <p className="policy-updated" style={{ marginTop: '0.5rem' }}>
                        Current version last updated: {LAST_UPDATED}
                    </p>
                </Section>

                {/* 10. Contact */}
                <Section icon={Mail} title="Contact">
                    <p>
                        If you have questions, concerns, or requests regarding this Privacy Policy
                        or the handling of your personal data, please contact us:
                    </p>
                    <div className="contact-block">
                        <p>
                            <strong>Privacy inquiries:</strong>{' '}
                            <a href="mailto:privacy@nostrbook.app">privacy@nostrbook.app</a>
                        </p>
                        <p>
                            We aim to respond to all privacy-related requests within 30 days.
                        </p>
                    </div>
                </Section>

                <div className="policy-footer">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} />
                        <span>{t('common.back', 'Back')}</span>
                    </Link>
                </div>

            </div>

            <style jsx>{`
                .policy-page {
                    background: var(--color-gray-50);
                    min-height: 100vh;
                    padding-bottom: 4rem;
                }

                .max-w-3xl {
                    max-width: 48rem;
                }

                .container {
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-gray-500);
                    font-size: 0.9rem;
                    font-weight: 500;
                    margin: 1.5rem 0;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .back-link:hover {
                    color: var(--color-text);
                }

                .policy-hero {
                    margin-bottom: 2rem;
                }
                .policy-hero h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--color-text);
                    margin-bottom: 0.75rem;
                    line-height: 1.2;
                }
                .policy-subtitle {
                    font-size: 1rem;
                    color: var(--color-gray-500);
                    line-height: 1.6;
                    margin-bottom: 0.5rem;
                }
                .policy-updated {
                    font-size: 0.82rem;
                    color: var(--color-gray-400);
                    font-style: italic;
                }

                /* Section card — mirrors settings-section */
                .policy-section {
                    background: var(--color-surface);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    background: var(--color-gray-50);
                    border-bottom: 1px solid var(--color-gray-200);
                }
                .section-icon {
                    width: 34px;
                    height: 34px;
                    background: var(--color-gray-100);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gray-600);
                    flex-shrink: 0;
                }
                .section-header h2 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--color-gray-700);
                    margin: 0;
                }

                .section-body {
                    padding: 1.25rem 1.5rem;
                    font-size: 0.92rem;
                    line-height: 1.7;
                    color: var(--color-text);
                }
                .section-body p {
                    margin: 0 0 0.9rem;
                }
                .section-body p:last-child {
                    margin-bottom: 0;
                }
                .section-body h3 {
                    font-size: 0.88rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: var(--color-gray-500);
                    margin: 1.25rem 0 0.5rem;
                }
                .section-body h3:first-child {
                    margin-top: 0;
                }
                .section-body ul {
                    margin: 0 0 0.9rem 1.25rem;
                    padding: 0;
                }
                .section-body ul li {
                    margin-bottom: 0.45rem;
                }
                .section-body ul li:last-child {
                    margin-bottom: 0;
                }
                .section-body a {
                    color: var(--color-primary);
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .section-body a:hover {
                    opacity: 0.8;
                }

                .contact-block {
                    background: var(--color-gray-50);
                    border: 1px solid var(--color-gray-200);
                    border-radius: var(--radius-md);
                    padding: 1rem 1.25rem;
                    margin-top: 0.75rem;
                    font-size: 0.9rem;
                }
                .contact-block p {
                    margin: 0 0 0.4rem;
                }
                .contact-block p:last-child {
                    margin-bottom: 0;
                    color: var(--color-gray-500);
                    font-size: 0.85rem;
                }

                .policy-footer {
                    padding-top: 0.5rem;
                }

                @media (max-width: 640px) {
                    .policy-hero h1 {
                        font-size: 1.5rem;
                    }
                    .section-body {
                        padding: 1rem 1.25rem;
                    }
                    .section-header {
                        padding: 0.875rem 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
