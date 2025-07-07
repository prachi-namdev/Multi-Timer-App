import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';

export default function TimerItem({ timer, dispatch }) {
  const [timeLeft, setTimeLeft] = useState(timer.remainingTime);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer.status === 'Running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timer.status]);

  useEffect(() => {
    setTimeLeft(timer.remainingTime);
  }, [timer.remainingTime]);

  useEffect(() => {
    if (completed) {
      dispatch({
        type: 'COMPLETE_TIMER',
        payload: {
          id: timer.id,
          log: {
            name: timer.name,
            completedAt: new Date().toLocaleString(),
          },
        },
      });
      setCompleted(false);
    }
  }, [completed]);

  const progress = timeLeft / timer.duration;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕒 {timer.name}</Text>
      <Text>📂 {timer.category}</Text>
      <Text>Status: {timer.status}</Text>
      <Text>Time Left: {timeLeft}s</Text>

      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <View style={styles.controls}>
        {timer.status !== 'Running' ? (
          <Button
            title="Start"
            color="#007AFF"
            onPress={() => dispatch({ type: 'START_TIMER', payload: timer.id })}
          />
        ) : (
          <Button
            title="Pause"
            color="#FF9500"
            onPress={() => dispatch({ type: 'PAUSE_TIMER', payload: timer.id })}
          />
        )}
        <Button
          title="Reset"
          color="#FF3B30"
          onPress={() => dispatch({ type: 'RESET_TIMER', payload: timer.id })}
        />
      </View>
      {timer.status === 'Completed' && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={styles.modalText}>
                🎉 Congrats! Timer "{timer.name}" completed!
              </Text>
              <Button
                title="Close"
                onPress={() =>
                  dispatch({ type: 'RESET_TIMER', payload: timer.id })
                }
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'green',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
});
