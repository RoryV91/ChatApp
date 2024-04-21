// IMPORT STATEMENTS
import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Image, TouchableOpacity, Text } from "react-native";
import {
	GiftedChat,
	Bubble,
	SystemMessage as GiftedChatSystemMessage,
	Day,
	InputToolbar,
} from "react-native-gifted-chat";
import {
	collection,
	query,
	onSnapshot,
	orderBy,
	addDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomActions from "./CustomActions";
import MapView, { Marker } from "react-native-maps";

// COMPONENT
  // The Chat component handles the main chat functionality. It fetches messages from Firebase Firestore,caches them for offline use, and sends new messages to the database. It also renders the chat interface, including custom components for system messages, days, bubbles, the input toolbar, and custom actions.
const Chat = ({ route, navigation, db, isConnected, storage }) => {
	const { user, name, backgroundColor, textColor } = route.params;
	const [messages, setMessages] = useState([]);

// 'unsubscribe' is a variable holding a function that will stop listening for updates to a Firestore collection when called. It's declared outside of useEffect to be accessible in the cleanup function.
let unsubscribe;

	// FETCH MESSAGES ON CONNECTION OR LOAD CACHED MESSAGES
	useEffect(() => {
    
    // SET NAVIGATION TITLE
    navigation.setOptions({ title: name });
    // ADD WELCOME MESSAGE
    addWelcomeMessage();
		
    // FETCH MESSAGES IF CONNECTED, OTHERWISE LOAD CACHED MESSAGES
    if (isConnected === true) {
			if (unsubscribe) unsubscribe();
			unsubscribe = null;
			unsubscribe = fetchMessages();
		} else {
			loadCachedMessages();
		}
    
    // CLEAN UP
      // Cleanup function to be called when the component unmounts or before the effect runs again. If the 'unsubscribe' function exists, it's called to stop listening for updates to the Firestore collection.
		return () => {
			if (unsubscribe) {
				unsubscribe();
      }
		};
	}, [isConnected, name]);

	// FETCH MESSAGES
    // This function fetches messages from Firebase Firestore and updates the local state with the fetched messages.
    // It also caches the fetched messages for offline use. The messages are ordered by their creation date in descending order.
	const fetchMessages = () => {
		const messagesRef = collection(db, "messages");
		const q = query(messagesRef, orderBy("createdAt", "desc"));
		return onSnapshot(q, (snapshot) => {
			const messages = snapshot.docs.map((doc) => {
				const data = doc.data();
				const id = doc.id;
				let message = {
					_id: id,
					text: data.text,
					createdAt: data.createdAt.toDate(),
					user: {
						_id: data.user._id,
						name: data.user.name,
					},
				};
				if (data.location) {
					message.location = {
						latitude: data.location.latitude,
						longitude: data.location.longitude,
					};
				}
				if (data.image) {
					message.image = data.image;
				}
				return message;
			});
			setMessages(messages);
			cacheMessages(messages);
		});
	};

  // CACHE MESSAGES
    // This function caches the given messages in AsyncStorage for offline use.
    // If an error occurs while caching the messages, it logs the error message.
	const cacheMessages = async (messagesToCache) => {
		try {
			await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
		} catch (error) {
			console.log(error.message);
		}
	};

	// LOAD CACHED MESSAGES
    // This function loads cached messages from AsyncStorage and updates the local state with the loaded messages.
    // If an error occurs while loading the messages, it logs the error message.
	const loadCachedMessages = async () => {
		try {
			const cachedMessages = await AsyncStorage.getItem("messages");
			if (cachedMessages !== null) {
				setMessages(JSON.parse(cachedMessages));
			}
		} catch (error) {
			console.error(error.message);
		}
	};

	// SEND MESSAGE
    // This function sends new messages to Firebase Firestore. Each message is added to the "messages" collection in the database.
    // If the message includes a location or an image, these are also included in the document that is added to the database.
	const onSend = (newMessages = []) => {
		newMessages.forEach((message) => {
			if (message.location) {
				message.location = {
					latitude: message.location.latitude,
					longitude: message.location.longitude,
				};
			}
			if (message.image) {
				message.image = message.image;
			}
      if (message.audio) {
        message.audio = message.audio;
      }
			addDoc(collection(db, "messages"), {
				...message,
				user: {
					_id: user.uid,
					name: user.displayName,
				},
			});
		});
	};

	// ADD WELCOME MESSAGE
    // This function adds a welcome message to the chat when a new user joins. The welcome message is added to Firebase Firestore and is displayed as a system message. The function also stores the user's name in AsyncStorage to prevent the welcome message from being displayed again if the user leaves and re-joins the chat.
	const addWelcomeMessage = async () => {
		const storedName = await AsyncStorage.getItem("storedName");
		if (user.displayName === storedName) {
			return;
		}
		const messagesRef = collection(db, "messages");
		const welcomeMessage = {
			text: `${user.displayName} has entered the chat. Welcome 👋`,
			createdAt: new Date(),
			system: true,
			user: {
				_id: "system",
				name: "System",
			},
		};
		await addDoc(messagesRef, welcomeMessage);

		await AsyncStorage.setItem("storedName", user.displayName);
	};

	// RENDER CUSTOM COMPONENTS
    // These functions render custom components for various parts of the chat interface. They customize the appearance of system messages, days, bubbles, the input toolbar, and custom actions. They also render custom views for messages that include a location or an image.
	const renderSystemMessage = (props) => (
		<GiftedChatSystemMessage
			{...props}
			textStyle={{ ...props.textStyle, color: textColor }}
		/>
	);

  // RENDER DAY
    // This function renders the day component of the chat interface. It customizes the text color of the day component for legibility.
	const renderDay = (props) => (
		<Day
			{...props}
			textStyle={{ color: textColor }}
		/>
	);

  // RENDER BUBBLE
    // This function renders the bubble component of the chat interface. It customizes the appearance of the bubble, including the background color and the text color. It also renders the username on the message bubble.
	const renderBubble = (props) => {
		return (
			<Bubble
				{...props}
				renderUsernameOnMessage={true}
			/>
		);
	};

  // RENDER INPUT TOOLBAR
    // This function renders the input toolbar component of the chat interface. It customizes the appearance of the input toolbar, including the background color and the border color.
	const renderInputToolbar = (props) => {
		if (isConnected) {
			return (
				<InputToolbar
					{...props}
					containerStyle={{
						backgroundColor: backgroundColor,
						borderTopColor: textColor,
						backgroundColor: "white",
						marginBottom: 0,
					}}
				/>
			);
		} else {
			return null;
		}
	};

  // RENDER CUSTOM ACTIONS
    // This function renders the custom actions component of the chat interface. It provides options for the user to take actions such as sending an image, taking a photo, or sharing their location.
	const renderCustomActions = (props) => {
		return (
			<CustomActions
				storage={storage}
				{...props}
			/>
		);
	};

  // RENDER CUSTOM VIEWS
    // This function renders custom views for messages that include a location or an image. It displays a map view for messages with a location and an image for messages with an image.
	const renderCustomViews = (props) => {
		const { currentMessage } = props;
		if (currentMessage.location) {
			return (
				<View style={styles.mapViewWrapper}>
					<MapView
						style={styles.mapView}
						region={{
							latitude: currentMessage.location.latitude,
							longitude: currentMessage.location.longitude,
							latitudeDelta: 0.0922,
							longitudeDelta: 0.0421,
						}}
					>
						<Marker
							coordinate={{
								latitude: currentMessage.location.latitude,
								longitude: currentMessage.location.longitude,
							}}
						/>
					</MapView>
				</View>
			);
		}
		return null;
	};

  // RENDER MESSAGE IMAGE
    // This function renders an image for messages that include an image. It displays the image in a custom image component.
	const renderMessageImage = (props) => {
		const { currentMessage } = props;
		if (currentMessage.image) {
			return (
				<Image
					style={styles.image}
					source={{ uri: currentMessage.image }}
				/>
			);
		}
		return null;
	};

	 // RENDER
    // This function renders the main chat interface. It uses the GiftedChat component from the react-native-gifted-chat library, and passes the custom render functions as props to customize the appearance of the chat. It also passes the onSend function as a prop to handle sending new messages.
	return (
    // SAFE AREA VIEW
		  // This component ensures that the chat interface is displayed within the safe area of the device screen, taking into account any notches or system bars that may overlap the content. It applies the background color of the chat screen to the container. The edges prop specifies which edges of the screen should be affected by the safe area insets.
		<SafeAreaView
			style={[styles.container, { backgroundColor }]}
			edges={["right", "bottom", "left"]}
		>
      {/* 
        // KEYBOARD AVOIDING VIEW
          // This component ensures that the chat interface is displayed correctly when the keyboard is open. It adjusts the position of the chat interface to avoid overlapping with the keyboard. The style prop applies the container styles to the component. 
      */}
			<KeyboardAvoidingView style={styles.container}>
        {/* 
          // GIFTED CHAT
            // This component renders the chat interface, displaying messages and providing an input toolbar. It uses custom components for rendering messages, system messages, days, the input toolbar, actions, and messages with a location or an image. It also handles sending new messages.
        */}
				<GiftedChat
					messages={messages}
					renderBubble={renderBubble}
					renderSystemMessage={renderSystemMessage}
					renderUsernameOnMessage={true}
					renderDay={renderDay}
					renderInputToolbar={renderInputToolbar}
					renderActions={renderCustomActions}
					renderCustomView={renderCustomViews}
					renderMessageImage={renderMessageImage}
					onSend={(messages) => onSend(messages)}
					user={{
						_id: user.uid,
						name: user.name,
					}}
					alwaysShowSend={true}
					accessible={true}
					accessibilityLabel="Chat interface"
					accessibilityHint="Use this to chat with other users"
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

// STYLES
  // This stylesheet defines the styles for the Chat component. It includes styles for the container, the map view, and the image view.
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	mapView: {
		width: 150,
		height: 100,
	},
	mapViewWrapper: {
		borderRadius: 12,
		margin: 3,
		overflow: "hidden",
	},
	image: {
		width: 150,
		height: 100,
		borderRadius: 12,
		margin: 3,
	},
});

// EXPORT
export default Chat;
