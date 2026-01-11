import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { WaffleColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Invitation = {
    _id: string;
    sender: {
        _id: string;
        name: string;
        emoji: string;
    };
    groupName: string;
    createdAt: string;
};

export default function RequestsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchInvitations = async () => {
        if (!user) return;
        try {
            const res = await api.getPendingInvitations(user.id);
            if (res.success && res.invitations) {
                setInvitations(res.invitations);
            }
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, [user]);

    const handleResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
        if (!user) return;
        setProcessingId(invitationId);
        try {
            const res = await api.respondToInvitation(invitationId, user.id, response);
            if (res.success) {
                Alert.alert('Success', `Invitation ${response}`);
                // Remove from list
                setInvitations(prev => prev.filter(inv => inv._id !== invitationId));

                if (response === 'accepted') {
                    // Verify if we should navigate or just refresh
                    // Maybe go to the new group? For now just stay here.
                }
            } else {
                Alert.alert('Error', res.message || 'Failed to respond');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setProcessingId(null);
        }
    };

    const renderItem = ({ item }: { item: Invitation }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.emoji}>{item.sender.emoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.invitationText}>
                        <Text style={{ fontWeight: 'bold' }}>{item.sender.name}</Text> invited you to join
                    </Text>
                    <Text style={styles.groupName}>{item.groupName}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.declineButton]}
                    onPress={() => handleResponse(item._id, 'declined')}
                    disabled={!!processingId}
                >
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleResponse(item._id, 'accepted')}
                    disabled={!!processingId}
                >
                    {processingId === item._id ? (
                        <ActivityIndicator color={WaffleColors.carbonBlack} size="small" />
                    ) : (
                        <Text style={styles.acceptText}>Accept</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                    <Ionicons name="arrow-back" size={24} color={WaffleColors.carbonBlack} />
                </TouchableOpacity>
                <Text style={styles.title}>Group Invitations</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={WaffleColors.yellow} style={{ marginTop: 20 }} />
            ) : invitations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No pending invitations</Text>
                    <Text style={{ fontSize: 40, marginTop: 16 }}>📭</Text>
                </View>
            ) : (
                <FlatList
                    data={invitations}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshing={loading}
                    onRefresh={fetchInvitations}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: WaffleColors.white,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: WaffleColors.dustGrey,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: WaffleColors.carbonBlack,
    },
    card: {
        backgroundColor: WaffleColors.parchment,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: WaffleColors.dustGrey,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
    },
    invitationText: {
        fontSize: 16,
        color: WaffleColors.charcoal,
        marginBottom: 4,
    },
    groupName: {
        fontSize: 20,
        fontWeight: '800',
        color: WaffleColors.carbonBlack,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: WaffleColors.yellow,
    },
    declineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: WaffleColors.dustGrey,
    },
    acceptText: {
        fontWeight: 'bold',
        color: WaffleColors.carbonBlack,
    },
    declineText: {
        color: WaffleColors.charcoal,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
    },
    emptyText: {
        fontSize: 18,
        color: WaffleColors.charcoal,
    },
});
