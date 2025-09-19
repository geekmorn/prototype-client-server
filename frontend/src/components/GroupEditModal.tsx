import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Group, GroupUpdate } from '../types';
import { useUpdateGroup } from '../hooks/useApi';

interface GroupEditModalProps {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onSuccess?: () => void;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({
  open,
  onClose,
  group,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<GroupUpdate>({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  const updateGroupMutation = useUpdateGroup(group?.id || 0, {
    onSuccess: () => {
      onClose();
      setError('');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to update group');
    },
  });

  // Update form data when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Group name is required');
      return;
    }
    if (!group) return;
    
    updateGroupMutation.mutate(formData);
  };

  const handleClose = () => {
    setError('');
    // Don't reset form data immediately to maintain state
    onClose();
  };

  // Keep user edits intact; only initialize when `group` prop changes is handled above

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mb-4"
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateGroupMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {updateGroupMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GroupEditModal;
