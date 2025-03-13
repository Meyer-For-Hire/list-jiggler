'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Box,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { encodeUrlSafeBase64, decodeUrlSafeBase64 } from '../utils/encoding';
import BrandHeader from '../components/BrandHeader';
import Footer from '../components/Footer';

type InputMode = 'single' | 'bulk';

interface ListData {
  title: string;
  items: string[];
}

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

// Create a separate component that uses useSearchParams
function CreateListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit');
  
  const [title, setTitle] = useState('');
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>('single');
  const [bulkInput, setBulkInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load existing list data if in edit mode
  useEffect(() => {
    if (editParam) {
      try {
        const decoded = decodeUrlSafeBase64(editParam);
        const data = JSON.parse(decoded) as ListData;
        
        if (data.title && Array.isArray(data.items)) {
          setTitle(data.title);
          setItems(data.items);
          setIsEditMode(true);
        }
      } catch (error) {
        console.error('Failed to decode edit data:', error);
      }
    }
  }, [editParam]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'single' && newItem.trim()) {
      if (editingIndex !== null) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[editingIndex] = newItem.trim();
        setItems(updatedItems);
        setEditingIndex(null);
      } else {
        // Add new item
        setItems([...items, newItem.trim()]);
      }
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
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewItem('');
    }
  };

  const handleEditItem = (index: number) => {
    setNewItem(items[index]);
    setEditingIndex(index);
    setInputMode('single'); // Switch to single mode for editing
  };

  const handleCancelEdit = () => {
    setNewItem('');
    setEditingIndex(null);
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
    <Stack spacing={4} sx={{ minHeight: '100vh', py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit List' : 'Create Your List'}
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
        disabled={editingIndex !== null}
      >
        <ToggleButton value="single" aria-label="single item">
          Add Single Items
        </ToggleButton>
        <ToggleButton value="bulk" aria-label="bulk input">
          Add Multiple Items at Once
        </ToggleButton>
      </ToggleButtonGroup>

      {inputMode === 'single' ? (
        <form onSubmit={handleAddItem}>
          <Stack direction="row" spacing={1}>
            <TextField
              label={editingIndex !== null ? "Edit item" : "Add new item"}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              fullWidth
              margin="normal"
              placeholder={editingIndex !== null ? "Edit item and press Enter" : "Enter a single item and press Enter"}
            />
            {editingIndex !== null && (
              <Button
                variant="text"
                color="primary"
                onClick={handleCancelEdit}
                sx={{ mt: 2 }}
              >
                Cancel
              </Button>
            )}
          </Stack>
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
              <Box>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditItem(index)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteItem(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
            sx={{
              backgroundColor: editingIndex === index ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
            }}
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
          {isEditMode ? 'Save Changes' : 'Create List'}
        </Button>
      )}

      <div style={{ flexGrow: 1 }} />
      <Footer variant="page" />
    </Stack>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <Container maxWidth="sm">
      <Stack 
        spacing={4} 
        sx={{ 
          minHeight: '100vh', 
          py: 6,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
        <div style={{ flexGrow: 1 }} />
        <Footer variant="page" />
      </Stack>
    </Container>
  );
}

// Main component with Suspense boundary
export default function CreateList() {
  return (
    <Container maxWidth="sm">
      <Suspense fallback={<LoadingFallback />}>
        <CreateListContent />
      </Suspense>
    </Container>
  );
} 