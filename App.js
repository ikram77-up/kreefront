import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
// import Home from './Components/home';
// import AuthScreen from './Components/AuthScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './navigation/appNavigator';
import { initSocket } from './utils/Socket';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialiser le socket seulement une fois au démarrage de l'app
    initSocket().catch((error) => {
      console.error("Erreur lors de l'initialisation du socket:", error);
    });

    // Nettoyer lors du démontage
    return () => {
      // Ne pas déconnecter ici car le socket doit rester actif pendant toute la vie de l'app
      // La déconnexion se fera automatiquement si nécessaire
    };
  }, []);

  return (
    <View style={styles.container}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
