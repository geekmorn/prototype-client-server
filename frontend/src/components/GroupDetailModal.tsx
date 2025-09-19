import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  ListItemButton,
} from '@mui/material';
import {
  People,
  Close,
  PersonRemove,
  Edit,
  Delete,
  Search,
  PersonAdd,
} from '@mui/icons-material';
import { GroupWithMembers, GroupMember, User } from '../types';
import { useGroup, useDeleteGroup, useRemoveGroupMember, useSearchUsers, useAddGroupMember } from '../hooks/useApi';

interface GroupDetailModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number | null;
  onEdit?: (group: GroupWithMembers) => void;
  onDelete?: () => void;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  open,
  onClose,
  groupId,
  onEdit,
  onDelete,
}) => {
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  const { data: groupData, isLoading, error: groupError } = useGroup(
    groupId || 0,
    { enabled: open && !!groupId } as any
  );

  const deleteGroupMutation = useDeleteGroup({
    onSuccess: () => {
      onClose();
      if (onDelete) onDelete();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to delete group');
    },
  });

  const removeMemberMutation = useRemoveGroupMember(groupId || 0, {
    onSuccess: () => {
      setError(''); // Clear any previous errors
      // The optimistic update will handle the UI change immediately
      // The query will automatically refetch due to React Query's cache invalidation
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to remove member');
    },
  });

  const addMemberMutation = useAddGroupMember(groupId || 0, {
    onSuccess: () => {
      setSearchQuery('');
      setShowAddUser(false);
      setError(''); // Clear any previous errors
      // The optimistic update will handle the UI change immediately
      // The query will automatically refetch due to React Query's cache invalidation
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to add member');
    },
  });

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    searchQuery,
    { enabled: searchQuery.length > 0 } as any
  );

  useEffect(() => {
    if (groupData) {
      setGroup(groupData);
    }
  }, [groupData]);

  useEffect(() => {
    if (groupError) {
      setError(groupError.message || 'Failed to load group details');
    }
  }, [groupError]);

  const handleDeleteGroup = () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      if (groupId) {
        deleteGroupMutation.mutate(groupId);
      }
    }
  };

  const handleRemoveMember = (userId: number) => {
    if (window.confirm('Are you sure you want to remove this member from the group?')) {
      if (groupId) {
        removeMemberMutation.mutate(userId);
      }
    }
  };

  const handleClose = () => {
    setError('');
    setSearchQuery('');
    setShowAddUser(false);
    // Don't reset group immediately to maintain state
    onClose();
  };

  const handleAddUser = (user: User) => {
    if (groupId) {
      addMemberMutation.mutate({ user_id: user.id });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter out users who are already members of the group
  const filteredSearchResults = searchResults?.filter(user => 
    !group?.members?.some(member => member.user_id === user.id)
  ) || [];

  // Only reset group when groupId changes (different group selected)
  React.useEffect(() => {
    if (groupId && groupData && (!group || group.id !== groupData.id)) {
      setGroup(groupData);
    }
  }, [groupId, groupData, group]);

  if (isLoading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box className="flex justify-center items-center py-8">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!group) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Failed to load group details
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <Box>
          <Typography variant="h5" className="font-semibold">
            {group.name}
          </Typography>
          {group.description && (
            <Typography variant="body2" className="text-gray-600 mt-1">
              {group.description}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box className="mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Chip
              icon={<People />}
              label={`${group.members?.length || 0} Members`}
              color="primary"
              variant="outlined"
            />
            <Typography variant="caption" className="text-gray-500">
              Created {new Date(group.created_at).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider className="my-4" />

          <Typography variant="h6" className="font-semibold mb-3">
            Group Members
          </Typography>
          
          {group.members && group.members.length > 0 ? (
            <List>
              {group.members.map((member: GroupMember, index: number) => (
                <React.Fragment key={member.id}>
                  <ListItem className="px-0">
                    <ListItemAvatar>
                      <Avatar>
                        {member.user.full_name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.user.full_name || member.user.email}
                      secondary={member.user.email}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="text-red-600"
                      disabled={removeMemberMutation.isPending}
                    >
                      <PersonRemove />
                    </IconButton>
                  </ListItem>
                  {index < group.members.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" className="text-gray-500">
              No members in this group yet.
            </Typography>
          )}
        </Box>

        {/* Add User Section */}
        <Box className="mb-6">
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="h6" className="font-semibold">
              Add Members
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => setShowAddUser(!showAddUser)}
              size="small"
            >
              {showAddUser ? 'Cancel' : 'Add User'}
            </Button>
          </Box>

          {showAddUser && (
            <Paper className="p-4">
              <TextField
                fullWidth
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                className="mb-3"
              />

              {searchQuery.length > 0 && (
                <Box>
                  {isSearching ? (
                    <Box className="flex justify-center py-4">
                      <CircularProgress size={24} />
                    </Box>
                  ) : filteredSearchResults.length > 0 ? (
                    <List>
                      {filteredSearchResults.map((user: User, index: number) => (
                        <React.Fragment key={user.id}>
                          <ListItem className="px-0">
                            <ListItemAvatar>
                              <Avatar>
                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={user.full_name || user.email}
                              secondary={user.email}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleAddUser(user)}
                              disabled={addMemberMutation.isPending}
                              startIcon={<PersonAdd />}
                            >
                              Add
                            </Button>
                          </ListItem>
                          {index < filteredSearchResults.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" className="text-gray-500 text-center py-4">
                      No users found matching "{searchQuery}"
                    </Typography>
                  )}
                </Box>
              )}

              {searchQuery.length === 0 && (
                <Typography variant="body2" className="text-gray-500 text-center py-4">
                  Start typing to search for users...
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="justify-between">
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit && onEdit(group)}
            className="mr-2"
          >
            Edit Group
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteGroup}
            disabled={deleteGroupMutation.isPending}
          >
            Delete Group
          </Button>
        </Box>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDetailModal;
