import React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform, Text } from "react-native";
import { GiftedChat, Bubble, SystemMessage as GiftedChatSystemMessage, Day, Message, MessageText } from "react-native-gifted-chat";
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
            name: data.user.displayName, 
          }
        };
      });
      setMessages(messages);
    });

    return unsubscribe;
  }, []);

  const onSend = (newMessages) => {
    console.log(user)
    addDoc(collection(db, "messages"), {
      ...newMessages[0],
      user: {
        _id: user.uid,
        name: user.displayName, 
      },
    });
  };
// const renderBubble = (props) => {
//     return (
//         <View>
//             <Text style={{ color: props.currentMessage.user._id === user.uid ? '#FFF' : '#000' }}>
//                 {props.currentMessage.user.name}
//             </Text>
//             <Bubble
//                 {...props}
//                 wrapperStyle={{
//                     right: {
//                         backgroundColor: "#000",
//                         borderColor: '#FFF',
//                         borderWidth: 2,
//                     },
//                     left: {
//                         backgroundColor: "#FFF",
//                         borderColor: '#000',
//                         borderWidth: 2,
//                     },
//                 }}
//             />
//         </View>
//     );
// };

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
          // renderBubble={renderBubble}
          renderSystemMessage={renderSystemMessage}
          renderUsernameOnMessage={true}
          renderDay={renderDay}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: user.uid,
            name: name,
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
