import * as React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export default function AppTheme({ children }) {
  const [mode, setMode] = React.useState('light'); // ถ้าอยากสลับโหมด ให้ ColorModeSelect เรียก setMode
  const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
