import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();

  async function onSignIn() {
    try {
      await auth.signIn(email, password);
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message || String(e));
    }
  }

  async function onSignUp() {
    try {
      await auth.signUp(email, password);
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message || String(e));
    }
  }

  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:16}}>
      <Text style={{fontSize:20,fontWeight:'600',marginBottom:8}}>Sign in / Sign up</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={{width:'100%',borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8}} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{width:'100%',borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8}} />
      <Button title="Sign in" onPress={onSignIn} />
      <View style={{height:10}} />
      <Button title="Sign up" onPress={onSignUp} />
    </View>
  );
}
