import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, Platform
} from 'react-native';
import { useAuth } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;


const OfferCard = ({ offer, onAction }) => {
    const carDetails = offer.carId;
    const agencyName = offer.agenceId?.name || "Agence Inconnue";

    return (
        <View style={styles.card}>
            <View style={styles.priceBox}>
                <Text style={styles.priceValue}>{offer.offrePrice} MAD</Text>
                <Text style={styles.priceLabel}>Prix Proposé</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.agencyName}>Par: {agencyName}</Text>
                <Text style={styles.carModel}>Voiture: {carDetails?.brand} {carDetails?.modelCar}</Text>
                <Text style={styles.carDetails}>{carDetails?.fuelType} / {carDetails?.gearBox} / {carDetails?.seats} places</Text>
                <Text style={styles.message}>Message: {offer.message}</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => onAction(offer._id, 'rejected')}
                >
                    <FontAwesome5 name="times" size={14} color="#666" style={{ marginRight: 5 }} />
                    <Text style={styles.rejectText}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => onAction(offer._id, 'accepted')}
                >
                    <FontAwesome5 name="check" size={14} color="#000" style={{ marginRight: 5 }} />
                    <Text style={styles.acceptText}>Accepter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function ClientOffersScreen({ navigation }) {
    const { user, token } = useAuth();
    const { socket } = useSocket();

    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/offres/client`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOffers(data.filter(o => o.status === 'pending'));
            } else {
                const err = await response.json();
                Alert.alert("Erreur", err.message || "Impossible de charger les offres.");
            }
        } catch (e) {
            console.error("Erreur chargement offres:", e);
            Alert.alert("Erreur", "Problème de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers(); 

        if (!socket) return;

        socket.on('new_offer_received', (newOffer) => {
            Alert.alert("Nouvelle Offre", `Vous avez reçu une offre pour ${newOffer.carId?.modelCar}`);

            if (newOffer.status === 'pending') {
                setOffers(prev => [newOffer, ...prev]);
            }
        });

        return () => { socket.off('new_offer_received'); };
    }, [socket]);


    //  Accepter ou Refuser offre
    const handleOfferAction = async (offerId, status) => {
        const url = `${API_URL}/offres/answer`; 

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    offreId: offerId,
                    status: status // 'accepted' ou 'rejected'
                })
            });

            if (response.ok) {
                const d = await response.json();

                // Mettre à jour la liste d'offres
                setOffers(prev => prev.filter(o => o._id !== offerId));

                if (status === 'accepted') {
                    Alert.alert("Félicitations!", `Réservation confirmée. L'agence ${d.offre.agenceId?.name || "a été"} notifiée.`);
                } else {
                    Alert.alert("Refusé", "L'offre a été rejetée.");
                }

            } else {
                const d = await response.json();
                Alert.alert("Erreur", d.message || "Impossible de traiter l'offre.");
            }
        } catch (e) {
            Alert.alert("Erreur", "Problème réseau lors de la mise à jour.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Vos Offres ({offers.length})</Text>
                <TouchableOpacity onPress={fetchOffers}>
                    <FontAwesome5 name="sync-alt" size={20} color="#ff7b00" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#ff7b00" style={styles.loadingSpinner} />
            ) : (
                <FlatList
                    data={offers}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <OfferCard offer={item} onAction={handleOfferAction} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="inbox" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>En attente de réponses d'agences...</Text>
                        </View>
                    }
                    contentContainerStyle={styles.flatlistContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    loadingSpinner: { marginTop: 50 },
    flatlistContent: { paddingHorizontal: 15, paddingBottom: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#888', fontSize: 16 },

    card: {
        backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, padding: 15,
        borderWidth: 1, borderColor: '#ff7b00', position: 'relative'
    },
    priceBox: {
        backgroundColor: '#ff7b00', padding: 8, borderRadius: 8,
        position: 'absolute', top: 0, right: 0, alignItems: 'center'
    },
    priceValue: { color: '#000', fontWeight: 'bold', fontSize: 18 },
    priceLabel: { color: '#000', fontSize: 10 },

    details: { marginBottom: 15, marginTop: 10 },
    agencyName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    carModel: { fontSize: 14, color: '#555', marginTop: 5, fontWeight: 'bold' },
    carDetails: { fontSize: 12, color: '#666' },
    message: { fontSize: 14, color: '#000', marginTop: 10, fontStyle: 'italic' },

    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    rejectBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#eee', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc'
    },
    rejectText: { color: '#666', fontWeight: 'bold', marginLeft: 5 },
    acceptBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#ff7b00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20
    },
    acceptText: { color: '#000', fontWeight: 'bold', marginLeft: 5 }
});