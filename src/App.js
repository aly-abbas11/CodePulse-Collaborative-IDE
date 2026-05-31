import './App.css';
import './themes.css';
import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import EditorPage from './pages/EditorPage';
import ThemeProvider from './components/ThemeProvider';
import ThemedToaster from './components/ThemedToaster';
import CodePulsePreloader from './components/CodePulsePreloader';

function AppContent() {
    return (
        <>
            <ThemedToaster />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/join" element={<JoinRoom />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

function App() {
    const skipFromUrl =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('skipPreloader');

    const [showPreloader, setShowPreloader] = useState(!skipFromUrl);

    const handlePreloaderComplete = useCallback(() => {
        setShowPreloader(false);
    }, []);

    return (
        <RecoilRoot>
            <ThemeProvider>
                {showPreloader ? (
                    <CodePulsePreloader onComplete={handlePreloaderComplete} />
                ) : (
                    <AppContent />
                )}
            </ThemeProvider>
        </RecoilRoot>
    );
}

export default App;
