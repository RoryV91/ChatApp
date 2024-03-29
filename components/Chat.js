import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { GiftedChat, Bubble, SystemMessage as GiftedChatSystemMessage, Day } from "react-native-gifted-chat";

const Chat = ({ route, navigation }) => {
	const { name, backgroundColor, textColor } = route.params;
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		navigation.setOptions({ title: name });
	}, []);

	useEffect(() => {
		setMessages([
			{
				_id: 1,
				text: `Hello ${name}! Welcome to the chatroom. Say hi to everyone! 👋`,
				createdAt: new Date(),
				user: {
					_id: 2,
					name: "React Native",
					avatar: "https://pngimg.com/uploads/server/server_PNG58.png",
				},
			},
			{
				_id: 2,
				text: `Weclome to the chatroom, ${name}. Please be respectful.`,
				createdAt: new Date(),
				system: true,
			},
		]);
	}, []);

	const onSend = (newMessages) => {
		setMessages((previousMessages) =>
			GiftedChat.append(previousMessages, newMessages)
		);
	};

	const renderBubble = (props) => {
		return (
			<Bubble
				{...props}
				wrapperStyle={{
					right: {
						backgroundColor: "#000",
            borderColor: '#FFF',
            borderWidth: 2,
					},
					left: {
						backgroundColor: "#FFF",
            borderColor: '#000',
            borderWidth: 2,
					},
				}}
			/>
		);
	};

  const renderSystemMessage = (props) => (
    <GiftedChatSystemMessage
      {...props}
      textStyle={{...props.textStyle, color: textColor}}
    />
  );

  const renderDay = (props) => (
    <Day
      {...props}
      textStyle={{ color: textColor }} 
    />
  );

	return (
		<View style={[styles.container, { backgroundColor }]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "android" ? "height" : null }
        keyboardVerticalOffset={Platform.OS === "android" ? -500 : 0}
				style={styles.container}
			>
        <GiftedChat
          messages={messages}
          renderBubble={renderBubble}
          renderSystemMessage={renderSystemMessage}
          renderDay={renderDay}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
          accessible={true}
          accessibilityLabel="Chat interface"
          accessibilityHint="Use this to chat with other users"
        />
			</KeyboardAvoidingView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default Chat;
