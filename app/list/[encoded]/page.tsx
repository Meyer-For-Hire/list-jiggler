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
import { Container, Typography, Button, Stack, Snackbar } from '@mui/material';
import { SortableItem } from './SortableItem';

interface ListData {
  title: string;
  items: string[];
}

function decodeUrlSafeBase64(str: string): string {
  // Add padding if needed
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  try {
    return decodeURIComponent(escape(window.atob(base64)));
  } catch (e) {
    console.error('Failed to decode:', e);
    return '';
  }
}

function encodeUrlSafeBase64(str: string): string {
  try {
    const base64 = window.btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (e) {
    console.error('Failed to encode:', e);
    return '';
  }
}

export default function List({ params }: { params: { encoded: string } }) {
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

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!listData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography align="center">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={4}>
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
            {listData.items.map((item) => (
              <SortableItem key={item} id={item}>
                {item}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        <Button variant="contained" color="primary" onClick={handleShare}>
          Share List
        </Button>

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