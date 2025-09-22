'use client';

import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function Start() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        router.replace('/(tabs)');
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    try {
      // ✅ call login-profile instead of login
      const res = await axios.post(
        'https://frischly-server.onrender.com/api/auth/login-profile',
        { 
          email,
          password,
        }
      );

      console.log('Login response', res.data.data.token);
      

      if (res.data) {
        // ✅ save token and user info
        await AsyncStorage.setItem('userData', JSON.stringify(res.data.data));
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Login error', error.response?.data || error.message);
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const inputBg = colorScheme === 'dark' ? '#1f2937' : '#ffffff';
  const inputText = colorScheme === 'dark' ? '#ffffff' : '#000000';
  const placeholderColor = colorScheme === 'dark' ? '#ccc' : '#999';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top 40% yellow background */}
        <View
          style={{
            height: screenHeight * 0.4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffc300',
            borderBottomLeftRadius: 60,
            borderBottomRightRadius: 60,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{
              uri: 'https://res.cloudinary.com/dtzuor7no/image/upload/v1757763354/logo1z_phciva.webp',
            }}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>

        {/* Bottom 60% content */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            backgroundColor: '#ffffff',
          }}
        >
          {/* Email input */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              width: '100%',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 12,
              backgroundColor: inputBg,
            }}
          >
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={{
                flex: 1,
                padding: 15,
                color: inputText,
              }}
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
            />
          </View>

          {/* Password input with eye icon */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
              width: '100%',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 12,
              backgroundColor: inputBg,
            }}
          >
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                padding: 15,
                color: inputText,
              }}
              placeholderTextColor={placeholderColor}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ paddingHorizontal: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={placeholderColor}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#ffc300',
              borderRadius: 15,
              paddingVertical: 15,
              width: '100%',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={{ color: '#000', fontSize: 16 }}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem('guest', 'true'); // 👈 mark as guest
              router.replace('/(tabs)');
            }}
          >
            <Text style={{ color: '#000', fontSize: 16 }}>Continue as guest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
