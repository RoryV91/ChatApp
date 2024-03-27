import React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView } from 'react-native';
import {SvgXml} from 'react-native-svg';
import iconSvg from '../assets/icon.js';


const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedButton, setSelectedButton] = useState(null);

  const handleColorSelection = (color, index) => {
    setSelectedColor(color);
    setSelectedButton(index);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
    <ImageBackground source={require('../assets/Background-Image.png')} style={styles.imageBackground}>
      <Text style={styles.title}>Chat App</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
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
            placeholder='Your Name'
            placeholderTextColor="#757083"
          />
        </View>
        <View style={styles.colorOptionsContainer}>
        <Text style={styles.colorPrompt}>Choose Background Color:</Text>
        <View style={styles.colorOptions}>
          <View style={selectedColor === '#090C08' ? styles.selectedColorOption : null}>
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: '#090C08' }
              ]}
              onPress={() => handleColorSelection('#090C08')}
            />
          </View>
          <View style={selectedButton === 1 ? styles.selectedColorOption : null}>
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: '#474056' }
              ]}
              onPress={() => handleColorSelection('#474056', 1)}
            />
          </View>
          <View style={selectedButton === 2 ? styles.selectedColorOption : null}>
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: '#8A95A5' }
              ]}
              onPress={() => handleColorSelection('#8A95A5', 2)}
            />
          </View>
          <View style={selectedButton === 3 ? styles.selectedColorOption : null}>
            <TouchableOpacity
              style={[
                styles.colorOption,
                { backgroundColor: '#B9C6AE' }
              ]}
              onPress={() => handleColorSelection('#B9C6AE', 3)}
            />
          </View>
        </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Chat', { name: name, backgroundColor: selectedColor })}
        >
          <Text style={styles.buttonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "space-between",
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: '15%', 
  },
  inputIconContainer: {
    position: 'fixed',
    width: '100%', 
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  inputContainer: {
    justifyContent: 'space-between',
    alignItems: 'left',
    height: '44%',
    width: '88%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: '10%',
  },
  namePrompt: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 0.5,
    borderWidth: 2, 
    borderColor: '#757083',
    padding: 15,
    paddingLeft: 40,
  },
  colorPrompt: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    textAlign: 'left',
    marginBottom: 5,
  },
  colorOptionsContainer: {
    justifyContent: 'center',
  },
  colorOptions: {
    position: 'fixed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingTop: 10,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#757083',
    borderRadius: 30,
    padding: 5,
  },
  button: {
    position: 'fixed',
    backgroundColor: '#757083',
    width: '100%',
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Start;