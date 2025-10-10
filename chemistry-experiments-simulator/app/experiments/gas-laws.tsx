import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ArrowDown, ArrowUp, Gauge, RotateCcw, Thermometer, Volume2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

const containerHeight = 200;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
}

interface GasState {
  pressure: number; // atm
  volume: number; // L
  temperature: number; // K
  particles: Particle[];
}

const IDEAL_GAS_CONSTANT = 0.0821; // L·atm/(mol·K)
const MOLES = 1; // Fixed at 1 mole for simplicity

export default function GasLawsSimulation() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - 40;
  const [gasState, setGasState] = useState<GasState>({
    pressure: 1.0,
    volume: 22.4,
    temperature: 273,
    particles: []
  });
  const [selectedLaw, setSelectedLaw] = useState<'boyle' | 'charles' | 'gay-lussac' | 'combined'>('boyle');
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize particles
  useEffect(() => {
    const numParticles = Math.min(50, Math.max(10, Math.floor(gasState.temperature / 10)));
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        id: i,
        x: Math.random() * (containerWidth - 20) + 10,
        y: Math.random() * (containerHeight - 20) + 10,
        vx: (Math.random() - 0.5) * (gasState.temperature / 100),
        vy: (Math.random() - 0.5) * (gasState.temperature / 100)
      });
    }
    setGasState(prev => ({ ...prev, particles }));
  }, [gasState.temperature, containerWidth]);

  // Animate particles
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setGasState(prev => ({
        ...prev,
        particles: prev.particles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          let newVx = particle.vx;
          let newVy = particle.vy;

          // Bounce off walls
          if (newX <= 5 || newX >= containerWidth - 5) {
            newVx = -newVx;
            newX = Math.max(5, Math.min(containerWidth - 5, newX));
          }
          if (newY <= 5 || newY >= containerHeight - 5) {
            newVy = -newVy;
            newY = Math.max(5, Math.min(containerHeight - 5, newY));
          }

          return { ...particle, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, containerWidth]);

  const calculateIdealGas = (p?: number, v?: number, t?: number): number => {
    // PV = nRT, solving for missing variable
    const pressure = p ?? gasState.pressure;
    const volume = v ?? gasState.volume;
    const temperature = t ?? gasState.temperature;

    if (p === undefined) {
      return (MOLES * IDEAL_GAS_CONSTANT * temperature) / volume;
    }
    if (v === undefined) {
      return (MOLES * IDEAL_GAS_CONSTANT * temperature) / pressure;
    }
    if (t === undefined) {
      return (pressure * volume) / (MOLES * IDEAL_GAS_CONSTANT);
    }
    return pressure; // fallback
  };

  const updatePressure = (delta: number) => {
    const newPressure = Math.max(0.1, Math.min(5.0, gasState.pressure + delta));
    let newState = { ...gasState, pressure: newPressure };
    
    if (selectedLaw === 'boyle') {
      // Boyle's Law: P₁V₁ = P₂V₂ (T constant)
      newState.volume = (gasState.pressure * gasState.volume) / newPressure;
    } else if (selectedLaw === 'gay-lussac') {
      // Gay-Lussac's Law: P₁/T₁ = P₂/T₂ (V constant)
      newState.temperature = (newPressure * gasState.temperature) / gasState.pressure;
    } else if (selectedLaw === 'combined') {
      // Combined Gas Law: (P₁V₁)/T₁ = (P₂V₂)/T₂
      newState.volume = calculateIdealGas(newPressure, undefined, gasState.temperature);
    }
    
    setGasState(newState);
  };

  const updateVolume = (delta: number) => {
    const newVolume = Math.max(5, Math.min(50, gasState.volume + delta));
    let newState = { ...gasState, volume: newVolume };
    
    if (selectedLaw === 'boyle') {
      // Boyle's Law: P₁V₁ = P₂V₂ (T constant)
      newState.pressure = (gasState.pressure * gasState.volume) / newVolume;
    } else if (selectedLaw === 'charles') {
      // Charles's Law: V₁/T₁ = V₂/T₂ (P constant)
      newState.temperature = (newVolume * gasState.temperature) / gasState.volume;
    } else if (selectedLaw === 'combined') {
      // Combined Gas Law
      newState.pressure = calculateIdealGas(undefined, newVolume, gasState.temperature);
    }
    
    setGasState(newState);
  };

  const updateTemperature = (delta: number) => {
    const newTemperature = Math.max(100, Math.min(500, gasState.temperature + delta));
    let newState = { ...gasState, temperature: newTemperature };
    
    if (selectedLaw === 'charles') {
      // Charles's Law: V₁/T₁ = V₂/T₂ (P constant)
      newState.volume = (gasState.volume * newTemperature) / gasState.temperature;
    } else if (selectedLaw === 'gay-lussac') {
      // Gay-Lussac's Law: P₁/T₁ = P₂/T₂ (V constant)
      newState.pressure = (gasState.pressure * newTemperature) / gasState.temperature;
    } else if (selectedLaw === 'combined') {
      // Combined Gas Law
      newState.pressure = calculateIdealGas(undefined, gasState.volume, newTemperature);
    }
    
    setGasState(newState);
  };

  const resetSimulation = () => {
    setGasState({
      pressure: 1.0,
      volume: 22.4,
      temperature: 273,
      particles: []
    });
  };

  const gasLaws = [
    { id: 'boyle', name: "Boyle's Law", formula: 'P₁V₁ = P₂V₂', description: 'Pressure × Volume = constant (T fixed)' },
    { id: 'charles', name: "Charles's Law", formula: 'V₁/T₁ = V₂/T₂', description: 'Volume ∝ Temperature (P fixed)' },
    { id: 'gay-lussac', name: "Gay-Lussac's Law", formula: 'P₁/T₁ = P₂/T₂', description: 'Pressure ∝ Temperature (V fixed)' },
    { id: 'combined', name: 'Combined Gas Law', formula: '(P₁V₁)/T₁ = (P₂V₂)/T₂', description: 'All variables can change' }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gas Laws Simulation',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2E5F8A']}
        style={styles.header}
      >
        <Volume2 size={40} color="white" />
        <Text style={styles.headerTitle}>Gas Laws Simulation</Text>
        <Text style={styles.headerSubtitle}>Interactive PVT Relationships</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {/* Gas Law Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Gas Law</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lawSelector}>
            {gasLaws.map((law) => (
              <TouchableOpacity
                key={law.id}
                style={[
                  styles.lawCard,
                  selectedLaw === law.id && styles.selectedLawCard
                ]}
                onPress={() => setSelectedLaw(law.id as any)}
              >
                <Text style={[
                  styles.lawName,
                  selectedLaw === law.id && styles.selectedLawName
                ]}>{law.name}</Text>
                <Text style={[
                  styles.lawFormula,
                  selectedLaw === law.id && styles.selectedLawFormula
                ]}>{law.formula}</Text>
                <Text style={[
                  styles.lawDescription,
                  selectedLaw === law.id && styles.selectedLawDescription
                ]}>{law.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gas Container Visualization */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gas Container</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, isAnimating && styles.activeButton]}
                onPress={() => setIsAnimating(!isAnimating)}
              >
                <Text style={[styles.controlButtonText, isAnimating && styles.activeButtonText]}>
                  {isAnimating ? 'Pause' : 'Animate'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={resetSimulation}>
                <RotateCcw size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.containerWrapper}>
            <Svg width={containerWidth} height={containerHeight} style={styles.gasContainer}>
              {/* Container walls */}
              <Rect
                x={2}
                y={2}
                width={containerWidth - 4}
                height={containerHeight - 4}
                fill="rgba(74, 144, 226, 0.1)"
                stroke="#4A90E2"
                strokeWidth={3}
                rx={10}
              />
              
              {/* Volume indicator */}
              <Rect
                x={5}
                y={containerHeight - (gasState.volume / 50) * (containerHeight - 10) - 5}
                width={containerWidth - 10}
                height={(gasState.volume / 50) * (containerHeight - 10)}
                fill="rgba(74, 144, 226, 0.2)"
                rx={5}
              />
              
              {/* Particles */}
              {gasState.particles.map((particle) => (
                <Circle
                  key={particle.id}
                  cx={particle.x}
                  cy={particle.y}
                  r={3}
                  fill="#FF6B6B"
                  opacity={0.8}
                />
              ))}
              
              {/* Pressure indicator lines */}
              {Array.from({ length: Math.floor(gasState.pressure * 5) }, (_, i) => (
                <Line
                  key={i}
                  x1={10 + i * 8}
                  y1={10}
                  x2={10 + i * 8}
                  y2={20}
                  stroke="#FF9800"
                  strokeWidth={2}
                />
              ))}
            </Svg>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          
          {/* Pressure Control */}
          <View style={styles.controlRow}>
            <View style={styles.controlLabel}>
              <Gauge size={20} color="#FF9800" />
              <Text style={styles.controlLabelText}>Pressure</Text>
            </View>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updatePressure(-0.1)}
              >
                <ArrowDown size={16} color="white" />
              </TouchableOpacity>
              <Text style={styles.valueText}>{gasState.pressure.toFixed(2)} atm</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updatePressure(0.1)}
              >
                <ArrowUp size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Volume Control */}
          <View style={styles.controlRow}>
            <View style={styles.controlLabel}>
              <Volume2 size={20} color="#4A90E2" />
              <Text style={styles.controlLabelText}>Volume</Text>
            </View>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateVolume(-1)}
              >
                <ArrowDown size={16} color="white" />
              </TouchableOpacity>
              <Text style={styles.valueText}>{gasState.volume.toFixed(1)} L</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateVolume(1)}
              >
                <ArrowUp size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Temperature Control */}
          <View style={styles.controlRow}>
            <View style={styles.controlLabel}>
              <Thermometer size={20} color="#F44336" />
              <Text style={styles.controlLabelText}>Temperature</Text>
            </View>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateTemperature(-10)}
              >
                <ArrowDown size={16} color="white" />
              </TouchableOpacity>
              <Text style={styles.valueText}>{gasState.temperature.toFixed(0)} K</Text>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => updateTemperature(10)}
              >
                <ArrowUp size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Current Law Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Law: {gasLaws.find(l => l.id === selectedLaw)?.name}</Text>
          <View style={styles.lawInfo}>
            <Text style={styles.lawInfoFormula}>{gasLaws.find(l => l.id === selectedLaw)?.formula}</Text>
            <Text style={styles.lawInfoDescription}>{gasLaws.find(l => l.id === selectedLaw)?.description}</Text>
            
            <View style={styles.calculationBox}>
              <Text style={styles.calculationTitle}>Ideal Gas Calculation:</Text>
              <Text style={styles.calculationText}>PV = nRT</Text>
              <Text style={styles.calculationText}>
                ({gasState.pressure.toFixed(2)})({gasState.volume.toFixed(1)}) = (1)(0.0821)({gasState.temperature.toFixed(0)})
              </Text>
              <Text style={styles.calculationText}>
                {(gasState.pressure * gasState.volume).toFixed(2)} ≈ {(MOLES * IDEAL_GAS_CONSTANT * gasState.temperature).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    backgroundColor: 'white',
  },
  activeButton: {
    backgroundColor: '#4A90E2',
  },
  controlButtonText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  activeButtonText: {
    color: 'white',
  },
  lawSelector: {
    marginBottom: 10,
  },
  lawCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    minWidth: 200,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLawCard: {
    backgroundColor: '#4A90E2',
    borderColor: '#357ABD',
  },
  lawName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedLawName: {
    color: 'white',
  },
  lawFormula: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 5,
  },
  selectedLawFormula: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lawDescription: {
    fontSize: 12,
    color: '#666',
  },
  selectedLawDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  containerWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  gasContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  controlLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controlLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  adjustButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 80,
    textAlign: 'center',
  },
  lawInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  lawInfoFormula: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  lawInfoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  calculationBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  calculationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});