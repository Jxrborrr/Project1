import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
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
import { SitemarkIcon } from '../components/CustomIcons';

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
  ...theme.applyStyles?.('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
}));

// ใช้ env ของ CRA; เปลี่ยนพอร์ต/โดเมนตาม backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

export default function SignUp(props) {
  const navigate = useNavigate();

  // form state
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ui/validation state
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fnameError, setFnameError] = useState('');
  const [lnameError, setLnameError] = useState('');
  const [formError, setFormError] = useState('');

  const validate = () => {
    let ok = true;
    setEmailError(''); setPasswordError(''); setFnameError(''); setLnameError(''); setFormError('');

    if (!fname.trim()) { setFnameError('First name is required.'); ok = false; }
    if (!lname.trim()) { setLnameError('Last name is required.'); ok = false; }
    const e = email.trim();
    if (!e || !/\S+@\S+\.\S+/.test(e)) { setEmailError('Please enter a valid email address.'); ok = false; }
    if (!password || password.length < 6) { setPasswordError('Password must be at least 6 characters long.'); ok = false; }
    return ok;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/register`, {   // ถ้า backend เป็น /auth/register ให้เปลี่ยนบรรทัดนี้
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fname: fname.trim(),
          lname: lname.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) setEmailError(data.message || 'This email is already registered');
        else setFormError(data.message || 'Register failed');
        return;
      }

      alert('Register success!');
      navigate('/login', { replace: true });
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
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Sign up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="fname">First name</FormLabel>
              <TextField
                id="fname" name="fname" required fullWidth autoComplete="given-name"
                value={fname} onChange={(e) => setFname(e.target.value)}
                error={!!fnameError} helperText={fnameError}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="lname">Last name</FormLabel>
              <TextField
                id="lname" name="lname" required fullWidth autoComplete="family-name"
                value={lname} onChange={(e) => setLname(e.target.value)}
                error={!!lnameError} helperText={lnameError}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email" name="email" required fullWidth autoComplete="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                error={!!emailError} helperText={emailError}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password" name="password" type="password" required fullWidth autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError} helperText={passwordError}
              />
            </FormControl>

            {formError && <Typography color="error" variant="body2">{formError}</Typography>}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            Already have an account?{' '}
            <Link href="/login" variant="body2" sx={{ alignSelf: 'center' }}>
              Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
