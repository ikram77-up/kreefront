import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform
} from 'react-native';
import { useAuth } from '../Context/AuthContext';
import { useSocket } from '../Context/SocketContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RequestCard = ({ item, onAccept, onReject }) => {
    const calculateTimeLeft = () => {
        const deadline = new Date(item.expiresAt);
        return Math.max(0, deadline - new Date());
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [item]);

    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    if (timeLeft <= 0) return null;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name="user-circle" size={20} color="#ccc" />
                    <Text style={styles.clientName}>{item.userId?.name || "Client"}</Text>
                </View>
                <Text style={styles.priceText}>{item.priceMax} MAD</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.carTitle}>{item.modelofCar}</Text>
                <View style={styles.row}>
                    <Text style={styles.detail}>{new Date(item.startDate).toLocaleDateString()}</Text>
                    <Text style={styles.detail}> {item.pickupLocation}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name="clock" size={14} color="#ff7b00" />
                    <Text style={styles.timer}>{minutes}:{seconds < 10 ? '0' : ''}{seconds}</Text>
                </View>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item)}>
                    <Text style={styles.btnText}>FAIRE UNE OFFRE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function AgenceHomeScreen({ navigation }) {
    const { user, token } = useAuth();
    const { socket } = useSocket();
    const [requests, setRequests] = useState([]);
    const [myCars, setMyCars] = useState([]);

    // États Modale
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [offerPrice, setOfferPrice] = useState('');
    const [selectedCar, setSelectedCar] = useState('');
    const [message, setMessage] = useState('Disponible.');
    const [isSending, setIsSending] = useState(false);

    const fetchMyCars = async () => {
        try {
            const response = await fetch(`${API_URL}/car`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                const myAgencyCars = data.filter(c => c.userId?._id === user._id || c.userId === user._id);
                setMyCars(myAgencyCars);
            }
        } catch (error) { console.log("Erreur chargement voitures", error); }
    };

    useEffect(() => {
        fetchMyCars(); // pour charger Cars au demarrage f home agency

        // Focus Listener : Recharger si on revient de "My Cars"
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyCars();
        });
        return unsubscribe;
    }, [navigation]);

    // utiliosation de les Sockets
    useEffect(() => {
        if (!socket) return;
        socket.emit('registerAgency', user._id);
        socket.on('new_price_request', (newRequest) => {
            setRequests(prev => [newRequest, ...prev]);
        });
        return () => { socket.off('new_price_request'); };
    }, [socket]);

    const handleAccept = (request) => {
        setSelectedRequest(request);
        setOfferPrice(String(request.priceMax));
        setModalVisible(true);
    };

    const sendOffer = async () => {
        if (!selectedCar) {
            Alert.alert("Error", "Please choose a car from your garage.");
            return;
        }
        setIsSending(true);
        try {
            const response = await fetch(`${API_URL}/offres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    carId: selectedCar,
                    nameyourpriceId: selectedRequest._id,
                    offrePrice: parseFloat(offerPrice),
                    message: message
                })
            });
            if (response.ok) {
                Alert.alert("Succès", "send offre !");
                setModalVisible(false);
                setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
            } else {
                Alert.alert("Erreur", "Echec d'envoi");
            }
        } catch (e) { Alert.alert("Erreur", "Réseau"); }
        setIsSending(false);
    };

    return (
        <View style={styles.container}>
            {/* HEADER AVEC BOUTON My Cars */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('ProfileScreen')}>
                    <FontAwesome5 name="user-circle" size={28} color="#ff7b00" />
                </TouchableOpacity>

                {/* LE BOUTON MES VOITURES */}
                <TouchableOpacity style={styles.garageBtn} onPress={() => navigation.navigate('MyCarsScreen')}>
                    <FontAwesome5 name="car" size={16} color="#fff" />
                    <Text style={styles.garageText}>My Cars</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <FontAwesome5 name="bell" size={24} color="#ff6300" />
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Request custumer ({requests.length})</Text>

            <FlatList
                data={requests}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <RequestCard item={item} onAccept={handleAccept} onReject={() => { }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{ color: '#888' }}>En attente de demandes...</Text>
                        <ActivityIndicator color="#ff7b00" style={{ marginTop: 10 }} />
                    </View>
                }
            />

            {/* MODALE OFFRE AVEC PICKER VOITURE */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Faire une Offre</Text>

                        <Text style={styles.label}>Choisir Voiture :</Text>
                        <View style={styles.pickerBox}>
                            <Picker selectedValue={selectedCar} onValueChange={setSelectedCar}>
                                <Picker.Item label="-- Sélectionner --" value="" />
                                {/*  BOUCLE SUR VOS VOITURES */}
                                {myCars.map(car => (
                                    <Picker.Item key={car._id} label={`${car.brand} ${car.modelCar}`} value={car._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Prix (MAD) :</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={offerPrice} onChangeText={setOfferPrice} />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text>Annuler</Text></TouchableOpacity>
                            <TouchableOpacity onPress={sendOffer} style={styles.confirmBtn}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Envoyer</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, marginBottom: 20 },

    garageBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000',
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ff7b00'
    },
    garageText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },

    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    emptyState: { marginTop: 50, alignItems: 'center' },


    card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    clientName: { fontWeight: 'bold', marginLeft: 5 },
    priceText: { color: '#ff7b00', fontWeight: 'bold' },
    cardBody: { marginBottom: 10 },
    carTitle: { fontSize: 16, fontWeight: 'bold' },
    row: { flexDirection: 'row', gap: 10, marginTop: 5 },
    detail: { color: '#666', fontSize: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timer: { color: 'red', fontWeight: 'bold', marginLeft: 5 },
    acceptBtn: { backgroundColor: '#ff7b00', padding: 10, borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },


    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ff7b00', textAlign: 'center', marginBottom: 15 },
    label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
    pickerBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { padding: 15 },
    confirmBtn: { backgroundColor: '#ff7b00', padding: 15, borderRadius: 8 }
});