import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  People,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useGroups, useCreateGroup, useDeleteGroup } from '../hooks/useApi';
import { GroupCreate, Group } from '../types';
import GroupEditModal from '../components/GroupEditModal';
import GroupDetailModal from '../components/GroupDetailModal';

const Groups: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<GroupCreate>({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  
  const { data: groups, isLoading, error: groupsError } = useGroups();
  const createGroupMutation = useCreateGroup({
    onSuccess: () => {
      setCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create group');
    },
  });
  
  const deleteGroupMutation = useDeleteGroup({
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to delete group');
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }
    createGroupMutation.mutate(formData);
  };

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  const handleViewDetails = (group: Group) => {
    // Always update selectedGroup to the new group
    setSelectedGroup(group);
    setDetailModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    // Always update selectedGroup to the new group
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    // Keep selectedGroup for potential reopening
  };

  const handleDetailDelete = () => {
    setDetailModalOpen(false);
    // Keep selectedGroup for potential reopening
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setDetailModalOpen(false);
    // Don't reset selectedGroup - keep it for potential reopening
  };

  const handleCloseAllModals = () => {
    setEditModalOpen(false);
    setDetailModalOpen(false);
    setSelectedGroup(null);
  };

  // Clear selected group when component unmounts or when groups list changes
  React.useEffect(() => {
    return () => {
      setSelectedGroup(null);
    };
  }, []);

  // Clear selected group if it's no longer in the groups list
  React.useEffect(() => {
    if (selectedGroup && groups && !groups.find(g => g.id === selectedGroup.id)) {
      setSelectedGroup(null);
    }
  }, [groups, selectedGroup]);

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading groups...</Typography>
      </Container>
    );
  }

  if (groupsError) {
    return (
      <Container>
        <Alert severity="error">
          Failed to load groups: {groupsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-gray-800">
          Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Create Group
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {groups && groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <People className="text-6xl text-gray-400 mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No groups yet
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              Create your first group to start tracking expenses with friends
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Create Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {groups?.map((group) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-2">
                    {group.name}
                  </Typography>
                  {group.description && (
                    <Typography variant="body2" className="text-gray-600 mb-3">
                      {group.description}
                    </Typography>
                  )}
                  <Box className="flex items-center gap-2 mb-3">
                    <Chip
                      icon={<People />}
                      label="Group"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" className="text-gray-500">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions className="justify-between">
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(group)}
                    className="text-primary-600"
                  >
                    View Details
                  </Button>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditGroup(group)}
                      className="text-gray-600"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateGroup}>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              variant="outlined"
              value={formData.name}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createGroupMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Group Modal */}
      <GroupEditModal
        key={`edit-${selectedGroup?.id || 'none'}`}
        open={editModalOpen}
        onClose={handleModalClose}
        group={selectedGroup}
        onSuccess={handleEditSuccess}
      />

      {/* Group Detail Modal */}
      <GroupDetailModal
        key={`detail-${selectedGroup?.id || 'none'}`}
        open={detailModalOpen}
        onClose={handleModalClose}
        groupId={selectedGroup?.id || null}
        onEdit={handleEditGroup}
        onDelete={handleDetailDelete}
      />
    </Container>
  );
};

export default Groups;
