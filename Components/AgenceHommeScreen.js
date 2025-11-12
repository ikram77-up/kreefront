// Components/AgenceHomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AgenceHomeScreen() {
    const [propositions, setPropositions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPropositions = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch("http://192.168.1.108:8080/price/client", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setPropositions(data);
            } catch (error) {
                console.error("Erreur récupération propositions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPropositions();
    }, []);

    const handleAccept = async (proposalId) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`http://192.168.1.108:8080/price/accept/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "accepted" }),
            });

            const data = await response.json();
            alert(data.message || "Proposition acceptée !");
        } catch (error) {
            console.error("Erreur acceptation:", error);
        }
    };

    if (loading)
        return <ActivityIndicator style={{ flex: 1 }}
            size="large"
            color="blue" />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Propositions reçues</Text>

            <FlatList
                data={propositions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.model}>Voiture: {item.car?.modelCar || "Inconnue"}</Text>
                        <Text>Client: {item.client?.user?.email || "—"}</Text>
                        <Text>Prix proposé: {item.proposedPrice} MAD</Text>
                        <Text>Status: {item.status}</Text>

                        {item.status === "pending" && (
                            <TouchableOpacity style={styles.button} onPress={() => handleAccept(item._id)}>
                                <Text style={styles.buttonText}> Accepter</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 10 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    card: {
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    model: { fontWeight: "bold", fontSize: 16 },
    button: {
        backgroundColor: "#000000",
        borderColor: "#ff6300",
        marginTop: 8,
        padding: 8,
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        textAlign: "center"
    },
});
