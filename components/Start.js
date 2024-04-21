// IMPORT STATEMENTS
import React from "react";
import { useState } from "react";
import {
	Platform,
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ImageBackground,
	KeyboardAvoidingView,
	Alert,
} from "react-native";
import { SvgXml } from "react-native-svg";
import iconSvg from "../assets/icon.js";
import backgroundImage from "../assets/Background-Image.png";
import { getAuth, signInAnonymously, updateProfile } from "firebase/auth";

// COMPONENT
	// Start component for the chat app that allows users to enter their name and select a background color
const Start = ({ navigation }) => {
	const [name, setName] = useState("");
	// COLOR OPTIONS
		// Array of color options for the user to choose from
	const colorOptions = [
		{ color: "#090C08", id: 0, textColor: "#FFF" },
		{ color: "#474056", id: 1, textColor: "#FFF" },
		{ color: "#8A95A5", id: 2, textColor: "#000" },
		{ color: "#B9C6AE", id: 3, textColor: "#000" },
	];

	// SELECT RANDOM COLOR ON START
		// Randomly select a color from the colorOptions array, rather than always starting with the first color
	const randomIndex = Math.floor(Math.random() * colorOptions.length);
	const [selectedColor, setSelectedColor] = useState(colorOptions[randomIndex].color);
	const [textColor, setTextColor] = useState(colorOptions[randomIndex].textColor);
	const [selectedButton, setSelectedButton] = useState(colorOptions[randomIndex].id);

	// HANDLE USER SELECTION OF COLOR
		// Function to handle the user's selection of a color
	const handleColorSelection = (color, index, textColor) => {
		setSelectedColor(color);
		setSelectedButton(index);
		setTextColor(textColor);
	};
	
	// ANONYMOUS SIGN-IN
		// Function to sign in anonymously and navigate to the chat screen
	const handleSignIn = async () => {
		const auth = getAuth();
		try {
			const userCredential = await signInAnonymously(auth);
			if (userCredential) {
				const user = userCredential.user;
				await updateProfile(user, { displayName: name });
				navigation.navigate("Chat", {
					user: {
						uid: user.uid,
						displayName: user.displayName,						
					},
					name: name,
					backgroundColor: selectedColor,
					textColor: textColor,
				});
			} else {
				Alert.alert("No user credential returned");
			}
		} catch (error) {
			Alert.alert(error.message);
		}
	};

	// RENDER
		// Render the Start component with a background image, title, input fields, color options, and a button to start chatting
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			{/* 
				Background Image for the Start component
			*/}
			<ImageBackground
				source={backgroundImage}
				style={styles.imageBackground}
			>
				<Text style={styles.title}>Chat App</Text>
				<View style={styles.inputContainer}>
					<View style={styles.inputIconContainer}>
						{/*
							SVG Icon for the Start component input field
						*/}
						<SvgXml
							style={styles.inputIcon}
							width="20"
							height="20"
							xml={iconSvg}
						/>
						<TextInput
							style={styles.namePrompt}
							value={name}
							onChangeText={setName}
							placeholder="Your Name"
							placeholderTextColor="#757083"
							accessible={true}
							accessibilityLabel="Name input field"
							accessibilityHint="Enter your name here"
							maxLength={32}
						/>
					</View>
					<View style={styles.colorOptionsContainer}>
						<Text style={styles.colorPrompt}>Choose Background Color:</Text>
						<View style={styles.colorOptions}>
							{colorOptions.map((option) => (
								<View
									key={option.id}
									style={
										selectedButton === option.id
											? styles.selectedColorOption
											: null
									}
								>
									<TouchableOpacity
										style={[
											styles.colorOption,
											{ backgroundColor: option.color },
										]}
										onPress={() =>
											handleColorSelection(
												option.color,
												option.id,
												option.textColor
											)
										}
										accessible={true}
										accessibilityLabel={`Color option ${option.id}`}
										accessibilityHint="Select this to change the background color"
									/>
								</View>
							))}
						</View>
					</View>
					<TouchableOpacity
						style={styles.button}
						onPress={handleSignIn}
						accessible={true}
						accessibilityLabel="Start chatting button"
						accessibilityHint="Press this to start chatting"
					>
						<Text style={styles.buttonText}>Start Chatting</Text>
					</TouchableOpacity>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
};

// STYLES
	// Styles for the Start component
const styles = StyleSheet.create({
	imageBackground: {
		flex: 1,
		resizeMode: "cover",
		justifyContent: "space-between",
		alignItems: "center",
	},
	container: {
		flex: 1,
	},
	title: {
		fontSize: 45,
		fontWeight: "600",
		color: "#FFFFFF",
		marginTop: "15%",
	},
	inputIconContainer: {
		position: "fixed",
		width: "100%",
	},
	inputIcon: {
		position: "absolute",
		left: 10,
		top: "50%",
		transform: [{ translateY: -10 }],
	},
	inputContainer: {
		justifyContent: "space-between",
		alignItems: "left",
		height: "44%",
		width: "88%",
		backgroundColor: "#FFFFFF",
		padding: 20,
		marginBottom: "10%",
	},
	namePrompt: {
		fontSize: 16,
		fontWeight: "300",
		color: "#757083",
		opacity: 0.5,
		borderWidth: 2,
		borderColor: "#757083",
		padding: 15,
		paddingLeft: 40,
	},
	colorPrompt: {
		fontSize: 16,
		fontWeight: "300",
		color: "#757083",
		textAlign: "left",
		marginBottom: 5,
	},
	colorOptionsContainer: {
		justifyContent: "center",
	},
	colorOptions: {
		position: "fixed",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "80%",
		marginTop: 10,
		marginBottom: 10,
	},
	colorOption: {
		width: 40,
		height: 40,
		borderRadius: 25,
		borderWidth: 2,
		borderColor: "transparent",
		paddingTop: 10,
	},
	selectedColorOption: {
		borderWidth: 2,
		borderColor: "#757083",
		borderRadius: 30,
		padding: 5,
	},
	button: {
		position: "fixed",
		backgroundColor: "#757083",
		width: "100%",
		padding: 15,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
		textAlign: "center",
	},
});

// EXPORT
export default Start;
