import React from 'react';
import { View, Text } from 'react-native';

export default function BudgetScreen() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:20,fontWeight:'600'}}>Budget</Text>
      <Text>Budgeting and donut chart placeholder</Text>
    </View>
  );
}
