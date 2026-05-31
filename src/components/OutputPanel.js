import React from 'react';

const OutputPanel = ({output, isRunning, height}) => {
    const style = height ? {height} : undefined;

    if (!output && !isRunning) {
        return (
            <div className="ed-terminal" style={style}>
                <div className="ed-terminal-header">
                    <div className="ed-terminal-header-left">
                        <span className="ed-terminal-dot" />
                        Terminal
                    </div>
                </div>
                <div className="ed-terminal-empty">
                    Click Run to execute your program. Output appears here for
                    everyone in the room.
                </div>
            </div>
        );
    }

    if (isRunning && !output) {
        return (
            <div className="ed-terminal" style={style}>
                <div className="ed-terminal-header">
                    <div className="ed-terminal-header-left">
                        <span className="ed-terminal-dot running" />
                        Running...
                    </div>
                </div>
                <div className="ed-terminal-empty">Executing code...</div>
            </div>
        );
    }

    const {username, stdout, stderr, compileOutput, exitCode, error, language} =
        output;

    return (
        <div className="ed-terminal" style={style}>
            <div className="ed-terminal-header">
                <div className="ed-terminal-header-left">
                    <span className="ed-terminal-dot" />
                    {error
                        ? 'Error'
                        : `Output${username ? ` — ${username}` : ''}${
                              language ? ` (${language})` : ''
                          }`}
                </div>
                {!error && exitCode !== undefined && (
                    <span className="ed-exit-code">exit {exitCode}</span>
                )}
            </div>
            <pre className="ed-terminal-body">
                {error && <span className="ed-out-error">{error}</span>}
                {compileOutput && (
                    <>
                        <span className="ed-out-label">Compile:</span>
                        {compileOutput}
                        {'\n'}
                    </>
                )}
                {stdout}
                {stderr && (
                    <>
                        {stdout ? '\n' : ''}
                        <span className="ed-out-error">{stderr}</span>
                    </>
                )}
                {!error && !stdout && !stderr && !compileOutput && (
                    <span className="ed-terminal-empty">(no output)</span>
                )}
            </pre>
        </div>
    );
};

export default OutputPanel;
