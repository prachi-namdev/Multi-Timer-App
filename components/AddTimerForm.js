import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TimerScreen() {
  const [timers, setTimers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = async () => {
    try {
      const savedTimers = await AsyncStorage.getItem('timers');
      if (savedTimers !== null) {
        setTimers(JSON.parse(savedTimers));
      }
    } catch (err) {
      console.error('Failed to load timers:', err);
    }
  };

  const saveTimers = async newTimers => {
    try {
      await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
    } catch (err) {
      console.error('Failed to save timers:', err);
    }
  };

  const addTimer = () => {
    if (!name || !duration || !category) {
      Alert.alert('Please fill all fields');
      return;
    }

    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      category,
    };

    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
    saveTimers(updatedTimers);
    setName('');
    setDuration('');
    setCategory('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Timer</Text>
      </TouchableOpacity>

      <FlatList
        data={timers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.timerCard}>
            <Text style={styles.timerText}>{item.name}</Text>
            <Text style={styles.timerText}>⏱ {item.duration} sec</Text>
            <Text style={styles.timerText}>📂 {item.category}</Text>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Timer</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={'blue'}
            />
            <TextInput
              placeholder="Duration (in seconds)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={'blue'}
            />
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
              placeholderTextColor={'blue'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={addTimer}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#aaa' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#dbd9dc',
  },
  addButton: {
    backgroundColor: '#0f4d5f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  timerCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#0f4d5f',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});
