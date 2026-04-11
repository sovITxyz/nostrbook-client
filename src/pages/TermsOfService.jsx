import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
    const { t } = useTranslation();

    return (
        <div className="tos-page">
            <div className="tos-container">
                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>

                <h1 className="tos-title">Terms of Service</h1>
                <p className="tos-last-updated">Last updated: April 11, 2026</p>

                <p className="tos-intro">
                    These Terms of Service ("Terms") govern your access to and use of Nostrbook, a Nostr-native
                    community social platform. Please read them carefully before using our services.
                </p>

                {/* 1. Acceptance of Terms */}
                <section className="tos-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Nostrbook, you agree to be bound by these Terms and all applicable
                        laws and regulations. If you do not agree with any part of these Terms, you must not use
                        the service.
                    </p>
                    <p>
                        You must be at least <strong>18 years of age</strong> to use Nostrbook. By using the
                        platform, you represent and warrant that you meet this age requirement. If you are under
                        18, please do not use or attempt to access this service.
                    </p>
                </section>

                {/* 2. Account & Identity */}
                <section className="tos-section">
                    <h2>2. Account &amp; Identity</h2>
                    <p>
                        Nostrbook accounts are based on <strong>Nostr cryptographic keypairs</strong>. Your public
                        key serves as your identity on the platform, and your private key controls access to that
                        identity.
                    </p>
                    <ul>
                        <li>
                            <strong>Key security is your responsibility.</strong> You are solely responsible for
                            safeguarding your private key. Nostrbook does not store, have access to, or have any
                            ability to recover your private key. If you lose your private key, access to your
                            account cannot be restored by us.
                        </li>
                        <li>
                            <strong>One account per person.</strong> You may maintain only one account on
                            Nostrbook unless you have received express written permission from us to do otherwise.
                        </li>
                        <li>
                            <strong>Accurate information.</strong> You agree to provide accurate, current, and
                            complete information in your profile and not to misrepresent yourself or your
                            affiliations.
                        </li>
                        <li>
                            <strong>Account security.</strong> You are responsible for all activity that occurs
                            under your account. Notify us immediately if you suspect unauthorized use of your
                            identity or keypair.
                        </li>
                    </ul>
                </section>

                {/* 3. Acceptable Use */}
                <section className="tos-section">
                    <h2>3. Acceptable Use</h2>
                    <p>
                        You agree to use Nostrbook only for lawful purposes and in a manner that does not infringe
                        the rights of, restrict, or inhibit the use and enjoyment of the platform by others.
                    </p>
                    <p>You must not:</p>
                    <ul>
                        <li>Post, upload, or distribute any content that is illegal under applicable law, including child sexual abuse material (CSAM), content that facilitates violence, or content that violates intellectual property rights</li>
                        <li>Harass, threaten, intimidate, stalk, or abuse any other user or third party</li>
                        <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity</li>
                        <li>Send unsolicited messages, spam, or engage in any form of automated bulk messaging</li>
                        <li>Attempt to exploit, probe, scan, or test the vulnerability of the platform, or circumvent any security or authentication measures</li>
                        <li>Circumvent bans, suspensions, or moderation actions imposed by Nostrbook</li>
                        <li>Scrape, crawl, or otherwise collect data from the platform at scale without prior written authorization</li>
                        <li>Use the platform to facilitate the distribution of malware, viruses, or other malicious code</li>
                    </ul>
                    <p>
                        Violation of these acceptable use standards may result in immediate suspension or
                        termination of your account without notice.
                    </p>
                </section>

                {/* 4. User-Generated Content */}
                <section className="tos-section">
                    <h2>4. User-Generated Content</h2>
                    <p>
                        <strong>You retain ownership of your content.</strong> Content you create and publish
                        remains yours. By publishing content on Nostrbook, you grant Nostrbook a non-exclusive,
                        worldwide, royalty-free license to display, distribute, and transmit your content as
                        necessary to operate the platform.
                    </p>
                    <p>
                        <strong>Nostr protocol and public relays.</strong> Content published to public Nostr
                        relays is governed by the Nostr protocol, not solely by these Terms. Once published to a
                        public relay, content may be propagated across the Nostr network and is outside of
                        Nostrbook's control. You acknowledge and accept this characteristic of the protocol.
                    </p>
                    <p>
                        <strong>Your responsibility.</strong> You are solely responsible for the content you
                        publish. You represent that you have all necessary rights to publish such content and that
                        it does not violate any law or the rights of any third party.
                    </p>
                    <p>
                        <strong>Content removal.</strong> Nostrbook reserves the right to remove or restrict
                        access to any content that, in our sole determination, violates these Terms or our
                        Community Guidelines. Removal from Nostrbook does not guarantee removal from public Nostr
                        relays.
                    </p>
                </section>

                {/* 5. Community Guidelines */}
                <section className="tos-section">
                    <h2>5. Community Guidelines</h2>
                    <p>
                        Nostrbook is built on the principle of open, respectful community. All users are expected
                        to treat one another with dignity and respect.
                    </p>
                    <ul>
                        <li><strong>No hate speech.</strong> Content that promotes hatred, discrimination, or violence against individuals or groups based on protected characteristics — including race, ethnicity, religion, gender, sexual orientation, disability, or national origin — is prohibited.</li>
                        <li><strong>No harassment or threats.</strong> Targeted harassment, coordinated abuse, doxxing, threats of violence, or any behavior intended to intimidate or harm other users is not permitted.</li>
                        <li><strong>NSFW content.</strong> Adult or not-safe-for-work content is permitted only where appropriate content warnings are clearly applied. Such content must not be visible by default to users who have not opted in.</li>
                        <li><strong>No financial scams or fraud.</strong> You must not use Nostrbook to promote or conduct fraudulent investment schemes, Ponzi schemes, rug pulls, pump-and-dump schemes, or any other deceptive financial activity.</li>
                    </ul>
                    <p>
                        Violations of the Community Guidelines may result in content removal, a temporary
                        account suspension, or a permanent ban, depending on severity and history.
                    </p>
                </section>

                {/* 6. Financial Features & Disclaimers */}
                <section className="tos-section">
                    <h2>6. Financial Features &amp; Disclaimers</h2>
                    <p>
                        Nostrbook includes Lightning Network and Bitcoin payment features, including the ability
                        to send and receive zaps (micropayments) and tips.
                    </p>
                    <div className="tos-callout">
                        <strong>IMPORTANT: Nostrbook is NOT a financial institution, broker-dealer, investment
                        advisor, or money services business.</strong> We do not custody, hold, transmit, or
                        control your funds at any time. All Lightning and Bitcoin transactions are peer-to-peer.
                    </div>
                    <ul>
                        <li><strong>Not financial advice.</strong> Nothing on Nostrbook constitutes financial, investment, legal, or tax advice. All investment and financial decisions are solely your own.</li>
                        <li><strong>Assumption of risk.</strong> You assume all risk associated with financial transactions made through or facilitated by the platform, including the risk of loss of funds due to network failures, incorrect addresses, or user error.</li>
                        <li><strong>Zaps and tips are voluntary and non-refundable.</strong> Payments sent as zaps or tips are voluntary gratuities. They are final and non-refundable once broadcast to the Lightning Network.</li>
                        <li><strong>No custody.</strong> Nostrbook does not hold, manage, or have access to your Bitcoin or Lightning funds at any point.</li>
                        <li><strong>Regulatory compliance.</strong> You are responsible for complying with all applicable laws and regulations in your jurisdiction regarding cryptocurrency transactions and reporting obligations.</li>
                    </ul>
                </section>

                {/* 7. Privacy */}
                <section className="tos-section">
                    <h2>7. Privacy</h2>
                    <p>
                        Your use of Nostrbook is also governed by our{' '}
                        <Link to="/privacy" className="tos-link">Privacy Policy</Link>, which is incorporated
                        into these Terms by reference. Please review the Privacy Policy to understand our
                        practices regarding the collection and use of your information.
                    </p>
                    <p>
                        <strong>Nostr is a public protocol.</strong> Content you publish to public Nostr relays
                        may be visible to anyone with access to those relays — including third-party applications,
                        crawlers, and other users. Nostrbook cannot guarantee the confidentiality of content
                        published to public relays. Exercise appropriate discretion in the content you share.
                    </p>
                </section>

                {/* 8. Intellectual Property */}
                <section className="tos-section">
                    <h2>8. Intellectual Property</h2>
                    <p>
                        The Nostrbook name, logo, branding, and distinctive visual elements are owned by or
                        licensed to Nostrbook and its creators. You may not use these marks without prior written
                        permission.
                    </p>
                    <p>
                        The Nostrbook platform incorporates open source software components, each of which is
                        licensed under its respective open source license. Nothing in these Terms limits rights
                        granted to you under applicable open source licenses.
                    </p>
                    <p>
                        User-generated content remains the intellectual property of its respective creators,
                        subject to the license granted in Section 4 above.
                    </p>
                </section>

                {/* 9. Termination */}
                <section className="tos-section">
                    <h2>9. Termination</h2>
                    <p>
                        <strong>By Nostrbook.</strong> We reserve the right to suspend or permanently terminate
                        any account that violates these Terms, the Community Guidelines, or any applicable law,
                        with or without prior notice, at our sole discretion.
                    </p>
                    <p>
                        <strong>By you.</strong> You may delete your account at any time through your account
                        settings. A 30-day grace period applies following account deletion, during which you may
                        restore your account. After this period, your account data on Nostrbook's servers will be
                        permanently deleted.
                    </p>
                    <p>
                        <strong>Effect of termination.</strong> Upon termination, your license to use the
                        platform ceases immediately. Content you have published to public Nostr relays will remain
                        on those relays, as this is outside of Nostrbook's control. Provisions of these Terms
                        that by their nature should survive termination — including Sections 4, 6, 10, and 11 —
                        will survive.
                    </p>
                </section>

                {/* 10. Limitation of Liability */}
                <section className="tos-section">
                    <h2>10. Limitation of Liability</h2>
                    <p>
                        <strong>No warranties.</strong> Nostrbook is provided "as is" and "as available," without
                        warranties of any kind, either express or implied, including but not limited to implied
                        warranties of merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                    <p>
                        <strong>Limitation of damages.</strong> To the fullest extent permitted by applicable
                        law, Nostrbook and its operators, affiliates, employees, and contributors shall not be
                        liable for any indirect, incidental, special, consequential, or punitive damages, or any
                        loss of profits or revenues, arising out of or related to your use of the platform.
                    </p>
                    <p>Without limiting the foregoing, we are expressly not liable for:</p>
                    <ul>
                        <li>Loss of funds resulting from Lightning Network or Bitcoin transactions, including failed transactions, incorrect routing, or user error</li>
                        <li>Loss of access to your account or content due to the loss of your private key</li>
                        <li>Content published, posted, or transmitted by other users on the platform</li>
                        <li>Relay downtime, data loss, or failure of Nostr relay infrastructure</li>
                        <li>Failures, outages, or acts of third-party services, wallet providers, or Lightning nodes</li>
                    </ul>
                </section>

                {/* 11. Dispute Resolution */}
                <section className="tos-section">
                    <h2>11. Dispute Resolution</h2>
                    <p>
                        <strong>Good-faith negotiation.</strong> Before initiating any formal legal proceedings,
                        you agree to first contact us at{' '}
                        <a href="mailto:legal@nostrbook.app" className="tos-link">legal@nostrbook.app</a> and
                        attempt to resolve the dispute through good-faith negotiation for at least 30 days.
                    </p>
                    <p>
                        <strong>Governing law.</strong> These Terms shall be governed by and construed in
                        accordance with the laws of [jurisdiction — to be determined]. Any disputes that cannot
                        be resolved through negotiation shall be subject to the exclusive jurisdiction of the
                        courts of that jurisdiction.
                    </p>
                    <p>
                        <strong>Class action waiver.</strong> You agree that any dispute resolution proceedings
                        will be conducted only on an individual basis and not in a class, consolidated, or
                        representative action. You waive any right to participate in a class action lawsuit or
                        class-wide arbitration against Nostrbook.
                    </p>
                </section>

                {/* 12. Changes to Terms */}
                <section className="tos-section">
                    <h2>12. Changes to These Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. When we make material changes, we
                        will update the "Last updated" date at the top of this page and, where practicable,
                        provide notice through the platform.
                    </p>
                    <p>
                        Your continued use of Nostrbook after any changes to these Terms constitutes your
                        acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop
                        using the service.
                    </p>
                    <p>
                        We encourage you to review these Terms periodically. The most current version will always
                        be available at <Link to="/terms" className="tos-link">nostrbook.app/terms</Link>.
                    </p>
                </section>

                {/* 13. Contact */}
                <section className="tos-section">
                    <h2>13. Contact</h2>
                    <p>
                        If you have any questions, concerns, or legal inquiries regarding these Terms of Service,
                        please reach out to us at:
                    </p>
                    <p>
                        <a href="mailto:legal@nostrbook.app" className="tos-link">legal@nostrbook.app</a>
                    </p>
                    <p>
                        For general support or feedback, visit the{' '}
                        <Link to="/feedback" className="tos-link">Feedback</Link> page.
                    </p>
                </section>
            </div>

            <style jsx>{styles}</style>
        </div>
    );
};

const styles = `
    .tos-page {
        max-width: 768px;
        margin: 0 auto;
        padding: 2rem 1rem 4rem;
    }
    .tos-container {
        background: var(--color-surface);
        border: 1px solid var(--color-gray-200);
        border-radius: 1.5rem;
        padding: 2.5rem;
    }
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--color-gray-500);
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        margin-bottom: 1.75rem;
        transition: color 0.2s;
    }
    .back-link:hover {
        color: var(--color-text);
    }
    .tos-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--color-text);
        margin-bottom: 0.25rem;
        line-height: 1.2;
    }
    .tos-last-updated {
        font-size: 0.8rem;
        color: var(--color-gray-400);
        margin-bottom: 1.5rem;
    }
    .tos-intro {
        font-size: 0.95rem;
        color: var(--color-gray-500);
        line-height: 1.7;
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--color-gray-200);
    }
    .tos-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--color-gray-200);
    }
    .tos-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    .tos-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 0.75rem;
    }
    .tos-section p {
        font-size: 0.9rem;
        color: var(--color-gray-600);
        line-height: 1.75;
        margin-bottom: 0.75rem;
    }
    .tos-section p:last-child {
        margin-bottom: 0;
    }
    .tos-section ul {
        list-style: disc;
        padding-left: 1.5rem;
        margin: 0.5rem 0 0.75rem;
    }
    .tos-section ul li {
        font-size: 0.9rem;
        color: var(--color-gray-600);
        line-height: 1.75;
        margin-bottom: 0.5rem;
    }
    .tos-section ul li:last-child {
        margin-bottom: 0;
    }
    .tos-callout {
        background: var(--color-gray-50);
        border: 1px solid var(--color-gray-200);
        border-left: 4px solid var(--color-primary);
        border-radius: 0.5rem;
        padding: 0.875rem 1rem;
        font-size: 0.875rem;
        color: var(--color-text);
        line-height: 1.6;
        margin: 0.75rem 0 1rem;
    }
    .tos-link {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
    }
    .tos-link:hover {
        text-decoration: underline;
    }
    @media (max-width: 768px) {
        .tos-page {
            padding: 1rem 0.75rem 3rem;
        }
        .tos-container {
            padding: 1.5rem 1.25rem;
            border-radius: 1rem;
        }
        .tos-title {
            font-size: 1.4rem;
        }
    }
    @media (max-width: 480px) {
        .tos-container {
            padding: 1.25rem 1rem;
        }
    }
`;

export default TermsOfService;
