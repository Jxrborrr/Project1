import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ColorModeSelect(props) {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <Tooltip title={dark ? 'Light mode' : 'Dark mode'}>
      <IconButton onClick={() => setDark(v => !v)} {...props}>
        {dark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
