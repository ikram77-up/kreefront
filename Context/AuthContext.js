import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem('token', token);
    } catch (e) {
        console.log(e);
    }
};

export const getToken = async () => {
    try {
        const value = await AsyncStorage.getItem("token");
        if (value !== null) {
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};