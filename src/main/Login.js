import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: { width: '450px' },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

export default function SignIn(props) {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  // ui state
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [formError, setFormError] = useState('');

  const validateInputs = () => {
    let ok = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      ok = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      ok = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return ok;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validateInputs()) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      // จัดการ error จาก server ตามสถานะให้เหมาะสม
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setFormError(data.message || 'Invalid email or password');
        } else if (res.status === 429) {
          setFormError(data.message || 'Too many attempts. Please try again later.');
        } else {
          setFormError(data.message || 'Server error');
        }
        return;
      }

      const data = await res.json();

      if (data?.token) {
        const store = remember ? localStorage : sessionStorage;
        store.setItem('token', data.token);
        if (data.user) store.setItem('user', JSON.stringify(data.user));

        navigate('/HotelBooking', { replace: true });
      } else {
        setFormError(data?.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignInContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Sign in
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                id="password"
                name="password"
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  color="primary"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label="Remember me"
            />

            {formError && (
              <Typography color="error" variant="body2">
                {formError}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            Don’t have an account?{' '}
            <Link href="/register" variant="body2" sx={{ alignSelf: 'center' }}>
              Sign up
            </Link>
          </Typography>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
