import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { GiftedChat, Bubble, SystemMessage as GiftedChatSystemMessage, Day } from "react-native-gifted-chat";
import { collection, query, onSnapshot, orderBy, addDoc } from "firebase/firestore";

const Chat = ({ route, navigation, db }) => {
const { user, name, backgroundColor, textColor } = route.params;
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		navigation.setOptions({ title: name });
	}, []);

  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
          }
        };
      });
      setMessages(messages);
    });

    return unsubscribe;
  }, []);

  const onSend = (newMessages) => {
    console.log(user)
    console.log(newMessages[0])
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
      textStyle={{...props.textStyle, color: textColor}}
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
          renderUsernameOnMessage={true}
          renderDay={renderDay}
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
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default Chat;
