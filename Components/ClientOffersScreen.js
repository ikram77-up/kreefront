// Components/ClientHomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ClientHomeScreen({ navigation }) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch("http://192.168.1.108:8080/car", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();
                setCars(data);
            } catch (error) {
                console.error("Erreur récupération voitures:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="blue" />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Voitures disponibles  </Text>

            <FlatList
                data={cars}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.details}>
                            <Text style={styles.model}>{item.modelCar}</Text>
                            <Text>{item.brand}</Text>
                            <Text>{item.fuelType} | {item.gearBox}</Text>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.navigate("ClientOffersScreen",
                                    { carId: item._id })}
                            >
                                <Text style={styles.buttonText}>consulter details</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    card: {
        flexDirection: "row",
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        marginBottom: 10,
        overflow: "hidden",
    },
    image: { width: 120, height: 100 },
    details: { flex: 1, padding: 10 },
    model: { fontSize: 16, fontWeight: "bold" },
    button: {
        backgroundColor: "#ff6300",
        marginTop: 5,
        padding: 8,
        borderRadius: 6,
    },
    buttonText: { color: "#fff", textAlign: "center" },
});
