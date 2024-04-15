import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
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
import { SafeAreaView } from 'react-native-safe-area-context';

const Chat = ({ route, navigation, db, isConnected }) => {
	const { user, name, backgroundColor, textColor } = route.params;
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		navigation.setOptions({ title: name });
	}, [name]);

	let unsubscribe;

	useEffect(() => {
		if (isConnected === true) {
			if (unsubscribe) unsubscribe();
			unsubscribe = null;
			unsubscribe = fetchMessages();
		} else {
			loadCachedMessages();
		}

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [isConnected]);

	const fetchMessages = () => {
		const messagesRef = collection(db, "messages");
		const q = query(messagesRef, orderBy("createdAt", "desc"));
		return onSnapshot(q, (snapshot) => {
			const messages = snapshot.docs.map((doc) => {
				const data = doc.data();
				const id = doc.id;
				return {
					_id: id,
					text: data.text,
					createdAt: data.createdAt.toDate(),
					user: {
						_id: data.user._id,
						name: data.user.name,
					},
				};
			});
			setMessages(messages);
			cacheMessages(messages);
		});
	};

	const cacheMessages = async (messagesToCache) => {
		try {
			await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
		} catch (error) {
			console.log(error.message);
		}
	};

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

	const onSend = (newMessages) => {
		addDoc(collection(db, "messages"), {
			...newMessages[0],
			user: {
				_id: user.uid,
				name: user.displayName,
			},
		});
	};

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

const renderInputToolbar = (props) => {
  if (isConnected) {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: backgroundColor,
          borderTopColor: textColor,
          backgroundColor: 'white',
          marginBottom: 0,
        }}
      />
    );
  } else {
    return null;
  }
};

	return (
		<SafeAreaView 
      style={[styles.container, { backgroundColor }]}
      edges={["right", "bottom", "left"]}
      >
			
      <KeyboardAvoidingView
				style={styles.container}
			>
				<GiftedChat
					messages={messages}
					renderBubble={renderBubble}
					renderSystemMessage={renderSystemMessage}
					renderUsernameOnMessage={true}
					renderDay={renderDay}
          renderInputToolbar={renderInputToolbar}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default Chat;
