const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RUN_TIMEOUT_MS = 8000;
const MAX_OUTPUT_CHARS = 50000;

function runProcess(command, args, stdin, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            windowsHide: true,
            env: {...process.env, NODE_NO_WARNINGS: '1'},
        });

        let stdout = '';
        let stderr = '';
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            child.kill('SIGTERM');
        }, RUN_TIMEOUT_MS);

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
            if (stdout.length > MAX_OUTPUT_CHARS) {
                stdout = stdout.slice(0, MAX_OUTPUT_CHARS) + '\n...(output truncated)';
                child.kill('SIGTERM');
            }
        });

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
            if (stderr.length > MAX_OUTPUT_CHARS) {
                stderr = stderr.slice(0, MAX_OUTPUT_CHARS) + '\n...(output truncated)';
            }
        });

        if (stdin) {
            child.stdin.write(stdin);
        }
        child.stdin.end();

        child.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            if (killed) {
                resolve({
                    stdout,
                    stderr: stderr || 'Execution timed out (8s limit).',
                    compileOutput: '',
                    exitCode: 124,
                });
                return;
            }
            resolve({
                stdout,
                stderr,
                compileOutput: '',
                exitCode: code ?? 1,
            });
        });
    });
}

function writeTempFile(extension, code) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-code-'));
    const file = path.join(dir, `main.${extension}`);
    fs.writeFileSync(file, code, 'utf8');
    return {dir, file};
}

function cleanup(dir) {
    try {
        fs.rmSync(dir, {recursive: true, force: true});
    } catch {
        // ignore cleanup errors
    }
}

async function tryCommand(command, args, stdin, cwd) {
    try {
        return await runProcess(command, args, stdin, cwd);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }
        throw err;
    }
}

async function runJavaScript(code, stdin) {
    const {dir, file} = writeTempFile('js', code);
    try {
        const result = await tryCommand('node', [file], stdin, dir);
        if (result) {
            return {...result, language: 'javascript (local)'};
        }
        throw new Error(
            'Node.js is not installed. Install Node.js or use a self-hosted Piston server (see README).'
        );
    } finally {
        cleanup(dir);
    }
}

async function runPython(code, stdin) {
    const {dir, file} = writeTempFile('py', code);
    try {
        const attempts = [
            ['python', [file]],
            ['python3', [file]],
            ['py', ['-3', file]],
        ];

        for (const [cmd, args] of attempts) {
            const result = await tryCommand(cmd, args, stdin, dir);
            if (result) {
                return {...result, language: 'python (local)'};
            }
        }

        throw new Error(
            'Python is not installed. Install Python or use a self-hosted Piston server (see README).'
        );
    } finally {
        cleanup(dir);
    }
}

async function runCpp(code, stdin) {
    const {dir, file} = writeTempFile('cpp', code);
    const exe = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
    try {
        const compileAttempts = [
            ['g++', [file, '-std=c++17', '-O0', '-o', exe]],
            ['clang++', [file, '-std=c++17', '-O0', '-o', exe]],
        ];

        if (process.platform === 'win32') {
            compileAttempts.push(
                ['C:\\MinGW\\bin\\g++.exe', [file, '-std=c++17', '-O0', '-o', exe]],
                ['C:\\msys64\\mingw64\\bin\\g++.exe', [file, '-std=c++17', '-O0', '-o', exe]]
            );
        }

        let compileResult = null;
        for (const [cmd, args] of compileAttempts) {
            compileResult = await tryCommand(cmd, args, '', dir);
            if (compileResult !== null) {
                break;
            }
        }

        if (!compileResult) {
            throw new Error(
                'C++ compiler not found. Install g++ (MinGW on Windows, build-essential on Linux), or use the Hugging Face Docker deploy.'
            );
        }

        if (compileResult.exitCode !== 0) {
            const compileOutput =
                compileResult.stderr || compileResult.stdout || 'Compilation failed.';
            return {
                stdout: '',
                stderr: compileOutput,
                compileOutput,
                exitCode: compileResult.exitCode,
                language: 'c++ (local)',
            };
        }

        const runResult = await tryCommand(exe, [], stdin, dir);
        if (!runResult) {
            throw new Error('Failed to run compiled C++ program.');
        }

        return {...runResult, language: 'c++ (local)'};
    } finally {
        cleanup(dir);
    }
}

async function runBash(code, stdin) {
    const {dir, file} = writeTempFile('sh', code);
    try {
        const attempts = [
            ['bash', [file]],
            ['sh', [file]],
        ];

        if (process.platform === 'win32') {
            attempts.unshift(
                ['C:\\Program Files\\Git\\bin\\bash.exe', [file]],
                ['C:\\Program Files (x86)\\Git\\bin\\bash.exe', [file]]
            );
        }

        for (const [cmd, args] of attempts) {
            const result = await tryCommand(cmd, args, stdin, dir);
            if (result) {
                return {...result, language: 'bash (local)'};
            }
        }

        throw new Error(
            'Bash is not available. On Windows, install Git Bash, or use JavaScript/Python.'
        );
    } finally {
        cleanup(dir);
    }
}

const LOCAL_RUNNERS = {
    javascript: runJavaScript,
    jsx: runJavaScript,
    python: runPython,
    shell: runBash,
    cpp: runCpp,
    clike: runCpp,
};

async function executeLocally(cmLanguage, code, stdin) {
    const runner = LOCAL_RUNNERS[cmLanguage];
    if (!runner) {
        return null;
    }
    return runner(code, stdin);
}

module.exports = {executeLocally, LOCAL_RUNNERS};
