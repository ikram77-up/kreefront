import io from "socket.io-client";
import { Alert, Platform } from "react-native";
import { getToken } from "../Context/AuthContext";
import jwtDecode from "jwt-decode";

// URL Socket.IO - Essayez d'abord sans /notifications, puis avec si nécessaire
const SOCKET_URL = "http://192.168.1.108:8080";
// Si votre backend utilise un namespace spécifique, utilisez:
// const SOCKET_URL = "http://192.168.1.108:8080/notifications";

const parseJwt = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
};

let socket = null;
let isInitializing = false;

export const initSocket = async () => {
    // Si le socket existe déjà et est connecté, le retourner
    if (socket && socket.connected) {
        console.log("Socket déjà connecté");
        return socket;
    }

    // Si une initialisation est en cours, attendre
    if (isInitializing) {
        console.log("Initialisation en cours...");
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (socket && socket.connected) {
                    clearInterval(checkInterval);
                    resolve(socket);
                }
            }, 100);
        });
    }

    isInitializing = true;

    try {
        // Options de connexion Socket.IO
        const socketOptions = {
            transports: ["websocket", "polling"], // Essayer websocket puis polling
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000,
        };

        console.log("Tentative de connexion Socket.IO à:", SOCKET_URL);
        socket = io(SOCKET_URL, socketOptions);

        // Gestion des événements de connexion
        socket.on("connect", async () => {
            console.log("✅ Socket connecté :", socket.id);
            isInitializing = false;

            // Récupérer le token et s'enregistrer
            try {
                const token = await getToken();
                if (token) {
                    const decoded = parseJwt(token);
                    if (decoded) {
                        const userId = decoded.userId || decoded.id || decoded._id;
                        if (userId) {
                            console.log("Enregistrement avec userId:", userId);
                            socket.emit("register", userId);
                        } else {
                            console.warn("Aucun userId trouvé dans le token");
                        }
                    }
                } else {
                    console.warn("Aucun token trouvé");
                }
            } catch (error) {
                console.error("Erreur lors de l'enregistrement:", error);
            }
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Erreur de connexion Socket.IO:", error.message);
            isInitializing = false;

            // Ne pas afficher d'alerte sur web pour éviter les erreurs MIME
            if (Platform.OS !== 'web') {
                Alert.alert(
                    "Erreur de connexion",
                    "Impossible de se connecter au serveur. Vérifiez votre connexion."
                );
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket déconnecté :", reason);
            isInitializing = false;
        });

        socket.on("error", (error) => {
            console.error("Erreur Socket.IO:", error);
            isInitializing = false;
        });

        // Écouter les notifications (seulement dans App.js pour éviter les doublons)
        socket.on("notification", (notif) => {
            console.log("📨 Notification reçue:", notif);
            if (Platform.OS !== 'web') {
                Alert.alert(notif.title || "Notification", notif.message || "Nouvelle notification");
            }
        });

    } catch (error) {
        console.error("Erreur lors de l'initialisation du socket:", error);
        isInitializing = false;
        socket = null;
    }

    return socket;
};

export const getSocket = () => {
    if (socket && socket.connected) {
        return socket;
    }
    return null;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        isInitializing = false;
        console.log("Socket déconnecté et nettoyé");
    }
};

// Fonction pour réinitialiser le socket (utile après login)
export const reconnectSocket = async () => {
    console.log("Réinitialisation du socket...");
    disconnectSocket();

    // Attendre un peu avant de reconnecter
    await new Promise(resolve => setTimeout(resolve, 500));

    const newSocket = await initSocket();

    // Attendre que le socket soit connecté
    if (newSocket && !newSocket.connected) {
        return new Promise((resolve) => {
            newSocket.once("connect", () => {
                console.log("Socket reconnecté après login");
                resolve(newSocket);
            });

            // Timeout après 10 secondes
            setTimeout(() => {
                console.warn("Timeout lors de la reconnexion du socket");
                resolve(newSocket);
            }, 10000);
        });
    }

    return newSocket;
};

// Fonction pour s'enregistrer manuellement avec un token (utile si le socket est déjà connecté)
export const registerSocketWithToken = async () => {
    if (!socket || !socket.connected) {
        console.warn("Socket non connecté, tentative de connexion...");
        await initSocket();
        return;
    }

    try {
        const token = await getToken();
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                const userId = decoded.userId || decoded.id || decoded._id;
                if (userId) {
                    console.log("Enregistrement manuel avec userId:", userId);
                    socket.emit("register", userId);
                } else {
                    console.warn("Aucun userId trouvé dans le token décodé:", decoded);
                }
            }
        } else {
            console.warn("Aucun token trouvé pour l'enregistrement");
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement manuel:", error);
    }
};
