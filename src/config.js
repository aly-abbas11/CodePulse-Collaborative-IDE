function getAppHost() {
    if (process.env.REACT_APP_APP_HOST) {
        return process.env.REACT_APP_APP_HOST;
    }
    if (typeof window !== 'undefined' && window.location.host) {
        return window.location.host;
    }
    return 'codepulse.vercel.app';
}

export const APP_HOST = getAppHost();

export function workspaceUrl(roomId) {
    return `${APP_HOST}/workspace/${roomId}`;
}
