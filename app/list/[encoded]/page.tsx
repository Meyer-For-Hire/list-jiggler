'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Container, Typography, Button, Stack, Snackbar, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import { useRouter } from 'next/navigation';
import { SortableItem } from './SortableItem';
import { encodeUrlSafeBase64, decodeUrlSafeBase64 } from '../../utils/encoding';
import BrandHeader from '../../components/BrandHeader';
import Footer from '../../components/Footer';

interface ListData {
  title: string;
  items: string[];
}

export default function List({ params }: { params: { encoded: string } }) {
  const router = useRouter();
  const [listData, setListData] = useState<ListData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const decoded = decodeUrlSafeBase64(params.encoded);
      if (!decoded) {
        setError('Invalid encoded data');
        return;
      }
      
      const data = JSON.parse(decoded) as ListData;
      if (!data.title || !Array.isArray(data.items)) {
        setError('Invalid list format');
        return;
      }
      
      setListData(data);
      setError(null);
    } catch (error) {
      console.error('Failed to decode list data:', error);
      setError('Failed to load list');
    }
  }, [params.encoded]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && listData) {
      const oldIndex = listData.items.indexOf(active.id);
      const newIndex = listData.items.indexOf(over.id);

      setListData({
        ...listData,
        items: arrayMove(listData.items, oldIndex, newIndex),
      });
    }
  };

  const handleShare = () => {
    if (listData) {
      const encodedList = encodeUrlSafeBase64(JSON.stringify(listData));
      const url = `${window.location.origin}/list/${encodedList}`;
      navigator.clipboard.writeText(url);
      setSnackbarOpen(true);
    }
  };

  const handleEdit = () => {
    if (listData) {
      // Encode the current list data and redirect to create page with edit parameter
      const encodedList = encodeUrlSafeBase64(JSON.stringify(listData));
      router.push(`/create?edit=${encodedList}`);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md">
        <Stack spacing={4} sx={{ minHeight: '100vh', py: 6 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Footer variant="page" />
        </Stack>
      </Container>
    );
  }

  if (!listData) {
    return (
      <Container maxWidth="md">
        <Stack spacing={4} sx={{ minHeight: '100vh', py: 6 }}>
          <Typography align="center">Loading...</Typography>
          <div style={{ flexGrow: 1 }} />
          <Footer variant="page" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ minHeight: '100vh', py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {listData.title}
        </Typography>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={listData.items}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ touchAction: 'none', userSelect: 'none' }}>
              {listData.items.map((item, index) => (
                <SortableItem key={item} id={item} index={index}>
                  {item}
                </SortableItem>
              ))}
            </Box>
          </SortableContext>
        </DndContext>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleShare}
            startIcon={<ShareIcon />}
            sx={{ flex: 2 }}
          >
            Share List
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleEdit}
            startIcon={<EditIcon />}
            sx={{ flex: 1 }}
          >
            Edit
          </Button>
        </Box>

        <div style={{ flexGrow: 1 }} />
        <Footer variant="page" />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="List URL copied to clipboard!"
        />
      </Stack>
    </Container>
  );
} 