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

export default function List({ params }: { params: { encoded: string } }) {
  const [listData, setListData] = useState<ListData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    try {
      const decoded = atob(params.encoded);
      const data = JSON.parse(decoded) as ListData;
      setListData(data);
    } catch (error) {
      console.error('Failed to decode list data:', error);
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
      const encodedList = btoa(JSON.stringify(listData));
      const url = `${window.location.origin}/list/${encodedList}`;
      navigator.clipboard.writeText(url);
      setSnackbarOpen(true);
    }
  };

  if (!listData) {
    return <Typography>Loading...</Typography>;
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