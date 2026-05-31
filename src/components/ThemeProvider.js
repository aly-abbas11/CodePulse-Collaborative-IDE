import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {uiTheme} from '../atoms';

export default function ThemeProvider({children}) {
    const theme = useRecoilValue(uiTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return children;
}
