import { useEffect, useRef, useState, useCallback } from "react";
import CodePulseLogo from "./CodePulseLogo";
import "./CodePulsePreloader.css";

const TAGLINES = [
  "REAL-TIME COLLABORATION",
  "COLLABORATIVE IDE",
  "CODE AT THE SPEED OF THOUGHT",
];

const STATUS_MESSAGES = [
  "BOOT SEQUENCE INITIATED",
  "LOADING CORE MODULES",
  "CONNECTING WEBSOCKET",
  "SPAWNING WORKER THREADS",
  "COMPILING SHADER CACHE",
  "SYNCING PEER NETWORK",
  "MOUNTING FILESYSTEM",
  "CALIBRATING HMR ENGINE",
  "VERIFYING CHECKSUMS",
  "FLUSHING MEMORY POOLS",
  "INJECTING RUNTIME",
  "ARMING TELEMETRY",
  "SYSTEM NOMINAL — LAUNCHING",
];

const CODE_FRAGS = [
  "import { server }",
  "async function",
  "const pulse =",
  "useEffect(() =>",
  "export default",
  "type Props = {",
  "await fetch(url)",
  ":root { --cyan",
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randomHex() {
  const r = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  return `${r()} ${r()}`;
}

function getCanvasSize(canvas) {
  const w = canvas.offsetWidth || window.innerWidth;
  const h = canvas.offsetHeight || window.innerHeight;
  return {
    width: Math.max(w, 320),
    height: Math.max(h, 480),
  };
}

export default function CodePulsePreloader({ onComplete }) {
  const canvasRef = useRef(null);
  const pulseRingRef = useRef(null);
  const logoRef = useRef(null);
  const animRef = useRef(null);
  const timersRef = useRef([]);
  const mountedRef = useRef(true);
  const onCompleteRef = useRef(onComplete);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING...");
  const [pct, setPct] = useState("0%");
  const [tagline, setTagline] = useState("");
  const [hexBits, setHexBits] = useState(["00 00", "ff cc", "a3 f9", "12 4e"]);
  const [bootLines, setBootLines] = useState([]);
  const [glitchR, setGlitchR] = useState({ opacity: 0, x: 0, y: 0 });
  const [glitchB, setGlitchB] = useState({ opacity: 0, x: 0, y: 0 });
  const [centerVisible, setCenterVisible] = useState(false);
  const [flashOp, setFlashOp] = useState(0);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);

  onCompleteRef.current = onComplete;

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      if (!mountedRef.current) return;
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runExitSequence = useCallback(() => {
    schedule(() => {
      setFlashOp(1);
      schedule(() => {
        setFlashOp(0);
        schedule(() => {
          setDone(true);
          schedule(() => onCompleteRef.current?.(), 700);
        }, 600);
      }, 200);
    }, 600);
  }, [schedule]);

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mountedRef.current) return false;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    const tagTarget = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.8 - 0.2,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.7 ? "#ff00cc" : "#00ffcc",
    }));

    const floats = Array.from({ length: 8 }, (_, i) => ({
      text: CODE_FRAGS[i % CODE_FRAGS.length],
      x: Math.random() * 0.7 + 0.1,
      y: 0.5 + Math.random() * 0.4,
      vy: Math.random() * 0.0003 + 0.0001,
      maxOp: Math.random() * 0.25 + 0.08,
      active: false,
      delay: Math.random() * 2000,
      born: 0,
    }));

    let startTime = null;
    let prog = 0;
    let gridOpacity = 0;
    let gridFadeStart = 0;
    let logoEntered = false;
    let lastGlitch = 0;
    let lastMsgTime = 0;
    let msgIdx = 0;
    let lastTagTime = 0;
    let tagCharIdx = 0;
    let tagStr = "";
    let tagTyped = false;
    let lastProgressTime = 0;
    let lastBracketFlicker = 0;
    let lastHexTime = 0;
    let lastPulseUiTime = 0;
    let pulseSc = 1;
    let pulseDelta = 0.02;
    let exitTriggered = false;
    let bootLinesList = [];

    const addBootLine = (text) => {
      const type = Math.random() > 0.85 ? "warn" : "ok";
      const prefix = type === "warn" ? "[ WARN ] " : "[  OK  ] ";
      const line = {
        id: Date.now() + Math.random(),
        text: prefix + text.toLowerCase(),
        type,
      };
      bootLinesList = [...bootLinesList, line].slice(-5);
      setBootLines([...bootLinesList]);
    };

    const frame = (ts) => {
      if (!mountedRef.current) return;

      if (!startTime) startTime = ts;
      const t = ts - startTime;

      const { width: W, height: H } = getCanvasSize(canvas);
      canvas.width = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      if (gridOpacity < 1) {
        if (gridFadeStart === 0) gridFadeStart = t;
        gridOpacity = Math.min(1, (t - gridFadeStart) / 600);
      }

      ctx.save();
      ctx.globalAlpha = gridOpacity * 0.35;
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 0.5;
      const horizon = H * 0.52;
      const vw = W * 1.5;
      const cols = 18;
      const rows = 14;

      for (let i = 0; i <= cols; i++) {
        const x = (i / cols - 0.5) * vw;
        ctx.beginPath();
        ctx.moveTo(W / 2 + x * 0.05, horizon);
        ctx.lineTo(W / 2 + x * 1.2, H + 20);
        ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        const fy = j / rows;
        const y = horizon + (H - horizon + 40) * fy * fy;
        const xscale = lerp(0.05, 1.2, fy * fy);
        ctx.beginPath();
        ctx.moveTo(W / 2 - vw * 0.5 * xscale, y);
        ctx.lineTo(W / 2 + vw * 0.5 * xscale, y);
        ctx.stroke();
      }
      ctx.restore();

      if (t < 800) {
        [0, 80, 160, 240].forEach((offset, i) => {
          const age = Math.max(0, t - offset);
          if (age <= 0) return;
          const r = age * 1.8;
          const op = Math.max(0, 1 - age / 600);
          const colors = ["#00ffcc", "#cc00ff", "#00ff88", "#ff00cc"];
          ctx.save();
          ctx.globalAlpha = op * 0.6;
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 2 - op;
          ctx.shadowColor = colors[i];
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = 1000;
          p.x = Math.random() * 1000;
        }
        if (p.x < 0 || p.x > 1000) p.vx *= -1;
        ctx.save();
        ctx.globalAlpha = p.opacity * Math.min(1, prog / 20);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc((p.x / 1000) * W, (p.y / 1000) * H, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      floats.forEach((f) => {
        if (!f.active && t > f.delay + 800) {
          f.active = true;
          f.born = t;
          f.y = 0.7 + Math.random() * 0.25;
        }
        if (!f.active) return;

        const age = t - f.born;
        const lifespan = 3500;
        if (age > lifespan) {
          f.active = false;
          f.text = CODE_FRAGS[Math.floor(Math.random() * CODE_FRAGS.length)];
          f.x = Math.random() * 0.7 + 0.1;
          f.y = 0.7 + Math.random() * 0.2;
          f.delay = t + Math.random() * 1200;
          f.maxOp = Math.random() * 0.22 + 0.07;
          return;
        }

        const fadeIn = Math.min(1, age / 400);
        const fadeOut = Math.max(0, 1 - (age - lifespan + 500) / 500);
        f.y -= f.vy;
        ctx.save();
        ctx.globalAlpha = f.maxOp * fadeIn * fadeOut;
        ctx.fillStyle = "#00ffcc";
        ctx.font = "9px 'Space Mono', monospace";
        ctx.fillText(f.text, f.x * W, f.y * H);
        ctx.restore();
      });

      if (!logoEntered && t > 80) {
        logoEntered = true;
        setCenterVisible(true);
      }

      pulseSc += pulseDelta;
      if (pulseSc > 1.35 || pulseSc < 1) pulseDelta *= -1;

      if (t - lastPulseUiTime > 50) {
        lastPulseUiTime = t;
        const pulseOp = Math.max(0, 1 - (pulseSc - 1) / 0.35) * 0.6;
        if (pulseRingRef.current) {
          pulseRingRef.current.style.transform = `scale(${pulseSc})`;
          pulseRingRef.current.style.opacity = String(pulseOp);
        }
      }

      if (t - lastBracketFlicker > 180 + Math.random() * 300) {
        lastBracketFlicker = t;
        const cyan = Math.random() > 0.5;
        const color = cyan ? "#00ffcc" : "#ff00cc";
        const glow = cyan ? "0 0 12px #00ffcc" : "0 0 12px #ff00cc";
        if (logoRef.current) {
          logoRef.current.style.color = color;
          logoRef.current.style.textShadow = glow;
        }
      }

      if (!tagTyped && t > 300 && t - lastTagTime > 45 && tagCharIdx < tagTarget.length) {
        tagStr += tagTarget[tagCharIdx];
        tagCharIdx += 1;
        lastTagTime = t;
        setTagline(tagStr);
        if (tagCharIdx >= tagTarget.length) tagTyped = true;
      }

      if (t - lastProgressTime > 30) {
        lastProgressTime = t;
        const speed = prog < 30 ? 0.9 : prog < 70 ? 0.6 : prog < 90 ? 0.3 : 0.12;
        prog = Math.min(99.9, prog + speed * (0.5 + Math.random() * 0.8));
        setProgress(prog);
        setPct(`${Math.floor(prog)}%`);
      }

      if (t - lastHexTime > 150) {
        lastHexTime = t;
        setHexBits([randomHex(), randomHex(), randomHex(), randomHex()]);
      }

      const msgInterval = 300 + Math.random() * 100;
      if (t - lastMsgTime > msgInterval && msgIdx < STATUS_MESSAGES.length - 1) {
        const prev = STATUS_MESSAGES[msgIdx];
        msgIdx += 1;
        lastMsgTime = t;
        setStatusText(STATUS_MESSAGES[msgIdx]);
        addBootLine(prev);
      }
      if (prog >= 99.9) {
        setStatusText(STATUS_MESSAGES[STATUS_MESSAGES.length - 1]);
      }

      if (t - lastGlitch > 400 + Math.random() * 800) {
        lastGlitch = t;
        const dx = 3 + Math.random() * 4;
        const dy = Math.random() * 3;
        setGlitchR({ opacity: 1, x: -dx, y: dy });
        setGlitchB({ opacity: 1, x: dx, y: -dy });
        schedule(() => {
          setGlitchR({ opacity: 0, x: 0, y: 0 });
          setGlitchB({ opacity: 0, x: 0, y: 0 });
        }, 80 + Math.random() * 120);
      }

      if (prog >= 99.9 && !exitTriggered) {
        exitTriggered = true;
        setProgress(100);
        setPct("100%");
        runExitSequence();
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return true;
  }, [runExitSequence, schedule]);

  useEffect(() => {
    mountedRef.current = true;
    let waitFrame = 0;

    const tryStart = () => {
      if (!mountedRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        waitFrame = requestAnimationFrame(tryStart);
        return;
      }

      const { width, height } = getCanvasSize(canvas);
      if (width < 100 || height < 100) {
        waitFrame = requestAnimationFrame(tryStart);
        return;
      }

      if (!startAnimation()) {
        waitFrame = requestAnimationFrame(tryStart);
      }
    };

    waitFrame = requestAnimationFrame(tryStart);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(waitFrame);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimers();
    };
  }, [key, startAnimation, clearTimers]);

  const handleReplay = () => {
    mountedRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    clearTimers();
    setProgress(0);
    setStatusText("INITIALIZING...");
    setPct("0%");
    setTagline("");
    setHexBits(["00 00", "ff cc", "a3 f9", "12 4e"]);
    setBootLines([]);
    setGlitchR({ opacity: 0, x: 0, y: 0 });
    setGlitchB({ opacity: 0, x: 0, y: 0 });
    setCenterVisible(false);
    setFlashOp(0);
    setDone(false);
    if (logoRef.current) {
      logoRef.current.style.color = "#00ffcc";
      logoRef.current.style.textShadow = "0 0 12px #00ffcc";
    }
    if (pulseRingRef.current) {
      pulseRingRef.current.style.transform = "scale(1)";
      pulseRingRef.current.style.opacity = "0.6";
    }
    mountedRef.current = true;
    setKey((k) => k + 1);
  };

  return (
    <div className="cp-preloader">
      <canvas ref={canvasRef} className="cp-preloader-canvas" />

      <div className="cp-preloader-scanlines" />

      <div className="cp-preloader-version">v4.2.0-nightly</div>

      <div
        className={`cp-preloader-center${centerVisible ? " cp-center-enter" : ""}`}
        style={{ opacity: centerVisible ? 1 : 0 }}
      >
        <div className="cp-preloader-logo-wrap">
          <CodePulseLogo
            size="lg"
            neon
            pulse
            showWordmark={false}
            markRef={logoRef}
            pulseRingRef={pulseRingRef}
          />
        </div>

        <div className="cp-preloader-wordmark">
          <div
            className="cp-preloader-glitch cp-preloader-glitch-r"
            style={{
              opacity: glitchR.opacity,
              transform: `translate(${glitchR.x}px, ${glitchR.y}px)`,
            }}
          >
            CODEPULSE
          </div>
          <div
            className="cp-preloader-glitch cp-preloader-glitch-b"
            style={{
              opacity: glitchB.opacity,
              transform: `translate(${glitchB.x}px, ${glitchB.y}px)`,
            }}
          >
            CODEPULSE
          </div>
          <div className="cp-preloader-title">CODEPULSE</div>
        </div>

        <div className="cp-preloader-tagline">
          {tagline}
          <span className="cp-preloader-cursor" />
        </div>

        <div className="cp-preloader-progress-wrap">
          <div className="cp-preloader-track">
            <div className="cp-preloader-fill" style={{ width: `${progress}%` }}>
              <div className="cp-preloader-fill-tip" />
            </div>
          </div>
          <div className="cp-preloader-status-row">
            <span className="cp-preloader-status">{statusText}</span>
            <span className="cp-preloader-pct">{pct}</span>
          </div>
        </div>

        <div className="cp-preloader-hex">
          {hexBits.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
      </div>

      <div className="cp-preloader-boot">
        {bootLines.map((line) => (
          <div
            key={line.id}
            className={`cp-preloader-boot-line${line.type === "warn" ? " warn" : ""}`}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="cp-preloader-flash" style={{ opacity: flashOp }} />

      <button type="button" className="cp-preloader-replay" onClick={handleReplay}>
        REPLAY
      </button>

      {done && (
        <div className="cp-preloader-ready">
          <div className="cp-preloader-ready-inner">
            <div className="cp-preloader-ready-icon">OK</div>
            <div className="cp-preloader-ready-text">SYSTEM READY</div>
          </div>
        </div>
      )}
    </div>
  );
}
