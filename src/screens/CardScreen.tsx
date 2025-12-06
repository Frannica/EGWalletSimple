import React from 'react';
import { View, Text } from 'react-native';

export default function CardScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:20,fontWeight:'600'}}>Card</Text>
      <Text>Virtual card display (read-only)</Text>
    </View>
  );
}
