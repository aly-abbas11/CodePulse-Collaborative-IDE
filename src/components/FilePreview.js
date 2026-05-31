import {useState} from 'react';
import toast from 'react-hot-toast';
import {
    IconFile,
    IconClose,
    IconCopy,
    IconWrap,
    IconCheck,
} from './Icons';
import CodePulseLogo from './CodePulseLogo';
import './FilePreview.css';

const EXT_LANG = {
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    md: 'Markdown',
    txt: 'Plain Text',
};

function getLanguageFromFilename(name) {
    if (!name) return 'Plain Text';
    const ext = name.split('.').pop()?.toLowerCase();
    return EXT_LANG[ext] || ext?.toUpperCase() || 'Plain Text';
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

const FilePreview = ({
    setFilePreview,
    fileContent,
    fileName = 'uploaded-file.txt',
    resetFileInput,
    onAppend,
    onReplace,
}) => {
    const [selectedLine, setSelectedLine] = useState(null);
    const [clickedBtn, setClickedBtn] = useState(null);
    const [wrapLines, setWrapLines] = useState(false);
    const [copied, setCopied] = useState(false);

    const lines = fileContent.split('\n');
    const lineCount = lines.length;
    const byteSize = new Blob([fileContent]).size;
    const language = getLanguageFromFilename(fileName);

    const handleCancel = () => {
        resetFileInput();
        setFilePreview(false);
    };

    const handleAction = (label, action) => {
        setClickedBtn(label);
        setTimeout(() => setClickedBtn(null), 200);
        action();
        if (label === 'Replace') toast.success('File replaced in editor');
        if (label === 'Append') toast.success('Content appended to editor');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fileContent);
            setCopied(true);
            toast.success('Code copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy to clipboard');
        }
    };

    const bgGhost = `${fileContent}\n\n`.repeat(3).slice(0, 4000);

    return (
        <div className="fp-page" role="dialog" aria-modal="true" aria-label="File preview">
            <div className="fp-bg-editor">{bgGhost}</div>
            <button
                type="button"
                className="fp-backdrop"
                onClick={handleCancel}
                aria-label="Close preview"
            />

            <div className="fp-modal">
                <div className="fp-header">
                    <div className="fp-header-left">
                        <CodePulseLogo size="xs" showWordmark={false} className="fp-header-logo" />
                        <div className="fp-file-icon">
                            <IconFile />
                        </div>
                        <div>
                            <div className="fp-title">
                                File Preview
                                <span className="fp-filename-badge" title={fileName}>
                                    {fileName}
                                </span>
                            </div>
                            <div className="fp-subtitle">
                                Read-only · {language} · {lineCount} lines
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="fp-close"
                        onClick={handleCancel}
                        aria-label="Close"
                    >
                        <IconClose />
                    </button>
                </div>

                <div className="fp-toolbar">
                    <div className="fp-toolbar-left">
                        <span className="fp-lang-tag">{language}</span>
                        <span className="fp-lines-tag">
                            {lineCount} lines · {formatBytes(byteSize)}
                        </span>
                    </div>
                    <div className="fp-toolbar-right">
                        <button
                            type="button"
                            className={`fp-tool-btn${wrapLines ? ' active' : ''}`}
                            onClick={() => setWrapLines((w) => !w)}
                        >
                            <IconWrap />
                            Wrap
                        </button>
                        <button
                            type="button"
                            className={`fp-tool-btn${copied ? ' active' : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? <IconCheck /> : <IconCopy />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="fp-code-scroll">
                    <div className="fp-code">
                        <div className="fp-line-nums">
                            {lines.map((_, i) => (
                                <div
                                    key={`ln-${i}`}
                                    className={`fp-ln${selectedLine === i ? ' highlight' : ''}`}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <div className="fp-lines">
                            {lines.map((line, i) => (
                                <span
                                    key={`line-${i}`}
                                    className={`fp-line${selectedLine === i ? ' selected' : ''}`}
                                    style={{whiteSpace: wrapLines ? 'pre-wrap' : 'pre'}}
                                    onClick={() =>
                                        setSelectedLine(selectedLine === i ? null : i)
                                    }
                                    role="presentation"
                                >
                                    {line.length === 0 ? '\u00A0' : line}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fp-footer">
                    <div className="fp-footer-info">
                        <span className="dot" />
                        {selectedLine !== null
                            ? `Line ${selectedLine + 1} selected`
                            : 'No selection'}
                    </div>
                    <div className="fp-footer-actions">
                        <button
                            type="button"
                            className={`fp-btn cancel${clickedBtn === 'Cancel' ? ' clicked' : ''}`}
                            onClick={() => handleAction('Cancel', handleCancel)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`fp-btn replace${clickedBtn === 'Replace' ? ' clicked' : ''}`}
                            onClick={() => handleAction('Replace', onReplace)}
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            className={`fp-btn append${clickedBtn === 'Append' ? ' clicked' : ''}`}
                            onClick={() => handleAction('Append', onAppend)}
                        >
                            Append
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreview;
