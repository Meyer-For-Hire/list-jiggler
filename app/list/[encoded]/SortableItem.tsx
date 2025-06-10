import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Typography, Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface Props {
  id: string;
  children: string;
  index?: number;
}

export function SortableItem({ id, children, index }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper 
      ref={setNodeRef} 
      style={style}
      sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box 
        {...attributes} 
        {...listeners} 
        sx={{ 
          mr: 2, 
          cursor: 'grab',
          display: 'flex',
          color: 'action.active',
          touchAction: 'none',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <DragIndicatorIcon />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        {index !== undefined && (
          <Box
            sx={{
              mr: 2,
              bgcolor: 'grey.600',
              color: 'common.white',
              borderRadius: 1,
              minWidth: '2em',
              height: '2em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'medium',
              fontSize: '0.875rem'
            }}
          >
            {index + 1}
          </Box>
        )}
        <Typography sx={{ flex: 1 }}>{children}</Typography>
      </Box>
    </Paper>
  );
} 