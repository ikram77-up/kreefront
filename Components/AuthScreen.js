import React, { useState, useEffect } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import { storeToken } from '../Context/AuthContext';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen({ navigation }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [name, setName] = useState('');
    const [cin, setCin] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pictureUrl, setPictureUrl] = useState(null);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
        androidClientId: "TA_CLIENT_ID_ANDROID",
        webClientId: "847757431275-qh1g4vsvjehof83gvupktmp5snlcc3nd.apps.googleusercontent.com",
        iosClientId: "TA_CLIENT_ID_IOS",
    });

    const [fbRequest, fbResponse, promptFacebook] = Facebook.useAuthRequest({
        clientId: 'YOUR_CLIENT_ID',
    });

    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            const credential = GoogleAuthProvider.credential(authentication.idToken);
            signInWithCredential(auth, credential)
                .then(() => navigation.navigate('chooseEspace'))
                .catch(err => Alert.alert('Error', 'Google sign-in failed'));
        }
    }, [googleResponse]);

    // Fonction pour choisir une image depuis la galerie
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Accès à la galerie refusé !');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) setPictureUrl(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        const url = isLogin
            ? 'http://192.168.1.108:8080/user/login'
            : 'http://192.168.1.108:8080/user/register';

        if (isLogin) {
            // LOGIN
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    if (data.token) await storeToken(data.token);
                    const userRole = data.user?.role;
                    if (userRole === 'client') navigation.navigate('ClientHomeScreen');
                    else if (userRole === 'agency') navigation.navigate('AgenceHomeScreen');
                    else navigation.navigate('chooseEspace');
                } else Alert.alert('Error', data.message || 'Login failed');
            } catch (err) {
                Alert.alert('Error', 'Login failed');
            }
        } else {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);

            if (role === 'client') {
                formData.append('cin', cin);
                formData.append('phone', phoneNumber);
                if (pictureUrl) {
                    const filename = pictureUrl.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image';
                    formData.append('pictureUrl', { uri: pictureUrl, name: filename, type });
                }

            } else if (role === 'agency') {
                formData.append('address', address);
                formData.append('city', city);
                formData.append('phone', phoneNumber);
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    if (data.token) await storeToken(data.token);
                    Alert.alert('Success', 'Registration successful');
                    if (role === 'client') navigation.navigate('ClientHomeScreen');
                    else if (role === 'agency') navigation.navigate('AgenceHomeScreen');
                } else {
                    Alert.alert('Error', data.message || 'Registration failed');
                }
            } catch (err) {
                console.log(err);
                Alert.alert('Error', 'Registration failed');
            }
        }
    };

    return (
        <LinearGradient colors={["#ff7b00", "#000000"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.container}>
            <View style={styles.container}>
                <Image source={require('../assets/logo-kree.png')} style={styles.logo} />
                <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>

                {!isLogin && (
                    <>
                        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 15 }}>
                            {['client', 'agency'].map(r => (
                                <TouchableOpacity key={r} onPress={() => setRole(r)} style={{
                                    backgroundColor: role === r ? '#ff6300' : '#fff',
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#000',
                                    marginHorizontal: 5,
                                }}>
                                    <Text style={{ color: role === r ? '#fff' : '#000', fontWeight: 'bold' }}>
                                        {r === 'client' ? 'Client' : 'Agence'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {role === 'client' && (
                            <>
                                <TextInput placeholder="CIN" value={cin} onChangeText={setCin} style={styles.input} />
                                <TextInput placeholder="Téléphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
                                <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                                    <Text style={{ color: '#fff', textAlign: 'center' }}>Choisir une photo</Text>
                                </TouchableOpacity>
                                {pictureUrl && <Image source={{ uri: pictureUrl }} style={styles.previewImage} />}
                            </>
                        )}

                        {role === 'agency' && (
                            <>
                                <TextInput placeholder="Adresse" value={address} onChangeText={setAddress} style={styles.input} />
                                <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={styles.input} />
                                <TextInput placeholder="Téléphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
                            </>
                        )}
                    </>
                )}

                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

                <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitText}>{isLogin ? 'Login' : 'Register'}</Text>
                </TouchableOpacity>

                {/* Google / Facebook Buttons */}
                <TouchableOpacity style={[styles.socialBtn, styles.google]} onPress={() => promptGoogle()}>
                    <Image source={require('../assets/google.png')} style={styles.icon} />
                    <Text
                        style={[styles.socialText, { color: '#000' }]}>Continue with Google
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialBtn, styles.facebook]}
                    onPress={() => promptFacebook()}>
                    <Image source={require('../assets/facebook.png')} style={styles.icon} />
                    <Text style={styles.socialText}>Continue with Facebook</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    logo: {
        alignSelf: 'center',
        width: 120,
        height: 60,
        marginBottom: 30,
        marginTop: 20
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        backgroundColor: '#fff'
    },
    submitBtn: {
        backgroundColor: '#ff6300',
        padding: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#000',
        marginTop: 20
    },
    submitText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold'
    },
    switchBtn: { marginTop: 10 },
    switchText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 3
    },
    google: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    facebook: { backgroundColor: '#4b18f2ff' },
    icon: {
        width: 15,
        height: 11,
        marginRight: 10
    },
    socialText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    imagePickerBtn: {
        backgroundColor: '#ff6300',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginTop: 10
    },
});