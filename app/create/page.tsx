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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { encodeUrlSafeBase64 } from '../utils/encoding';

type InputMode = 'single' | 'bulk';

function parseBulkInput(input: string): string[] {
  // First, try to parse as CSV
  if (input.includes(',')) {
    const items: string[] = [];
    let currentItem = '';
    let inQuotes = false;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        if (currentItem.trim()) {
          // Remove surrounding quotes if they exist
          currentItem = currentItem.replace(/^"(.*)"$/, '$1');
          items.push(currentItem.trim());
        }
        currentItem = '';
      } else {
        currentItem += char;
      }
    }
    
    // Don't forget the last item
    if (currentItem.trim()) {
      currentItem = currentItem.replace(/^"(.*)"$/, '$1');
      items.push(currentItem.trim());
    }
    
    return items.filter(item => item.length > 0);
  }
  
  // If no commas found, split by line breaks
  return input
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export default function CreateList() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('single');
  const [bulkInput, setBulkInput] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'single' && newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleAddBulkItems = () => {
    if (bulkInput.trim()) {
      const newItems = parseBulkInput(bulkInput);
      setItems([...items, ...newItems]);
      setBulkInput('');
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
      const encodedList = encodeUrlSafeBase64(JSON.stringify(listData));
      if (encodedList) {
        router.push(`/list/${encodedList}`);
      }
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

        <ToggleButtonGroup
          value={inputMode}
          exclusive
          onChange={(_, newMode) => newMode && setInputMode(newMode)}
          aria-label="input mode"
          fullWidth
        >
          <ToggleButton value="single" aria-label="single item">
            Single Item
          </ToggleButton>
          <ToggleButton value="bulk" aria-label="bulk input">
            Bulk Input
          </ToggleButton>
        </ToggleButtonGroup>

        {inputMode === 'single' ? (
          <form onSubmit={handleAddItem}>
            <TextField
              label="Add new item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter a single item and press Enter"
            />
          </form>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Bulk add items"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              placeholder={
                'Add multiple items separated by commas or one item per line.\n\n' +
                'For CSV, quote items containing commas. Example:\n' +
                'apple, cherry, "very, very ripe banana"'
              }
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddBulkItems}
              disabled={!bulkInput.trim()}
              startIcon={<AddIcon />}
            >
              Add Items
            </Button>
          </Stack>
        )}

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