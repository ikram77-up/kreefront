// Components/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../Context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }) {
    //  récupèrer toutes les infos stockées lors du Login
    const { user, profile, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Disconnect",
            "Do you really want to disconnect? ?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => logout() }
            ]
        );
    };

    return (
        <LinearGradient
            colors={["#ff7b00ff", "#000000ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <View style={styles.container}>
                {/* Header simple */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <FontAwesome5 name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My profil</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        <LinearGradient colors={['#ff7b00', '#000000']} style={styles.avatarCircle}>
                            <FontAwesome5 name="user" size={50} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userRole}>{user?.role === 'client' ? 'Client' : 'Agence'}</Text>
                    </View>

                    {/* Informations */}
                    <View style={styles.infoSection}>
                        <InfoItem icon="envelope" label="Email" value={user?.email} />
                        <InfoItem icon="phone" label="phone" value={profile?.phoneNumber || 'Non renseigné'} />

                        {/* Affichage CIN seulement si c'est un client */}
                        {user?.role === 'client' && (
                            <InfoItem icon="id-card" label="CIN" value={profile?.cin || 'Non renseigné'} />
                        )}

                        {/* Affichage Adresse seulement si c'est une agence */}
                        {user?.role === 'agency' && (
                            <>
                                <InfoItem icon="map-marker-alt" label="Adress" value={profile?.address} />
                                <InfoItem icon="city" label="Ville" value={profile?.city} />
                            </>
                        )}
                    </View>

                    {/* Bouton Déconnexion */}
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Disconnect</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </LinearGradient>
    );
}


const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
        <View style={styles.iconBox}>
            <FontAwesome5 name={icon} size={18} color="#ff7b00" />
        </View>
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,

    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    content: { padding: 20 },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 10,
        shadowColor: '#ff7b00',
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    userRole: {
        color: '#aaa',
        fontSize: 16,
        textTransform: 'capitalize'
    },
    infoSection: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        gap: 10
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 40, height: 40,
        backgroundColor: '#000000',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoLabel: {
        color: '#ffffffa6',
        fontSize: 12
    },
    infoValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    logoutBtn: {
        backgroundColor: '#ff6300',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000000'
    },
    logoutText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold'
    }
});