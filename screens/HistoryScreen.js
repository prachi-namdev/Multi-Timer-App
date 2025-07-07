import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          const data = await AsyncStorage.getItem('completedTimers');
          if (data) {
            setHistory(JSON.parse(data));
          } else {
            setHistory([]);
          }
        } catch (e) {
          console.error('Failed to load history', e);
        }
      };

      fetchHistory();
    }, []),
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>🕒 {item.name}</Text>
      <Text>📅 Completed at: {item.completedAt}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {history.length > 0 ? (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.empty}>No completed timers yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  item: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: 'gray' },
});
