import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { listWallets } from '../api/auth';
import { sendTransaction } from '../api/transactions';
import { useNavigation } from '@react-navigation/native';
import { majorToMinor, decimalsFor } from '../utils/currency';

export default function SendScreen() {
  const auth = useAuth();
  const [wallets, setWallets] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const navigation = useNavigation();

  useEffect(() => { loadWallets(); }, [auth.token]);

  async function loadWallets() {
    if (!auth.token) return;
    setLoading(true);
    try {
      const res = await listWallets(auth.token);
      setWallets(res.wallets || []);
      if ((res.wallets || []).length > 0) setFromWalletId((res.wallets || [])[0].id);
    } catch (e) {
      console.warn(e);
    } finally { setLoading(false); }
  }

  async function onSend() {
    if (!auth.token) return Alert.alert('Not authenticated');
    if (!fromWalletId) return Alert.alert('Select source wallet');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Enter valid amount');
    // convert to minor units
    const amountMinor = majorToMinor(amt, currency);
    if (!toWalletId) return Alert.alert('Enter destination wallet id');
    try {
      const res = await sendTransaction(auth.token, fromWalletId, toWalletId, amountMinor, currency);
      Alert.alert('Success', 'Transaction created');
      // refresh wallets and navigate to transactions for the source wallet
      loadWallets();
      setAmount('');
      // @ts-ignore
      navigation.navigate('Transactions' as any, { walletId: fromWalletId } as any);
    } catch (e: any) {
      Alert.alert('Send failed', e.message || String(e));
    }
  }

  return (
    <View style={{flex:1,padding:16}}>
      <Text style={{fontSize:20,fontWeight:'600'}}>Send</Text>
      {loading && <Text>Loading wallets...</Text>}

      <Text style={{marginTop:12}}>From wallet</Text>
      {/* Simple select */}
      {wallets.map(w=> (
        <Button key={w.id} title={w.id} onPress={()=>setFromWalletId(w.id)} color={fromWalletId===w.id ? '#007AFF' : undefined} />
      ))}

      <Text style={{marginTop:12}}>To wallet ID</Text>
      <TextInput value={toWalletId} onChangeText={setToWalletId} placeholder="Destination wallet id" style={{borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8}} />

      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" style={{borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8}} />

      <Text>Currency</Text>
      <TextInput value={currency} onChangeText={setCurrency} style={{borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8}} />

      <Button title="Send" onPress={onSend} />
    </View>
  );
}

