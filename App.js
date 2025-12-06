import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Picker, StyleSheet, Alert, ToastAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://your-backend-url/api';
const currencies = ['NGN', 'GHS', 'ZAR', 'XOF', 'XAF', 'CNY', 'USD', 'EUR'];

const currencySymbols = {
  NGN: '₦', GHS: '₵', ZAR: 'R', XOF: 'CFA', XAF: 'FCFA',
  CNY: '¥', USD: '$', EUR: '€'
};

function notify(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Notification', message);
  }
}

function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <Text>Your wallet screen will go here.</Text>
    </View>
  );
}

function SendScreen() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = () => {
    if (!recipient || !amount) {
      notify('Please fill in all fields');
      return;
    }
    notify(`Sent ${amount} to ${recipient}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Money</Text>
      <Text style={styles.label}>Recipient</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter recipient name or number"
        value={recipient}
        onChangeText={setRecipient}
        placeholderTextColor="#999"
      />
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholderTextColor="#999"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

function RequestScreen() {
  const [requester, setRequester] = useState('');
  const [amount, setAmount] = useState('');

  const handleRequest = () => {
    if (!requester || !amount) {
      notify('Please fill in all fields');
      return;
    }
    notify(`Request for ${amount} sent to ${requester}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Money</Text>
      <Text style={styles.label}>From</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name or number"
        value={requester}
        onChangeText={setRequester}
        placeholderTextColor="#999"
      />
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholderTextColor="#999"
      />
      <Button title="Send Request" onPress={handleRequest} />
    </View>
  );
}

function CardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card</Text>
      <Text>Your virtual debit card screen goes here.</Text>
    </View>
  );
}

function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text>Transaction history goes here.</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Wallet') iconName = 'wallet';
        else if (route.name === 'Send') iconName = 'send';
        else if (route.name === 'Request') iconName = 'cash';
        else if (route.name === 'Card') iconName = 'card';
        else if (route.name === 'History') iconName = 'time';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007aff',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}>
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Send" component={SendScreen} />
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="Card" component={CardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6fc', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 5, alignSelf: 'flex-start', width: '100%', paddingHorizontal: 20 },
  input: { width: '90%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#fff' }
});
