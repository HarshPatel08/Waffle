import { useState, useEffect } from 'react';

type User = {
  _id: string;
  name: string;
  email: string;
  emoji: string;
};
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { WaffleColors } from '@/constants/theme';

export default function NewGroupScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  // Fetch all users for selection
  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
      });
  }, []);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGroup = async () => {
    console.log('[NewGroup] handleCreateGroup called', { currentUser, groupName, selectedUserIds });
    if (!currentUser) {
      console.log('[NewGroup] No currentUser, returning');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('[NewGroup] Calling createInvitation...');
      const res = await api.createInvitation(
        currentUser.id,
        groupName,
        selectedUserIds
      );
      console.log('[NewGroup] Response:', res);

      if (res.success) {
        // Navigate directly instead of relying on Alert callback (doesn't work on web)
        router.replace('/(tabs)');
      } else {
        setError(res.message || 'Failed to send invitations');
      }
    } catch (err) {
      console.error('[NewGroup] Error:', err);
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Members:</Text>
      <ScrollView style={{ maxHeight: 180, width: '100%', marginBottom: 16 }}>
        {users
          .filter((user) => user._id !== currentUser?.id)
          .map((user) => (
            <TouchableOpacity
              key={user._id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                backgroundColor: selectedUserIds.includes(user._id)
                  ? WaffleColors.yellow
                  : WaffleColors.parchment,
                borderRadius: 8,
                marginBottom: 6,
              }}
              onPress={() => toggleUser(user._id)}
            >
              <Text style={{ fontSize: 20, marginRight: 8 }}>{user.emoji}</Text>
              <Text style={{ fontWeight: '500' }}>{user.name}</Text>
              <Text style={{ color: WaffleColors.charcoal, marginLeft: 8, fontSize: 12 }}>{user.email}</Text>
              {selectedUserIds.includes(user._id) && (
                <Text style={{ marginLeft: 'auto', color: WaffleColors.carbonBlack }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateGroup}
        disabled={loading || !groupName || selectedUserIds.length === 0}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Group'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WaffleColors.white,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: WaffleColors.carbonBlack,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: WaffleColors.dustGrey,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: WaffleColors.parchment,
  },
  button: {
    backgroundColor: WaffleColors.yellow,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    fontWeight: 'bold',
    color: WaffleColors.carbonBlack,
    fontSize: 16,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: WaffleColors.charcoal,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});
