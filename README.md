<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0,0,0,100&height=12&section=header" width="100%"/>

<img src="https://capsule-render.vercel.app/api?type=soft&color=0d1117,0a3d2e,0d1117,0a2e3d,0d1117&height=280&section=header&text=CODEPULSE&fontSize=72&fontColor=00ffcc&fontAlignY=45&desc=COLLABORATIVE%20IDE%20%E2%80%94%20CODE%20TOGETHER.%20SHIP%20FASTER.&descAlignY=65&descSize=14&descColor=4dffdb&animation=twinkling" width="100%"/>

<br/>

```
[ OK ] loading core modules
[ OK ] connecting websocket
[ OK ] spawning worker threads
[ OK ] compiling shader cache
[ OK ] syncing peer network
       PULSE READY.
```

<br/>

<p>
<img src="https://img.shields.io/badge/Node.js-Runtime-00ffcc?style=for-the-badge&logo=nodedotjs&logoColor=black&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/Socket.io-Real--time-00d4aa?style=for-the-badge&logo=socketdotio&logoColor=white&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/React-Frontend-00b894?style=for-the-badge&logo=react&logoColor=black&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/Docker-Container-0097a7?style=for-the-badge&logo=docker&logoColor=white&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/HuggingFace-Deployed-ff6b9d?style=for-the-badge&logo=huggingface&logoColor=white&labelColor=0d1117"/>
</p>

<p>
<img src="https://img.shields.io/badge/Version-4.2.0--nightly-00ffcc?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/Status-Live-00d4aa?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/License-MIT-00b894?style=flat-square&labelColor=0d1117"/>
<img src="https://img.shields.io/badge/Latency-%3C50ms-ff6b9d?style=flat-square&labelColor=0d1117"/>
</p>

<br/>

<a href="https://salmantanveer-codepulse.hf.space">
<img src="https://img.shields.io/badge/LAUNCH%20CODEPULSE%20%E2%86%92%20salmantanveer--codepulse.hf.space-00ffcc?style=for-the-badge&labelColor=0d1117"/>
</a>

</div>

---

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   "Stop context-switching between your editor, terminal, and teammates.     │
│    CodePulse puts everything in one room — live."                           │
│                                                                             │
│   The problem every dev team faces:                                         │
│   ├── Screen sharing lags, code review is async, setup takes hours         │
│   ├── Pair programming requires being physically present                    │
│   └── Collaborative IDEs are either expensive or limited                   │
│                                                                             │
│   CodePulse solves all three. Zero setup. Real-time. Free.                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

</div>

---

## What CodePulse Actually Is

CodePulse is a browser-based collaborative IDE where multiple developers can write, edit, and execute code simultaneously in a shared workspace — like Google Docs but for code, with a real terminal.

You create a room, share the ID, and anyone with the link is instantly in your editor. They see your cursor. You see theirs. Code runs for everyone at the same time. No accounts. No installs. No config.

---

## Real-World Use Cases

```
┌──────────────────────────────────────────────────────────────────────────┐
│  WHO USES THIS AND HOW                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  University Lab Sessions                                                 │
│  ├── Professor shares Room ID with 30 students                          │
│  ├── Everyone edits the same file live during lecture                   │
│  └── Code runs instantly — no "it works on my machine"                  │
│                                                                          │
│  Remote Pair Programming                                                 │
│  ├── Senior dev and intern in different countries                        │
│  ├── Both see cursor positions and edits in real-time                   │
│  └── Run the code together, debug together                              │
│                                                                          │
│  Technical Interviews                                                    │
│  ├── Interviewer creates a room, shares ID with candidate               │
│  ├── Candidate codes live — interviewer watches, comments               │
│  └── No setup friction, no screen share lag                             │
│                                                                          │
│  Hackathons                                                              │
│  ├── Team of 4 sharing one codebase in real-time                        │
│  ├── One person writes logic, another writes tests simultaneously       │
│  └── Everyone sees the terminal output immediately                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    CodePulse — Under The Hood                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   USER A (Browser)              USER B (Browser)                         ║
║   ┌─────────────────┐           ┌─────────────────┐                     ║
║   │  React Editor   │           │  React Editor   │                     ║
║   │  Monaco / CM    │           │  Monaco / CM    │                     ║
║   └────────┬────────┘           └────────┬────────┘                     ║
║            │  WebSocket emit             │  WebSocket emit               ║
║            └──────────────┬─────────────┘                               ║
║                           ▼                                              ║
║   ┌───────────────────────────────────────────────────────────┐         ║
║   │               Node.js + Socket.io Server                  │         ║
║   │                                                           │         ║
║   │   Room Manager                                            │         ║
║   │   ├── roomId → [socketA, socketB, socketC...]             │         ║
║   │   ├── on code-change → broadcast to room                  │         ║
║   │   ├── on cursor-move → broadcast cursor position          │         ║
║   │   └── on user-join  → sync current editor state           │         ║
║   │                                                           │         ║
║   │   Code Executor                                           │         ║
║   │   ├── Receives code + language from client                │         ║
║   │   ├── Spins isolated execution environment                │         ║
║   │   ├── Runs: executeCode.js / localExecute.js              │         ║
║   │   └── Returns stdout/stderr to entire room                │         ║
║   └───────────────────────────────────────────────────────────┘         ║
║                           │                                              ║
║                           ▼                                              ║
║   ┌───────────────────────────────────────────────────────────┐         ║
║   │  Execution Layer (Docker isolated sandbox)                │         ║
║   │  Supported: JavaScript, Python, and more                  │         ║
║   └───────────────────────────────────────────────────────────┘         ║
╚══════════════════════════════════════════════════════════════════════════╝
```

</div>

---

## How It Works — Step by Step

```
CREATING A SESSION
──────────────────
Step 1   Open CodePulse → click "New" or "Create a Project"
Step 2   A unique Room ID is generated (UUID v4)
Step 3   Share the Room ID with your teammate
Step 4   Teammate opens CodePulse → pastes Room ID → clicks Join Room
Step 5   Both are now in the same live workspace

CODING TOGETHER
───────────────
Step 6   Both users see the same editor state (synced on join)
Step 7   Every keystroke is emitted via WebSocket to the server
Step 8   Server broadcasts the delta to all users in the room
Step 9   Cursor positions update in real-time for all participants
Step 10  Select language from dropdown (JavaScript, Python, etc.)

EXECUTING CODE
──────────────
Step 11  Click "Run Code"
Step 12  Server receives code, routes to execution engine
Step 13  Code runs in isolated environment
Step 14  stdout / stderr streams back to terminal panel
Step 15  Everyone in the room sees the output simultaneously
```

---

## Features

**Real-time Collaboration Engine**
- Sub-50ms latency sync across all connected clients in a room
- Cursor presence indicators showing who is editing where
- Shared editor state — join mid-session and instantly catch up
- Room-based isolation — each room is a separate sandbox

**Code Execution**
- Write and run code directly in the browser
- Output renders in a shared terminal panel visible to all users
- Isolated execution per room — no cross-contamination
- Supports multiple programming languages

**Editor Experience**
- Dracula theme by default with light mode toggle
- Syntax highlighting per language
- File upload support for loading existing code
- Cinematic loading screen on workspace boot

**Zero Friction Access**
- No account required — enter a username and Room ID
- No installs — runs entirely in the browser
- No server setup for users — just open and code

---

## UI Layout

```
LANDING PAGE
────────────────────────────────────────────────────────────────────
  [0] CODEPULSE          Workspace  Collaborate  Features    New

  Code together.
  Ship faster.           v2.0 — Real-time execution now live

  [ Get Started for Free ]  [ View Demo ]

  ┌──────────────────────────────────────────────────────┐
  │  index.js        server_dev   mike_code              │
  │  import { server } from "./nexus";                   │
  │  const app = server.init({                           │
  │    port: 8080,                                       │
  │    debug: true                                       │
  │  });                                                 │
  └──────────────────────────────────────────────────────┘

JOIN PAGE
────────────────────────────────────────────────────────────────────
  ROOM ID    [ 3751d489-b78c-475a-80ef-98a7... ]  Generate
  USERNAME   [ Guest                             ]
  [ Join Room → ]     OR     [ + Create new room ]

EDITOR WORKSPACE
────────────────────────────────────────────────────────────────────
  ┌────────────────┬─────────────────────────────────────────────┐
  │ Connected      │  1  const pulse =                           │
  │ [G] Guest      │  2  // Initialize real-time connection      │
  │                │  3  const app = server.init({               │
  │ Appearance     │  4    port: 8080,                           │
  │ [Light toggle] │  5    debug: true                           │
  │                │  6  });                                     │
  │ Upload File    │                                             │
  │                ├─────────────────────────────────────────────┤
  │ LANGUAGE       │  JavaScript    1 user online    STDIN       │
  │ JavaScript     │  [ Run Code → ]                             │
  │                ├─────────────────────────────────────────────┤
  │ EDITOR THEME   │  Terminal                                   │
  │ Dracula        │  Click Run to execute...                    │
  │                │                                             │
  │ Copy Room ID   │                                             │
  │ Leave          │                                             │
  └────────────────┴─────────────────────────────────────────────┘
```

---

## Project Structure

```
codepulse/
│
├── public/                     # Static frontend assets
│   └── index.html              # Entry HTML
│
├── src/                        # React frontend source
│   ├── components/             # Editor, terminal, sidebar components
│   ├── pages/                  # Landing, join, workspace pages
│   └── App.js                  # Root component + routing
│
├── executeCode.js              # Cloud execution handler
├── localExecute.js             # Local execution engine (Docker sandbox)
├── server.js                   # Node.js + Socket.io server
├── package.json
├── Dockerfile                  # Container definition
├── .dockerignore
└── README.md
```

---

## Installation

```bash
# Clone
git clone https://github.com/aly-abbas11/CodePulse-Collaborative-IDE.git
cd CodePulse-Collaborative-IDE

# Install
npm install

# Start
node server.js
```

Open `http://localhost:3000`

### Docker

```bash
docker build -t codepulse .
docker run -p 3000:3000 codepulse
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Real-time | Socket.io |
| Frontend | React |
| Editor | Monaco / CodeMirror |
| Execution | Docker sandbox |
| Deployment | HuggingFace Spaces |
| Containerization | Docker |

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

```
[ OK ] session terminated
[ OK ] workspace saved
[ OK ] peers disconnected
       PULSE OFFLINE..
```

<img src="https://capsule-render.vercel.app/api?type=soft&color=0d1117,0a3d2e,0d1117&height=100&section=footer&animation=twinkling" width="100%"/>

<sub>Web Technologies Lab — Air University Lahore, Spring 2026 &nbsp;|&nbsp; Deployed on HuggingFace Spaces</sub>

</div>
