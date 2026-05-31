import {useRecoilState, useSetRecoilState} from 'recoil';
import {uiTheme, cmtheme} from '../atoms';
import {IconSun, IconMoon} from './Icons';
import './ThemeToggle.css';

const LIGHT_EDITOR_THEMES = ['xq-light', 'eclipse', 'base16-light', 'duotone-light', '3024-day'];
const DARK_EDITOR_THEMES = [
    'dracula', 'monokai', 'material', 'nord', 'ayu-dark',
    'cobalt', 'tomorrow-night-bright', 'base16-dark',
];

export default function ThemeToggle({className = '', compact = false}) {
    const [theme, setTheme] = useRecoilState(uiTheme);
    const setCmTheme = useSetRecoilState(cmtheme);
    const isDark = theme === 'dark';

    const toggle = () => {
        const next = isDark ? 'light' : 'dark';
        setTheme(next);
        setCmTheme((current) => {
            if (next === 'light' && DARK_EDITOR_THEMES.includes(current)) {
                return 'xq-light';
            }
            if (next === 'dark' && LIGHT_EDITOR_THEMES.includes(current)) {
                return 'dracula';
            }
            return current;
        });
    };

    return (
        <button
            type="button"
            className={`theme-toggle${isDark ? ' is-dark' : ' is-light'}${compact ? ' compact' : ''} ${className}`.trim()}
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={!isDark}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            <span className="theme-toggle-track">
                <span className="theme-toggle-thumb">
                    {isDark ? <IconMoon /> : <IconSun />}
                </span>
            </span>
            {!compact && (
                <span className="theme-toggle-label">
                    {isDark ? 'Dark' : 'Light'}
                </span>
            )}
        </button>
    );
}
