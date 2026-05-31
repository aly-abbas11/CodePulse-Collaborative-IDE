const {executeLocally, LOCAL_RUNNERS} = require('./localExecute');

const PISTON_API =
    process.env.PISTON_API_URL?.replace(/\/$/, '') ||
    'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP = {
    javascript: 'javascript',
    jsx: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    clike: 'cpp',
    go: 'go',
    rust: 'rust',
    ruby: 'ruby',
    php: 'php',
    swift: 'swift',
    dart: 'dart',
    r: 'r',
    shell: 'bash',
};

async function executeViaPiston(code, cmLanguage, stdin = '') {
    const language = LANGUAGE_MAP[cmLanguage];
    if (!language) {
        throw new Error(
            `"${cmLanguage}" is not supported for execution. Try JavaScript, Python, C++, Java, Go, Rust, PHP, Ruby, or Bash.`
        );
    }

    const headers = {'Content-Type': 'application/json'};
    if (process.env.PISTON_API_TOKEN) {
        headers.Authorization = `Bearer ${process.env.PISTON_API_TOKEN}`;
    }

    const response = await fetch(`${PISTON_API}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            language,
            version: '*',
            files: [{content: code}],
            stdin: stdin || '',
            run_timeout: 5000,
            compile_timeout: 10000,
        }),
    });

    const bodyText = await response.text();
    let data;
    try {
        data = bodyText ? JSON.parse(bodyText) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        const apiMessage =
            data.message || data.error || bodyText?.slice(0, 200) || '';
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                'Remote code runner requires an API key. JavaScript and Python run locally on this machine — use those languages, or set PISTON_API_URL to your own Piston server (Docker).'
            );
        }
        throw new Error(
            apiMessage ||
                `Remote execution failed (HTTP ${response.status}). Use JavaScript or Python for local execution.`
        );
    }

    return {
        stdout: data.run?.stdout ?? '',
        stderr: data.run?.stderr ?? '',
        compileOutput: data.compile?.output ?? '',
        exitCode: data.run?.code,
        language: `${language} (remote)`,
    };
}

async function executeCode(code, cmLanguage, stdin = '') {
    if (LOCAL_RUNNERS[cmLanguage]) {
        try {
            const localResult = await executeLocally(cmLanguage, code, stdin);
            if (localResult) {
                return localResult;
            }
        } catch (err) {
            if (!process.env.PISTON_API_URL && !process.env.PISTON_API_TOKEN) {
                throw err;
            }
        }
    }

    return executeViaPiston(code, cmLanguage, stdin);
}

module.exports = {executeCode, LANGUAGE_MAP, LOCAL_RUNNERS};
