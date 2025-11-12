import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ClientHomeScreen({ navigation }) {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    setErrorMsg("Token introuvable. Connectez-vous.");
                    setLoading(false);
                    return;
                }

                const res = await fetch("http://192.168.1.108:8080/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                const profile = data?.profile ?? data?.user ?? data ?? {};
                setUserProfile({
                    name: profile?.user?.name || profile?.name || "Client",
                    email: profile?.user?.email || profile?.email || null,
                    phone: profile?.user?.phone || profile?.phone || null,
                    pictureUrl:
                        profile?.pictureUrl ||
                        profile?.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                });
            } catch (err) {
                console.log("Erreur récupération profil:", err);
                setErrorMsg("Impossible de charger le profil");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <LinearGradient
            colors={["#ff7b00", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {/* AVATAR + DETAILS (clic pour afficher) */}
                <TouchableOpacity
                    style={styles.profileCard}
                    activeOpacity={0.8}
                    onPress={() => setShowDetails((prev) => !prev)}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : (
                        <>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={{ uri: userProfile?.pictureUrl }}
                                    style={styles.profileImage}
                                />
                                <View style={styles.editIcon}>
                                    <Ionicons name="person" size={18} color="#fff" />
                                </View>
                            </View>

                            {showDetails && (
                                <View style={styles.profileInfo}>
                                    <Text style={styles.profileName}>
                                        {userProfile?.name}
                                    </Text>
                                    {userProfile?.email && (
                                        <Text style={styles.profileEmail}>
                                            {userProfile.email}
                                        </Text>
                                    )}
                                    {userProfile?.phone && (
                                        <Text style={styles.profilePhone}>
                                            📞 {userProfile.phone}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </TouchableOpacity>

                {/* BOUTONS */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("clientInterface")}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>choose your prise</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("ClientOffersScreen")}
                    >
                        <Ionicons name="car-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>consult available car</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("ClientOffersScreen")}
                    >
                        <Ionicons name="list-outline" size={20} color="#fff" />
                        <Text style={styles.buttonText}>my price choices</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: {
        alignItems: "center",
        padding: 20,
        paddingBottom: 60,
    },
    profileCard: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 11,
        marginVertical: 28,
        width: "100%",
    },
    avatarWrapper: {
        position: "relative",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#ff7b00",
    },
    editIcon: {
        position: "absolute",
        bottom: 6,
        right: 8,
        backgroundColor: "#ff7b00",
        borderRadius: 14,
        padding: 5,
        borderWidth: 2,
        borderColor: "#000",
    },
    profileInfo: {
        alignItems: "center",
        marginTop: 12,
    },
    profileName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    profileEmail: {
        fontSize: 14,
        color: "#eee",
        marginTop: 6,
    },
    profilePhone: {
        fontSize: 14,
        color: "#ddd",
        marginTop: 4,
    },
    buttonsContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 12,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff6300",
        borderColor: "#000",
        borderWidth: 2,
        borderRadius: 30,
        width: "85%",
        paddingVertical: 14,
        marginBottom: 14,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 10,
        textTransform: "uppercase",
    },
    errorText: {
        color: "#ffd700",
        marginTop: 8,
        textAlign: "center",
    },
});
