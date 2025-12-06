import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { fetchRates } from './src/api/client';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import AuthScreen from './src/screens/AuthScreen';

function RootApp() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!auth.token) {
    return <AuthScreen />;
  }

  return <AppNavigator />;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // warm rates and basic startup tasks
    fetchRates().catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <RootApp />
    </AuthProvider>
  );
}
