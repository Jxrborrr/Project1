import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export function GoogleIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </SvgIcon>
  );
}
export function FacebookIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </SvgIcon>
  );
}
export function SitemarkIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M4 12h16M12 4v16" />
    </SvgIcon>
  );
}
