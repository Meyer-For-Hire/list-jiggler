'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  Typography,
  Container,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CreateList() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<string[]>([]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateList = () => {
    if (items.length > 0) {
      const listData = {
        title: title || 'My List',
        items,
      };
      const encodedList = btoa(JSON.stringify(listData));
      router.push(`/list/${encodedList}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Your List
        </Typography>

        <TextField
          label="List Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />

        <form onSubmit={handleAddItem}>
          <TextField
            label="Add new item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            fullWidth
            margin="normal"
          />
        </form>

        <List>
          {items.map((item, index) => (
            <ListItem
              key={index}
              className="list-item"
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteItem(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              {item}
            </ListItem>
          ))}
        </List>

        {items.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateList}
            fullWidth
          >
            Create List
          </Button>
        )}
      </Stack>
    </Container>
  );
} 