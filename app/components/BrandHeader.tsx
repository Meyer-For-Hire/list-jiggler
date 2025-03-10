import { Stack, Typography } from '@mui/material';

interface BrandHeaderProps {
  variant?: 'home' | 'page';
}

export default function BrandHeader({ variant = 'page' }: BrandHeaderProps) {
  if (variant === 'home') {
    return (
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" component="h1" align="center">
          List Jiggler
        </Typography>
      </Stack>
    );
  }

  // For non-home pages, return null as the title will be in the footer
  return null;
} 