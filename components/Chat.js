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
import { Audio } from "expo-av";

// COMPONENT
const Chat = ({ route, navigation, db, isConnected, storage }) => {
	const { user, name, backgroundColor, textColor } = route.params;
	const [messages, setMessages] = useState([]);
	let soundObject = null;

	// MUST BE DECLARED OUTSIDE OF USEEFFECT
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
		return () => {
			if (unsubscribe) {
				unsubscribe();
      }
      if (soundObject) {
        soundObject.unloadAsync();
      }
		};
	}, [isConnected, name]);

	// FETCH MESSAGES
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
	const cacheMessages = async (messagesToCache) => {
		try {
			await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
		} catch (error) {
			console.log(error.message);
		}
	};

	// LOAD CACHED MESSAGES
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
	const renderSystemMessage = (props) => (
		<GiftedChatSystemMessage
			{...props}
			textStyle={{ ...props.textStyle, color: textColor }}
		/>
	);

	const renderDay = (props) => (
		<Day
			{...props}
			textStyle={{ color: textColor }}
		/>
	);

	const renderBubble = (props) => {

		return (
			<Bubble
				{...props}
				renderUsernameOnMessage={true}
			/>
		);
	};

	const renderAudioBubble = (props) => {
		return (
			<View {...props}>
				<TouchableOpacity
					style={{ backgroundColor: "#FF0", borderRadius: 10, margin: 5 }}
					onPress={async () => {
						if (soundObject) soundObject.unloadAsync();
						const { sound } = await Audio.Sound.createAsync({
							uri: props.currentMessage.audio,
						});
						soundObject = sound;
						await sound.playAsync();
					}}
				>
					<Text style={{ textAlign: "center", color: "black", padding: 5 }}>
						Play Sound
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

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

	const renderCustomActions = (props) => {
		return (
			<CustomActions
				storage={storage}
				{...props}
			/>
		);
	};

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
	return (
		// THIS KEEPS THE SWIPE INDICATOR ON iOS FROM COVERING THE INPUT
		<SafeAreaView
			style={[styles.container, { backgroundColor }]}
			edges={["right", "bottom", "left"]}
		>
			<KeyboardAvoidingView style={styles.container}>
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
          renderMessageAudio={renderAudioBubble}
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
