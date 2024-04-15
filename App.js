// IMPORT STATEMENTS
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { initializeApp } from "firebase/app";
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

// IGNORE WARNINGS
LogBox.ignoreLogs(["Async Storage has been extracted from"]);

// NAVIGATION STACK
const Stack = createNativeStackNavigator();

// MAIN APP
const App = () => {
	// FIREBASE CONFIG (OBFUSCATED FOR SECURITY)
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
	const app = initializeApp(firebaseConfig);
	const db = getFirestore(app);

	// CHECK CONNECTIVITY
	const connectionStatus = useNetInfo();

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
