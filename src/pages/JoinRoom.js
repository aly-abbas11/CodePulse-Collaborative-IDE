import {useState, useRef, useEffect} from 'react';
import {v4 as uuidV4} from 'uuid';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    IconHash,
    IconUser,
    IconAlert,
    IconCheck,
    IconPlus,
    IconArrowRight,
    IconBolt,
    IconPlay,
    IconGlobe,
} from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import CodePulseLogo from '../components/CodePulseLogo';
import './JoinRoom.css';

const ADJECTIVES = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
];
const NOUNS = ['123', '456', '789', '001', '042', '007', '404', '500'];

function genFriendlyRoomId() {
    const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const b = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${a}-${b}-${n}`;
}

const particles = Array.from({length: 18}, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${50 + Math.random() * 50}%`,
    size: `${2 + Math.random() * 3}px`,
    dur: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 8}s`,
    op: (0.05 + Math.random() * 0.12).toFixed(2),
}));

const FEATURES = [
    {Icon: IconBolt, label: 'Real-time sync'},
    {Icon: IconPlay, label: 'Run code'},
    {Icon: IconGlobe, label: '20+ languages'},
];

const JoinRoom = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cardRef = useRef(null);

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);

    const isCreateMode = searchParams.get('create') === '1';
    const isDemoMode = searchParams.get('demo') === '1';
    const roomParam = searchParams.get('room');

    useEffect(() => {
        if (roomParam) {
            setRoomId(roomParam);
            return;
        }
        if (isDemoMode) {
            setRoomId(uuidV4());
            setUsername('Guest');
            return;
        }
        if (isCreateMode) {
            setRoomId(uuidV4());
        }
    }, [isCreateMode, isDemoMode, roomParam]);

    const switchToCreateMode = () => {
        navigate('/join?create=1');
        setRoomId(uuidV4());
        setErrors({});
    };

    const switchToJoinMode = () => {
        navigate('/join');
        setRoomId('');
        setErrors({});
    };

    const handleRegenerate = () => {
        setRoomId(uuidV4());
        setErrors((e) => ({...e, roomId: null}));
    };

    const validate = () => {
        const e = {};
        if (!roomId.trim()) e.roomId = 'Room ID is required';
        if (!username.trim()) e.username = 'Username is required';
        else if (username.trim().length < 2) e.username = 'At least 2 characters';
        return e;
    };

    const goToEditor = (id, name) => {
        navigate(`/editor/${id.trim()}`, {state: {username: name.trim()}});
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => goToEditor(roomId, username), 900);
        }, 700);
    };

    const handleCreate = () => {
        switchToCreateMode();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="jr-root">
            <div className="jr-top-bar">
                <button type="button" className="jr-back" onClick={() => navigate('/')}>
                    <span className="jr-back-icon"><IconArrowRight /></span>
                    Home
                </button>
                <ThemeToggle />
            </div>

            <div className="jr-particles">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="jr-particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            '--dur': p.dur,
                            '--delay': p.delay,
                            '--op': p.op,
                        }}
                    />
                ))}
            </div>

            <CodePulseLogo
                size="md"
                onClick={() => navigate('/')}
                className="jr-logo"
            />

            <div
                className={`jr-card${shake ? ' shake' : ''}${
                    isCreateMode ? ' mode-create' : ' mode-join'
                }`}
                ref={cardRef}
            >
                <div className={`jr-success${success ? ' show' : ''}`}>
                    <div className="jr-success-icon">
                        <IconCheck />
                    </div>
                    <h3>{isCreateMode ? 'Creating workspace...' : 'Joining room...'}</h3>
                    <p className="jr-success-room">{roomId}</p>
                    <p>Welcome, {username}!</p>
                </div>

                <h2 className="jr-card-title">
                    {isCreateMode ? 'Create a Room' : 'Join a Room'}
                </h2>
                <p className="jr-card-sub">
                    {isCreateMode
                        ? 'Your workspace is ready — pick a username and enter'
                        : 'Paste an invitation ID to join an existing workspace'}
                </p>

                <div className="jr-field" style={{'--anim-delay': '0.6s'}}>
                    <label className="jr-label" htmlFor="room-id">
                        {isCreateMode ? 'Your Room ID' : 'Room ID'}
                    </label>
                    <div className="jr-input-wrap">
                        <span className="jr-input-icon"><IconHash /></span>
                        <input
                            id="room-id"
                            className="jr-input has-action"
                            placeholder={
                                isCreateMode
                                    ? 'Auto-generated room ID'
                                    : 'e.g. alpha-bravo-123'
                            }
                            value={roomId}
                            onChange={(ev) => {
                                setRoomId(ev.target.value);
                                setErrors((x) => ({...x, roomId: null}));
                            }}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoComplete="off"
                            readOnly={isCreateMode}
                        />
                        <button
                            type="button"
                            className="jr-generate-badge"
                            onClick={isCreateMode ? handleRegenerate : () => {
                                setRoomId(genFriendlyRoomId());
                                setErrors((e) => ({...e, roomId: null}));
                            }}
                        >
                            {isCreateMode ? 'Regenerate' : 'Generate'}
                        </button>
                    </div>
                    {isCreateMode && (
                        <p className="jr-field-hint">
                            Share this ID so others can join your room
                        </p>
                    )}
                    <div className={`jr-error${errors.roomId ? ' show' : ''}`}>
                        <IconAlert />{errors.roomId}
                    </div>
                </div>

                <div className="jr-field" style={{'--anim-delay': '0.7s'}}>
                    <label className="jr-label" htmlFor="username">Username</label>
                    <div className="jr-input-wrap">
                        <span className="jr-input-icon"><IconUser /></span>
                        <input
                            id="username"
                            className="jr-input"
                            placeholder="Enter your handle"
                            value={username}
                            onChange={(ev) => {
                                setUsername(ev.target.value);
                                setErrors((x) => ({...x, username: null}));
                            }}
                            onKeyDown={handleKeyDown}
                            autoComplete="username"
                        />
                    </div>
                    <div className={`jr-error${errors.username ? ' show' : ''}`}>
                        <IconAlert />{errors.username}
                    </div>
                </div>

                <button
                    type="button"
                    className={`jr-btn-join${
                        isCreateMode ? ' mode-create' : ''
                    }${loading ? ' loading' : ''}`}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <>
                            <div className="jr-spinner" />
                            {isCreateMode ? 'Setting up...' : 'Connecting...'}
                        </>
                    ) : (
                        <>
                            <span>
                                {isCreateMode ? 'Create & Enter' : 'Join Room'}
                            </span>
                            <span className="jr-arrow"><IconArrowRight /></span>
                        </>
                    )}
                </button>

                <div className="jr-divider">
                    <div className="jr-divider-line" />
                    <span className="jr-divider-text">OR</span>
                    <div className="jr-divider-line" />
                </div>

                {isCreateMode ? (
                    <button
                        type="button"
                        className="jr-btn-switch"
                        onClick={switchToJoinMode}
                    >
                        Join existing room
                    </button>
                ) : (
                    <button type="button" className="jr-btn-create" onClick={handleCreate}>
                        <span className="jr-create-icon"><IconPlus /></span>
                        Create new room
                    </button>
                )}
            </div>

            <div className="jr-features">
                {FEATURES.map(({Icon, label}) => (
                    <div key={label} className="jr-pill">
                        <span className="jr-pill-icon"><Icon /></span>
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JoinRoom;
