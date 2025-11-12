import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../Components/home";
import AuthScreen from "../Components/AuthScreen";
import ClientHomeScreen from "../Components/ClientHomeScreen.js";
import ClientInterface from "../Components/clientInterface.js";
import AgenceHomeScreen from "../Components/AgenceHommeScreen.js";
import AgenceInterface from "../Components/agenceInterface";
import ChooseEspace from "../Components/chooseEspace";
import ClientOffersScreen from "../Components/ClientOffersScreen.js";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="AuthScreen" component={AuthScreen} />
                <Stack.Screen name="chooseEspace" component={ChooseEspace} />
                <Stack.Screen name="ClientHomeScreen" component={ClientHomeScreen} />
                <Stack.Screen name="AgenceHomeScreen" component={AgenceHomeScreen} />
                <Stack.Screen name="clientInterface" component={ClientInterface} />
                <Stack.Screen name="ClientOffersScreen" component={ClientOffersScreen} />
                <Stack.Screen name="agenceInterface" component={AgenceInterface} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}