import React, { useState } from "react";
import { getToken } from "../Context/AuthContext";
import ClientOffersScreen from "./ClientOffersScreen";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";

export default function ClientFormScreen({ navigation }) {
    const [form, setForm] = useState({
        fullName: "",
        cin: null, // now an image
        picture: null,
        phoneNumber: "",
        model: "",
        color: "",
        gearbox: "",
        fuelType: "",
        seats: "",
        priceMin: "",
        priceMax: "",
        startDate: null,
        endDate: null,
        pickupLocation: "",
        returnLocation: "",
        features: [],
    });

    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

    const featuresList = ["GPS", "Bluetooth", "Camera", "Climatiseur"];

    // Import image (used for CIN and picture)
    const pickImage = async (key) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) {
            setForm({ ...form, [key]: result.assets[0].uri });
        }
    };

    const toggleFeature = (feature) => {
        setForm((prev) => {
            const features = prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature];
            return { ...prev, features };
        });
    };

    // Submit form
    const handleSubmit = async () => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "You must be logged in to submit a request.");
                return;
            }
            const response = await fetch("http:192.168.1.108:8080/price", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {

                Alert.alert("Success", "Your request has been sent!");
                navigation.navigate("ClientOffersScreen");
            } else {
                Alert.alert("Error", "Failed to submit form.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An error occurred while submitting.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Choose Your Price</Text>

            {/* --- Personal Info --- */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
            />

            {/* --- CIN (Upload) --- */}
            <Text style={styles.label}>CIN (Upload)</Text>
            <TextInput
                style={styles.input}
                value={form.cin}
                onChangeText={(t) => setForm({ ...form, cin: t })}
            />
            <TouchableOpacity style={styles.button} onPress={() => pickImage("cin")}>
                <Text style={styles.buttonText}>
                    {form.cin ? "Change CIN Image" : "Upload CIN Image"}
                </Text>
            </TouchableOpacity>
            {form.cin && (
                <Image
                    source={{ uri: form.cin }}
                    style={styles.previewImage}
                />
            )}

            {/* --- Picture (Profile) --- */}
            <Text style={styles.label}>Picture</Text>
            <TouchableOpacity style={styles.button} onPress={() => pickImage("picture")}>
                <Text style={styles.buttonText}>
                    {form.picture ? "Change Picture" : "Upload Picture"}
                </Text>
            </TouchableOpacity>
            {form.picture && (
                <Image
                    source={{ uri: form.picture }}
                    style={styles.previewImage}
                />
            )}

            {/* --- Phone --- */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={form.phoneNumber}
                onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
            />

            {/* --- Vehicle Info --- */}
            <Text style={styles.label}>Model</Text>
            <TextInput
                style={styles.input}
                value={form.model}
                onChangeText={(t) => setForm({ ...form, model: t })}
            />

            <Text style={styles.label}>Color</Text>
            <TextInput
                style={styles.input}
                value={form.color}
                onChangeText={(t) => setForm({ ...form, color: t })}
            />

            <Text style={styles.label}>Gearbox</Text>
            <Picker
                selectedValue={form.gearbox}
                onValueChange={(v) => setForm({ ...form, gearbox: v })}
                style={styles.picker}
            >
                <Picker.Item label="Select gearbox" value="" />
                <Picker.Item label="Manual" value="Manual" />
                <Picker.Item label="Automatic" value="Automatic" />
            </Picker>

            <Text style={styles.label}>Fuel Type</Text>
            <Picker
                selectedValue={form.fuelType}
                onValueChange={(v) => setForm({ ...form, fuelType: v })}
                style={styles.picker}
            >
                <Picker.Item label="Select fuel type" value="" />
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="Gasoline" value="Gasoline" />
                <Picker.Item label="Hybrid" value="Hybrid" />
                <Picker.Item label="Electric" value="Electric" />
            </Picker>

            <Text style={styles.label}>Seats</Text>
            <Picker
                selectedValue={form.seats}
                onValueChange={(v) => setForm({ ...form, seats: v })}
                style={styles.picker}
            >
                <Picker.Item label="Select seats" value="" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" />
                <Picker.Item label="7" value="7" />
                <Picker.Item label="10" value="10" />
            </Picker>

            {/* --- Price Range --- */}
            <Text style={styles.label}>Price Range (MAD)</Text>
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={form.priceMin}
                    onChangeText={(t) => setForm({ ...form, priceMin: t })}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={form.priceMax}
                    onChangeText={(t) => setForm({ ...form, priceMax: t })}
                />
            </View>
            {form.priceMin && form.priceMax ? (
                <Text style={styles.priceText}>
                    Price range: {form.priceMin} – {form.priceMax} MAD
                </Text>
            ) : null}

            {/* --- Dates --- */}
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setStartDatePickerVisibility(true)}
            >
                <Text style={styles.buttonText}>
                    {form.startDate ? form.startDate.toLocaleDateString() : "Select Start Date"}
                </Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    setStartDatePickerVisibility(false);
                    setForm({ ...form, startDate: date });
                }}
                onCancel={() => setStartDatePickerVisibility(false)}
            />

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setEndDatePickerVisibility(true)}
            >
                <Text style={styles.buttonText}>
                    {form.endDate ? form.endDate.toLocaleDateString() : "Select End Date"}
                </Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    setEndDatePickerVisibility(false);
                    setForm({ ...form, endDate: date });
                }}
                onCancel={() => setEndDatePickerVisibility(false)}
            />

            {/* --- Locations --- */}
            <Text style={styles.label}>Pickup Location</Text>
            <TextInput
                style={styles.input}
                value={form.pickupLocation}
                onChangeText={(t) => setForm({ ...form, pickupLocation: t })}
            />

            <Text style={styles.label}>Return Location</Text>
            <TextInput
                style={styles.input}
                value={form.returnLocation}
                onChangeText={(t) => setForm({ ...form, returnLocation: t })}
            />

            {/* --- Features --- */}
            <Text style={styles.label}>Features</Text>
            <View style={styles.featuresContainer}>
                {featuresList.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.featureButton,
                            form.features.includes(f) && styles.featureSelected,
                        ]}
                        onPress={() => toggleFeature(f)}
                    >
                        <Text style={{ color: form.features.includes(f) ? "#fff" : "#333" }}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --- Submit --- */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <Text style={styles.resultText}>send your form</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
    label: { fontWeight: "600", marginTop: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    picker: { marginTop: 5 },
    row: { flexDirection: "row", alignItems: "center" },
    priceText: { color: "#ff6300", marginTop: 5 },
    button: {
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 5,
    },
    buttonText: { color: "#000000" },
    previewImage: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
    featuresContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 5,
    },
    featureButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    featureSelected: {
        backgroundColor: "#FF6300",
        borderColor: "#000000",
    },
    submitButton: {
        backgroundColor: "#ff6300",
        padding: 15,
        borderRadius: 10,
        borderColor: "#000000",
        marginTop: 20,
        alignItems: "center",
        marginBottom: 20,
    },
    submitText: { color: "#fff", fontWeight: "bold" },
});
