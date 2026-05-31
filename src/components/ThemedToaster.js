import {Toaster} from 'react-hot-toast';
import {useRecoilValue} from 'recoil';
import {uiTheme} from '../atoms';

export default function ThemedToaster() {
    const theme = useRecoilValue(uiTheme);
    const isDark = theme === 'dark';

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: isDark ? '#13131e' : '#ffffff',
                    color: isDark ? '#f0f0ff' : '#1a1f2e',
                    border: isDark
                        ? '1px solid rgba(255,255,255,0.07)'
                        : '1px solid rgba(0,0,0,0.08)',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    boxShadow: isDark
                        ? '0 8px 32px rgba(0,0,0,0.4)'
                        : '0 8px 32px rgba(0,80,160,0.12)',
                },
                success: {
                    iconTheme: {
                        primary: isDark ? '#00ff88' : '#00875a',
                        secondary: isDark ? '#13131e' : '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: isDark ? '#ff6b35' : '#d32f2f',
                        secondary: isDark ? '#13131e' : '#ffffff',
                    },
                },
            }}
        />
    );
}
