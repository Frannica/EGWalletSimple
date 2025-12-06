import React from 'react';
import { View, Text, Button } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:20,fontWeight:'600'}}>Settings</Text>
      <Text>Theme, language, and account settings</Text>
      <Button title="Sign out" onPress={() => { /* TODO: sign out */ }} />
    </View>
  );
}
