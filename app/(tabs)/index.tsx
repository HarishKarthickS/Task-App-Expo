// app/(tabs)/index.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  // Animation values for fade-in and slide-up effect
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fading in
  const slideAnim = useRef(new Animated.Value(50)).current; // For sliding up

  useEffect(() => {
    // Parallel animation for a smooth appearance effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={['#FF6F61', '#FF9A8D']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animatedContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Ionicons
            name="checkmark-done-circle-outline"
            size={64}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.title}>Welcome to Task Manager!</Text>
          <Text style={styles.subtitle}>
            Use the "Tasks" tab to view and manage your tasks.
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedContainer: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
});
