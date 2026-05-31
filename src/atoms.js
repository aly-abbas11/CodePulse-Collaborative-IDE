import {atom} from "recoil";

// saving previously selected language and theme to local storage
const localStorageEffect = key => ({setSelf, onSet}) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet(newValue => {
        //   if (newValue instanceof DefaultValue) {
        //     localStorage.removeItem(key);
        //   } else {
        localStorage.setItem(key, JSON.stringify(newValue));
        //   }
    });
};

export const language = atom({
    key: "language",
    default: "javascript",
    effects_UNSTABLE: [
        localStorageEffect('language'),
    ]
});

export const cmtheme = atom({
    key: "cmtheme",
    default: "dracula",
    effects_UNSTABLE: [
        localStorageEffect('cmtheme'),
    ]
});

const systemTheme = () => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
};

export const uiTheme = atom({
    key: "uiTheme",
    default: systemTheme(),
    effects_UNSTABLE: [
        localStorageEffect('uiTheme'),
    ]
});