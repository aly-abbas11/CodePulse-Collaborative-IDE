import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Client from "../components/Client";
import Editor from "../components/Editor";
import FilePreview from "../components/FilePreview";
import OutputPanel from "../components/OutputPanel";
import { language, cmtheme } from "../../src/atoms";
import { useRecoilState } from "recoil";
import ACTIONS from "../actions/Actions";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import {
  IconUpload,
  IconCopy,
  IconLogOut,
  IconPlay,
} from "../components/Icons";
import CodePulseLogo from "../components/CodePulseLogo";
import ThemeToggle from "../components/ThemeToggle";
import { workspaceUrl } from "../config";
import "./EditorPage.css";

const LANG_LABELS = {
  cpp: "C++",
  clike: "C / Java",
  javascript: "JavaScript",
  jsx: "JSX",
  python: "Python",
  css: "CSS",
  htmlmixed: "HTML",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  shell: "Shell",
  sql: "SQL",
  markdown: "Markdown",
};

const TERMINAL_HEIGHT_KEY = "cp-terminal-height";
const DEFAULT_TERMINAL_HEIGHT = 200;
const MIN_TERMINAL_HEIGHT = 72;
const MAX_TERMINAL_RATIO = 0.75;

const readStoredTerminalHeight = () => {
  try {
    const saved = localStorage.getItem(TERMINAL_HEIGHT_KEY);
    if (saved != null) {
      const n = Number(saved);
      if (!Number.isNaN(n) && n >= MIN_TERMINAL_HEIGHT) return n;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_TERMINAL_HEIGHT;
};

const EditorPage = () => {
  const [lang, setLang] = useRecoilState(language);
  const [them, setThem] = useRecoilState(cmtheme);
  const [clients, setClients] = useState([]);

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();

  const [filePreview, setFilePreview] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("uploaded-file.txt");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const fileInputRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const workspaceRef = useRef(null);
  const terminalHeightRef = useRef(readStoredTerminalHeight());
  const isResizingTerminal = useRef(false);

  const [terminalHeight, setTerminalHeight] = useState(
    readStoredTerminalHeight
  );
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    terminalHeightRef.current = terminalHeight;
  }, [terminalHeight]);

  useEffect(() => {
    const clampHeight = (clientY) => {
      const workspace = workspaceRef.current;
      if (!workspace) return terminalHeightRef.current;

      const rect = workspace.getBoundingClientRect();
      const maxHeight = Math.max(
        MIN_TERMINAL_HEIGHT,
        rect.height * MAX_TERMINAL_RATIO
      );
      const next = rect.bottom - clientY;
      return Math.min(maxHeight, Math.max(MIN_TERMINAL_HEIGHT, next));
    };

    const finishResize = () => {
      if (!isResizingTerminal.current) return;
      isResizingTerminal.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(
        TERMINAL_HEIGHT_KEY,
        String(Math.round(terminalHeightRef.current))
      );
      editorInstanceRef.current?.refresh();
    };

    const onMouseMove = (e) => {
      if (!isResizingTerminal.current) return;
      setTerminalHeight(clampHeight(e.clientY));
    };

    const onTouchMove = (e) => {
      if (!isResizingTerminal.current || !e.touches[0]) return;
      e.preventDefault();
      setTerminalHeight(clampHeight(e.touches[0].clientY));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", finishResize);
    window.addEventListener("touchmove", onTouchMove, {passive: false});
    window.addEventListener("touchend", finishResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", finishResize);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finishResize);
    };
  }, []);

  const startTerminalResize = (e) => {
    e.preventDefault();
    isResizingTerminal.current = true;
    setIsResizing(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const resetTerminalHeight = () => {
    setTerminalHeight(DEFAULT_TERMINAL_HEIGHT);
    localStorage.setItem(TERMINAL_HEIGHT_KEY, String(DEFAULT_TERMINAL_HEIGHT));
    editorInstanceRef.current?.refresh();
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });

      socketRef.current.on(ACTIONS.RUN_RESULT, (result) => {
        setOutput(result);
        setIsRunning(false);
        if (result.username && result.username !== location.state?.username) {
          toast.success(`${result.username} ran the code.`);
        }
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.RUN_RESULT);
      socketRef.current.disconnect();
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setFileContent(e.target.result);
        setFileName(file.name);
        setFilePreview(true);
      };
      reader.readAsText(file);
    }
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateEditorCode = (newCode) => {
    editorInstanceRef.current?.setCode(newCode);
    codeRef.current = newCode;
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      roomId,
      code: newCode,
    });
  };

  const handleAppendCode = () => {
    const currentCode = codeRef.current || "";
    const appendedCode = currentCode
      ? `${currentCode}\n\n${fileContent}`
      : fileContent;
    updateEditorCode(appendedCode);
    setFilePreview(false);
    resetFileInput();
  };

  const handleReplaceCode = () => {
    updateEditorCode(fileContent);
    setFilePreview(false);
    resetFileInput();
  };

  const handleRunCode = () => {
    const code = codeRef.current;
    if (!code?.trim()) {
      toast.error("Write some code before running.");
      return;
    }
    if (!socketRef.current) {
      toast.error("Not connected to the server.");
      return;
    }
    setIsRunning(true);
    setOutput(null);
    socketRef.current.emit(ACTIONS.RUN_CODE, {
      roomId,
      code,
      language: lang,
      stdin,
      username: location.state?.username,
    });
  };

  const langLabel = LANG_LABELS[lang] || lang;
  const shortRoom = roomId.length > 12 ? `${roomId.slice(0, 8)}…` : roomId;

  return (
    <div className="ed-root">
      <aside className="ed-sidebar">
        <CodePulseLogo
          size="sm"
          onClick={() => reactNavigator("/")}
          className="ed-brand"
        />

        <div className="ed-section">
          <span className="ed-section-label">Connected</span>
          <div className="ed-clients">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <div className="ed-controls">
          <div className="ed-appearance">
            <span className="ed-section-label">Appearance</span>
            <ThemeToggle />
          </div>

          <input
            type="file"
            accept=".js,.py,.java,.cpp,.c,.txt,.html,.css"
            style={{ display: "none" }}
            id="fileUpload"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
          <button
            type="button"
            className="ed-btn ed-btn-upload"
            onClick={() => document.getElementById("fileUpload").click()}
          >
            <IconUpload />
            Upload File
          </button>

          <div className="ed-field">
            <label htmlFor="ed-lang">Language</label>
            <select
              id="ed-lang"
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                window.location.reload();
              }}
              className="ed-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="clike">C / Java</option>
              <option value="jsx">JSX</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="css">CSS</option>
              <option value="htmlmixed">HTML</option>
              <option value="shell">Shell</option>
              <option value="sql">SQL</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>

          <div className="ed-field">
            <label htmlFor="ed-theme">Editor theme</label>
            <select
              id="ed-theme"
              value={them}
              onChange={(e) => setThem(e.target.value)}
              className="ed-select"
            >
              <optgroup label="Dark">
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai</option>
                <option value="material">Material</option>
                <option value="nord">Nord</option>
                <option value="ayu-dark">Ayu Dark</option>
                <option value="cobalt">Cobalt</option>
                <option value="tomorrow-night-bright">Tomorrow Night</option>
                <option value="base16-dark">Base16 Dark</option>
              </optgroup>
              <optgroup label="Light">
                <option value="xq-light">XQ Light</option>
                <option value="eclipse">Eclipse</option>
                <option value="base16-light">Base16 Light</option>
                <option value="duotone-light">Duotone Light</option>
                <option value="3024-day">3024 Day</option>
              </optgroup>
            </select>
          </div>

          <button type="button" className="ed-btn ed-btn-copy" onClick={copyRoomId}>
            <IconCopy />
            Copy Room ID
          </button>
          <button type="button" className="ed-btn ed-btn-leave" onClick={leaveRoom}>
            <IconLogOut />
            Leave
          </button>
        </div>
      </aside>

      <div className="ed-workspace" ref={workspaceRef}>
        <div className="ed-chrome">
          <span className="ed-dot red" />
          <span className="ed-dot yellow" />
          <span className="ed-dot green" />
          <span className="ed-chrome-title">
            {workspaceUrl(shortRoom)}
          </span>
          <span className="ed-room-badge" title={roomId}>
            {shortRoom}
          </span>
        </div>

        <div className="ed-main">
          <div className="ed-editor-area">
            <Editor
              ref={editorInstanceRef}
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>

          <div className="ed-toolbar">
            <div className="ed-toolbar-left">
              <span className="ed-lang-tag">{langLabel}</span>
              <span className="ed-users-tag">
                {clients.length} user{clients.length !== 1 ? "s" : ""} online
              </span>
            </div>
            <div className="ed-stdin-wrap">
              <span className="ed-stdin-label">Stdin</span>
              <input
                type="text"
                className="ed-stdin-input"
                placeholder="Optional program input"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="ed-btn-run"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              <IconPlay />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>

          <div
            className={`ed-terminal-resizer${isResizing ? " is-active" : ""}`}
            onMouseDown={startTerminalResize}
            onTouchStart={startTerminalResize}
            onDoubleClick={resetTerminalHeight}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize terminal panel"
            aria-valuenow={Math.round(terminalHeight)}
            aria-valuemin={MIN_TERMINAL_HEIGHT}
            title="Drag to resize terminal · double-click to reset"
          />

          <OutputPanel
            output={output}
            isRunning={isRunning}
            height={terminalHeight}
          />
        </div>
      </div>

      {filePreview && (
        <FilePreview
          setFilePreview={setFilePreview}
          fileContent={fileContent}
          fileName={fileName}
          resetFileInput={resetFileInput}
          onAppend={handleAppendCode}
          onReplace={handleReplaceCode}
        />
      )}
    </div>
  );
};

export default EditorPage;
