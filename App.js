// IMPORT STATEMENTS
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { initializeApp, setLoglevel } from "firebase/app";
import {
	disableNetwork,
	enableNetwork,
	getFirestore,
} from "firebase/firestore";
import {
	FIREBASE_API_KEY,
	FIREBASE_AUTH_DOMAIN,
	FIREBASE_PROJECT_ID,
	FIREBASE_STORAGE_BUCKET,
	FIREBASE_MESSAGING_SENDER_ID,
	FIREBASE_APP_ID,
	FIREBASE_MEASUREMENT_ID,
} from "@env";
import { useNetInfo } from "@react-native-community/netinfo";
import { Alert, LogBox } from "react-native";
import { getStorage } from "firebase/storage";

// IGNORE WARNINGS
// Ignore warnings related to AsyncStorage and persistent storage
LogBox.ignoreLogs(["Async Storage has been extracted from"]);
LogBox.ignoreLogs([
  "@firebase/auth: Auth",
  "You are initializing Firebase Auth for React Native without providing AsyncStorage."
]);


// NAVIGATION STACK
  // Create a navigation stack for the app. This stack will contain two screens: Start and Chat. As the user navigates through the app, the appropriate screen will be displayed.
const Stack = createNativeStackNavigator();

// MAIN APP
const App = () => {
	// FIREBASE CONFIG (OBFUSCATED FOR SECURITY)
    // Firebase configuration object with values from the .env file
	const firebaseConfig = {
		apiKey: FIREBASE_API_KEY,
		authDomain: FIREBASE_AUTH_DOMAIN,
		projectId: FIREBASE_PROJECT_ID,
		storageBucket: FIREBASE_STORAGE_BUCKET,
		messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
		appId: FIREBASE_APP_ID,
		measurementId: FIREBASE_MEASUREMENT_ID,
	};

	// INITIALIZE FIREBASE
    // Initialize Firebase with the configuration
	const app = initializeApp(firebaseConfig);
	const db = getFirestore(app);
  const storage = getStorage(app);

	// CHECK CONNECTIVITY
    // Check the network status using the useNetInfo hook from the @react-native-community/netinfo package. This hook returns an object with information about the network connection status.
	const connectionStatus = useNetInfo();

  // HANDLE NETWORK STATUS CHANGES
    // Use the useEffect hook to listen for changes in the network connection status. When the connection status changes, check if the app is connected to the internet. If the app is not connected, display an alert to inform the user that sending messages is unavailable. If the app is connected, enable the network connection in the Firestore database.
	useEffect(() => {
		if (connectionStatus.isConnected === false) {
			Alert.alert(
				"No Internet Connection",
				"Sending messages is unavailable."
			);
			disableNetwork(db);
		} else if (connectionStatus.isConnected === true) {
			enableNetwork(db);
		}
	}, [connectionStatus.isConnected]);

  // RENDER
    // Render the NavigationContainer component from @react-navigation/native. This component wraps the navigation stack and provides the navigation context for the app. The Stack.Navigator component defines the navigation stack with two screens: Start and Chat. The Chat screen is passed the connection status, Firestore database, and user information as props.
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Start">
				<Stack.Screen
					name="Start"
					component={Start}
				/>
				<Stack.Screen name="Chat">
					{(props) => (
						<Chat
							isConnected={connectionStatus.isConnected}
							db={db}
              storage={storage}
							{...props}
						/>
					)}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

// EXPORT
export default App;
