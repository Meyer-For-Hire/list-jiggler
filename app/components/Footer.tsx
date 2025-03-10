import Image from 'next/image';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';

interface FooterProps {
  variant?: 'home' | 'page';
}

export default function Footer({ variant = 'page' }: FooterProps) {
  const logoSize = 60;
  
  return (
    <Stack spacing={1} alignItems="center" sx={{ py: 6 }}>
      {variant === 'page' && (
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 1 }}>
          <Typography variant="h5" align="center">
            List Jiggler
          </Typography>
        </Link>
      )}
      <Typography variant="body2" color="text.secondary">
        a useful tool by
      </Typography>
      <Link href="https://meyer4hire.com/" target="_blank" rel="noopener noreferrer">
        <Image
          src="/m4h-blue-coin.132x132.png"
          alt="Meyer4Hire Logo"
          width={logoSize}
          height={logoSize}
          style={{ borderRadius: '50%' }}
        />
      </Link>
    </Stack>
  );
} 