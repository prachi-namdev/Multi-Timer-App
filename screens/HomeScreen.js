import React, { useEffect, useReducer, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimerItem from '../components/TimerItem';
import AddTimerForm from '../components/AddTimerForm';
import { useFocusEffect } from '@react-navigation/native';

const initialState = { timers: [], completed: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TIMER':
      return { ...state, timers: [...state.timers, action.payload] };
    case 'UPDATE_TIMERS':
      return { ...state, timers: action.payload };
    case 'COMPLETE_TIMER': {
      const updatedTimers = state.timers.map(t =>
        t.id === action.payload.id
          ? { ...t, status: 'Completed', isRunning: false, remainingTime: 0 }
          : t,
      );

      const updatedCompleted = [...state.completed, action.payload.log];

      AsyncStorage.setItem('completedTimers', JSON.stringify(updatedCompleted));

      return {
        ...state,
        timers: updatedTimers,
        completed: updatedCompleted,
      };
    }
    case 'START_TIMER':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.id === action.payload
            ? { ...t, isRunning: true, status: 'Running' }
            : t,
        ),
      };
    case 'PAUSE_TIMER':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.id === action.payload
            ? { ...t, isRunning: false, status: 'Paused' }
            : t,
        ),
      };
    case 'RESET_TIMER':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.id === action.payload
            ? {
                ...t,
                isRunning: false,
                remainingTime: t.duration,
                status: 'Idle',
              }
            : t,
        ),
      };
    case 'START_ALL':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.category === action.payload
            ? { ...t, isRunning: true, status: 'Running' }
            : t,
        ),
      };
    case 'PAUSE_ALL':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.category === action.payload
            ? { ...t, isRunning: false, status: 'Paused' }
            : t,
        ),
      };
    case 'RESET_ALL':
      return {
        ...state,
        timers: state.timers.map(t =>
          t.category === action.payload
            ? {
                ...t,
                isRunning: false,
                remainingTime: t.duration,
                status: 'Idle',
              }
            : t,
        ),
      };
    default:
      return state;
  }
}

export default function HomeScreen() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadTimers = async () => {
    const data = await AsyncStorage.getItem('timers');
    if (data) {
      const loaded = JSON.parse(data).map(t => ({
        ...t,
        remainingTime: t.remainingTime || t.duration,
        isRunning: false,
        status: 'Idle',
      }));
      dispatch({ type: 'UPDATE_TIMERS', payload: loaded });
    }
  };

  const saveTimers = async timers => {
    await AsyncStorage.setItem('timers', JSON.stringify(timers));
  };

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    saveTimers(state.timers);
  }, [state.timers]);

  useFocusEffect(
    React.useCallback(() => {
      loadTimers();
    }, []),
  );

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const groupedTimers = state.timers.reduce((acc, timer) => {
    const group = acc.find(g => g.title === timer.category);
    if (group) group.data.push(timer);
    else acc.push({ title: timer.category, data: [timer] });
    return acc;
  }, []);

  return (
    <ScrollView style={styles.container}>
      {groupedTimers.map(group => (
        <View key={group.title} style={styles.categoryContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryTitle}>📂 {group.title}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  dispatch({ type: 'START_ALL', payload: group.title })
                }
              >
                <Text style={styles.actionText}>Start All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  dispatch({ type: 'PAUSE_ALL', payload: group.title })
                }
              >
                <Text style={styles.actionText}>Pause All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  dispatch({ type: 'RESET_ALL', payload: group.title })
                }
              >
                <Text style={styles.actionText}>Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {group.data.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleExpand(item.id)}
              style={styles.timerCard}
            >
              <TimerItem
                timer={item}
                dispatch={dispatch}
                isExpanded={expandedId === item.id}
              />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <AddTimerForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dispatch={dispatch}
        saveTimers={saveTimers}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f2f2f2' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: { fontSize: 18, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', gap: 5 },
  actionBtn: {
    backgroundColor: '#0f4d5f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  actionText: { color: 'white', fontWeight: 'bold' },
  timerCard: {
    padding: 10,
    marginTop: 5,
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#004466',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
