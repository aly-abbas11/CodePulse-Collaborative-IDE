import {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    IconUsers,
    IconPlay,
    IconBolt,
    IconShare,
    IconArrowRight,
} from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import CodePulseLogo from '../components/CodePulseLogo';
import {workspaceUrl} from '../config';
import './Home.css';

const CodeLine = ({num, children}) => (
    <div className="cp-code-line">
        <span className="cp-line-num">{num}</span>
        <span>{children}</span>
    </div>
);

const useReveal = () => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    obs.disconnect();
                }
            },
            {threshold: 0.15}
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
};

const CompileWidget = () => {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setStep((s) => (s + 1) % 5), 1400);
        return () => clearInterval(t);
    }, []);
    const lines = [
        'Compiling project...',
        'Resolving dependencies',
        'Fetching packages',
        'Build complete in 1.4s',
    ];
    return (
        <div className="cp-compile">
            <div className="cp-compile-bar">
                <span className="cp-terminal-dot" />
                terminal — main.py
            </div>
            <div className="cp-compile-body">
                {lines.map((label, i) => (
                    <div
                        key={label}
                        className={`cp-compile-line ${
                            step > i ? 'done' : step === i ? 'active' : ''
                        }`}
                    >
                        <span className="step">
                            {step > i ? 'OK' : step === i ? '>' : ' '}
                        </span>
                        <span className="label">{label}</span>
                    </div>
                ))}
                <div className="cp-progress-bar">
                    <div className="cp-progress-fill" />
                </div>
            </div>
        </div>
    );
};

const CAPABILITIES = [
    {
        Icon: IconUsers,
        iconClass: 'cyan',
        title: 'Real-time Multi-user Editing',
        text: 'Collaborate with your entire team in a single session. Shared terminal, shared state, and low-latency cursor indicators make pair programming feel native.',
        extra: 'avatars',
    },
    {
        Icon: IconPlay,
        iconClass: 'green',
        title: 'Instant Execution',
        text: 'Run Python, JavaScript, and more locally with full terminal access. No servers required.',
        extra: 'terminal',
    },
    {
        Icon: IconBolt,
        iconClass: 'orange',
        title: 'Zero Configuration',
        text: 'Stop wasting time on setup. Share a link and start coding instantly with pre-configured environments.',
    },
    {
        Icon: IconShare,
        iconClass: 'purple',
        title: 'Room-based Collaboration',
        text: 'Create a room, copy the ID, and invite teammates. Everyone sees changes in real time — code, output, and presence.',
    },
];

const Home = () => {
    const navigate = useNavigate();
    const heroEditorRef = useReveal();
    const capsRef = useReveal();
    const ctaRef = useReveal();
    const [navHidden, setNavHidden] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        const handler = () => {
            const y = window.scrollY;
            setNavHidden(y > lastY.current && y > 80);
            lastY.current = y;
        };
        window.addEventListener('scroll', handler, {passive: true});
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    };

    return (
        <div className="cp-wrap">
            <nav className={`cp-nav${navHidden ? ' hidden' : ''}`}>
                <CodePulseLogo
                    size="sm"
                    onClick={() => navigate('/')}
                    className="cp-nav-logo"
                />
                <ul className="cp-nav-links">
                    <li>
                        <button type="button" onClick={() => scrollTo('workspace')}>
                            Workspace
                        </button>
                    </li>
                    <li>
                        <button type="button" onClick={() => scrollTo('collaborate')}>
                            Collaborate
                        </button>
                    </li>
                    <li>
                        <button type="button" onClick={() => scrollTo('capabilities')}>
                            Features
                        </button>
                    </li>
                </ul>
                <div className="cp-nav-actions">
                    <ThemeToggle compact />
                    <button
                        type="button"
                        className="cp-btn-ghost"
                        onClick={() => navigate('/join')}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className="cp-btn-primary"
                        onClick={() => navigate('/join?create=1')}
                    >
                        New
                    </button>
                </div>
            </nav>

            <section className="cp-hero">
                <div className="cp-hero-glow" />
                <CodePulseLogo size="md" className="cp-hero-logo" />
                <div className="cp-hero-badge">
                    <span className="cp-badge-dot" />
                    v2.0 — Real-time execution now live
                </div>
                <h1>
                    Code together.
                    <br />
                    <span>Ship faster.</span>
                </h1>
                <p className="cp-hero-sub">
                    The ultra-fast, collaborative cloud editor for modern
                    developers. Real-time pair programming, instant execution,
                    zero setup required.
                </p>
                <div className="cp-hero-cta">
                    <button
                        type="button"
                        className="cp-btn-large primary"
                        onClick={() => navigate('/join?create=1')}
                    >
                        Get Started for Free
                        <IconArrowRight />
                    </button>
                    <button
                        type="button"
                        className="cp-btn-large outline"
                        onClick={() => navigate('/join?demo=1')}
                    >
                        View Demo
                    </button>
                </div>
            </section>

            <div id="workspace" className="cp-editor-section">
                <div className="cp-editor-wrap cp-reveal" ref={heroEditorRef}>
                    <div className="cp-editor">
                        <div className="cp-editor-bar">
                            <span className="cp-dot red" />
                            <span className="cp-dot yellow" />
                            <span className="cp-dot green" />
                            <span className="cp-editor-title">
                                {workspaceUrl('nexus-api')}
                            </span>
                        </div>
                        <div className="cp-editor-body">
                            <div className="cp-sidebar">
                                <CodePulseLogo
                                    size="xs"
                                    showWordmark={false}
                                    className="cp-sidebar-logo"
                                />
                                <div className="cp-sidebar-label">Files</div>
                                <div className="cp-file active">
                                    <span className="cp-file-dot cp-file-dot-cyan" />
                                    index.js
                                </div>
                                <div className="cp-file">
                                    <span className="cp-file-dot cp-file-dot-muted" />
                                    components
                                </div>
                                <div className="cp-file">
                                    <span className="cp-file-dot cp-file-dot-orange" />
                                    config.json
                                </div>
                            </div>
                            <div className="cp-code-area">
                                <div className="cp-scanline" />
                                <div className="cp-user-avatar">
                                    <span className="cp-avatar a1">server_dev</span>
                                    <span className="cp-avatar a2">mike_code</span>
                                </div>
                                <CodeLine num="1">
                                    <span className="kw">import</span>{' '}
                                    <span className="wh">{'{ server }'}</span>{' '}
                                    <span className="kw">from</span>{' '}
                                    <span className="str">"./nexus"</span>
                                    <span className="wh">;</span>
                                </CodeLine>
                                <CodeLine num="2">
                                    <span className="cm">{'// Initialize real-time connection'}</span>
                                </CodeLine>
                                <CodeLine num="3">
                                    <span className="kw">const</span>{' '}
                                    <span className="wh">app</span>{' '}
                                    <span className="cy">=</span>{' '}
                                    <span className="fn">server</span>
                                    <span className="wh">.init({'{'}</span>
                                </CodeLine>
                                <CodeLine num="4">
                                    &nbsp;&nbsp;<span className="wh">port:</span>{' '}
                                    <span className="num">8080</span>
                                    <span className="wh">,</span>
                                </CodeLine>
                                <CodeLine num="5">
                                    &nbsp;&nbsp;<span className="wh">debug:</span>{' '}
                                    <span className="kw">true</span>
                                </CodeLine>
                                <CodeLine num="6">
                                    <span className="wh">{'});'}</span>
                                </CodeLine>
                                <CodeLine num="7" />
                                <CodeLine num="8">
                                    <span className="fn">app</span>
                                    <span className="wh">.listen(</span>
                                    <span className="wh">() =&gt; {'{'}</span>
                                </CodeLine>
                                <CodeLine num="9">
                                    &nbsp;&nbsp;<span className="wh">console.</span>
                                    <span className="fn">log</span>
                                    <span className="wh">(</span>
                                    <span className="str">"Pulse ready."</span>
                                    <span className="wh">);</span>
                                    <span className="cp-cursor" />
                                </CodeLine>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="collaborate" className="cp-trusted">
                <div className="cp-trusted-label">Trusted by engineering teams at</div>
                <div className="cp-logos">
                    {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Supabase'].map(
                        (n) => (
                            <div key={n} className="cp-logo-pill">{n}</div>
                        )
                    )}
                </div>
            </div>

            <section id="capabilities" className="cp-caps cp-reveal" ref={capsRef}>
                <div className="cp-section-tag">Capabilities</div>
                <div className="cp-section-title">Built for technical mastery.</div>
                <div className="cp-grid">
                    {CAPABILITIES.map(({Icon, iconClass, title, text, extra}) => (
                        <div key={title} className="cp-card cp-card-interactive">
                            <div className={`cp-card-icon ${iconClass}`}>
                                <Icon />
                            </div>
                            <h3>{title}</h3>
                            <p>{text}</p>
                            {extra === 'avatars' && (
                                <div className="cp-avatars-demo">
                                    <div className="cp-demo-user">
                                        <span className="cp-demo-dot online" />
                                        sarah_k — editing line 24
                                    </div>
                                    <div className="cp-demo-user">
                                        <span className="cp-demo-dot typing" />
                                        mike_r — typing...
                                    </div>
                                </div>
                            )}
                            {extra === 'terminal' && (
                                <div className="cp-terminal">
                                    <div className="cp-terminal-line cmd">python main.py</div>
                                    <div className="cp-terminal-line info">Server running at :3000</div>
                                    <div className="cp-terminal-line ok">All tests passed (12/12)</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="cp-cta-section cp-reveal" ref={ctaRef}>
                <div>
                    <h2>Ready to transform your workflow?</h2>
                    <p>
                        Start coding together with CodePulse. Free for individuals,
                        powerful for teams.
                    </p>
                    <div className="cp-cta-btns">
                        <button
                            type="button"
                            className="cp-btn-large primary"
                            onClick={() => navigate('/join?create=1')}
                        >
                            Create a Project
                        </button>
                        <button
                            type="button"
                            className="cp-btn-large outline"
                            onClick={() => navigate('/join')}
                        >
                            Join with Room ID
                        </button>
                    </div>
                </div>
                <CompileWidget />
            </div>

            <footer className="cp-footer">
                <div className="cp-footer-top">
                    <div className="cp-footer-brand">
                        <CodePulseLogo size="sm" className="cp-footer-logo" />
                        <p>
                            The modern standard for collaborative coding. Built by
                            developers, for developers.
                        </p>
                    </div>
                    {[
                        {title: 'Product', links: ['Features', 'Pricing', 'Extensions']},
                        {title: 'Resources', links: ['Docs', 'Tutorials', 'Support']},
                        {title: 'Company', links: ['About', 'Blog', 'Careers']},
                        {title: 'Connect', links: ['Twitter', 'GitHub']},
                    ].map((col) => (
                        <div key={col.title} className="cp-footer-col">
                            <h4>{col.title}</h4>
                            {col.links.map((l) => (
                                <a key={l} href="#capabilities">{l}</a>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="cp-footer-bottom">
                    <span>{new Date().getFullYear()} CodePulse IDE. All rights reserved.</span>
                    <div className="cp-footer-links">
                        <a href="#capabilities">Privacy Policy</a>
                        <a href="#capabilities">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
