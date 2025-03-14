import { Button, Typography, Stack, Container } from '@mui/material';
import Link from 'next/link';
import { encodeUrlSafeBase64 } from './utils/encoding';
import BrandHeader from './components/BrandHeader';
import Footer from './components/Footer';

const demoList = {
  title: "Things I Like To Eat",
  items: ["apples","oranges","bananas","olives","small, slow-moving children"]
};

export default function Home() {
  const encodedDemoList = encodeUrlSafeBase64(JSON.stringify(demoList));

  return (
    <Container maxWidth="sm">
      <Stack 
        spacing={4} 
        alignItems="center" 
        sx={{ 
          minHeight: '100vh',
          py: 6,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <BrandHeader variant="home" />
        
        <Typography variant="body1" paragraph align="center">
          Create and share sortable lists with drag-and-drop functionality. 
          Your list data is stored entirely in the URL - no server required!
        </Typography>

        <Stack spacing={2} alignItems="center">
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/create"
            >
              Jiggle My Own List
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href={`/list/${encodedDemoList}`}
            >
              Jiggle a Demo List
            </Button>
          </Stack>

          <Button
            variant="text"
            color="primary"
            component={Link}
            href="/compare"
          >
            Compare Multiple Rankings
          </Button>
        </Stack>

        <div style={{ flexGrow: 1 }} />
        <Footer variant="home" />
      </Stack>
    </Container>
  );
} 