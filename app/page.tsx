import { Button, Typography, Stack, Container } from '@mui/material';
import Link from 'next/link';

const demoList = {
  title: "Things I Like To Eat",
  items: ["apples","oranges","bananas","olives","small, slow-moving children"]
};

export default function Home() {
  const encodedDemoList = btoa(JSON.stringify(demoList));

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" component="h1" gutterBottom align="center">
          List Jiggler
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          Create and share sortable lists with drag-and-drop functionality. 
          Your list data is stored entirely in the URL - no server required!
        </Typography>

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
      </Stack>
    </Container>
  );
} 