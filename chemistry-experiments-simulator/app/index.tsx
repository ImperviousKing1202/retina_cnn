import { FuturisticColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Atom, Beaker, Dna, FlaskConical, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChemistryDoor {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  colors: readonly [string, string, string];
  route: string;
}

const chemistryDoors: ChemistryDoor[] = [
  {
    id: 'general',
    title: 'General Chemistry',
    subtitle: 'Fundamentals & Reactions',
    icon: Atom,
    colors: FuturisticColors.gradients.general,
    route: '/experiments/general'
  },
  {
    id: 'biochemistry',
    title: 'Biochemistry',
    subtitle: 'Life & Molecules',
    icon: Dna,
    colors: FuturisticColors.gradients.biochemistry,
    route: '/experiments/biochemistry'
  },
  {
    id: 'organic',
    title: 'Organic Chemistry',
    subtitle: 'Carbon Compounds',
    icon: Beaker,
    colors: FuturisticColors.gradients.organic,
    route: '/experiments/organic'
  },
  {
    id: 'analytical',
    title: 'Analytical Chemistry',
    subtitle: 'Analysis & Detection',
    icon: FlaskConical,
    colors: FuturisticColors.gradients.analytical,
    route: '/experiments/analytical'
  }
];

export default function ChemistryLabHome() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const doorWidth = (width - 60) / 2;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim, pulseAnim]);

  const handleDoorPress = (route: string) => {
    router.push(route as any);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[FuturisticColors.darkBg, '#0F1729', FuturisticColors.darkBg]}
        style={styles.background}
      >
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <Animated.View style={[styles.titleContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Sparkles size={32} color={FuturisticColors.neonBlue} style={styles.sparkle} />
            <Text style={styles.title}>FU Chemistry Lab</Text>
            <Sparkles size={32} color={FuturisticColors.neonPink} style={styles.sparkle} />
          </Animated.View>
          <Text style={styles.subtitle}>Science that&apos;s fab, never drab!</Text>
          <View style={styles.holographicLine} />
        </View>

        <View style={styles.doorsContainer}>
          {chemistryDoors.map((door, index) => {
            const IconComponent = door.icon;
            return (
              <TouchableOpacity
                key={door.id}
                style={[
                  styles.doorContainer,
                  { width: doorWidth },
                  index % 2 === 0 ? styles.leftDoor : styles.rightDoor
                ]}
                onPress={() => handleDoorPress(door.route)}
                activeOpacity={0.8}
              >
                <Animated.View style={{ opacity: glowOpacity }}>
                  <View style={[styles.glowEffect, { shadowColor: door.colors[0] }]} />
                </Animated.View>
                <LinearGradient
                  colors={[...door.colors, door.colors[0]]}
                  style={styles.door}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.doorContent}>
                    <View style={styles.iconContainer}>
                      <View style={styles.iconGlow}>
                        <IconComponent size={48} color="white" strokeWidth={2.5} />
                      </View>
                    </View>
                    <Text style={styles.doorTitle}>{door.title}</Text>
                    <Text style={styles.doorSubtitle}>{door.subtitle}</Text>
                    
                    <View style={styles.doorHandle}>
                      <View style={styles.handle} />
                      <View style={styles.handleGlow} />
                    </View>
                    
                    <View style={styles.scanLine} />
                  </View>
                </LinearGradient>
                <View style={styles.borderGlow} />
              </TouchableOpacity>
            );
          })}
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sparkle: {
    opacity: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: FuturisticColors.neonBlue,
    textAlign: 'center',
    textShadowColor: FuturisticColors.glowBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: FuturisticColors.neonPink,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: FuturisticColors.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  holographicLine: {
    width: '60%',
    height: 2,
    backgroundColor: FuturisticColors.neonBlue,
    marginTop: 15,
    shadowColor: FuturisticColors.glowBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  doorsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 20,
  },
  doorContainer: {
    height: 200,
    position: 'relative',
  },
  leftDoor: {},
  rightDoor: {},
  glowEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  door: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  doorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  iconGlow: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 35,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  doorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  doorSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  doorHandle: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -12,
  },
  handle: {
    width: 8,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  handleGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'transparent',
    borderRadius: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  borderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});