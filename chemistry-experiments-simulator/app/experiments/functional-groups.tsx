import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Eye, Flame, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MetalIon {
  id: string;
  name: string;
  formula: string;
  flameColor: string;
  description: string;
}

const metalIons: MetalIon[] = [
  {
    id: 'lithium',
    name: 'Lithium',
    formula: 'Li⁺',
    flameColor: '#ff0040',
    description: 'Crimson red flame'
  },
  {
    id: 'sodium',
    name: 'Sodium',
    formula: 'Na⁺',
    flameColor: '#ffaa00',
    description: 'Bright yellow-orange flame'
  },
  {
    id: 'potassium',
    name: 'Potassium',
    formula: 'K⁺',
    flameColor: '#aa00ff',
    description: 'Lilac/violet flame'
  },
  {
    id: 'calcium',
    name: 'Calcium',
    formula: 'Ca²⁺',
    flameColor: '#ff4400',
    description: 'Orange-red flame'
  },
  {
    id: 'strontium',
    name: 'Strontium',
    formula: 'Sr²⁺',
    flameColor: '#ff0000',
    description: 'Deep red flame'
  },
  {
    id: 'barium',
    name: 'Barium',
    formula: 'Ba²⁺',
    flameColor: '#00ff00',
    description: 'Green flame'
  },
  {
    id: 'copper',
    name: 'Copper',
    formula: 'Cu²⁺',
    flameColor: '#00ffaa',
    description: 'Blue-green flame'
  },
  {
    id: 'boron',
    name: 'Boron',
    formula: 'B³⁺',
    flameColor: '#00ff44',
    description: 'Bright green flame'
  }
];

export default function FlameTest() {
  const [selectedMetal, setSelectedMetal] = useState<MetalIon | null>(null);
  const [isFlameOn, setIsFlameOn] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<MetalIon[]>([]);

  const performFlameTest = () => {
    if (!selectedMetal) return;
    
    setIsFlameOn(true);
    setTimeout(() => {
      setIsFlameOn(false);
      if (!testResults.find(result => result.id === selectedMetal.id)) {
        setTestResults(prev => [...prev, selectedMetal]);
      }
    }, 3000);
  };

  const reset = () => {
    setSelectedMetal(null);
    setIsFlameOn(false);
    setTestResults([]);
  };

  const selectMetal = (metal: MetalIon) => {
    if (isFlameOn) return;
    setSelectedMetal(metal);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Flame Test Analysis',
          headerStyle: { backgroundColor: '#9013FE' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#9013FE', '#7B1FA2']}
        style={styles.header}
      >
        <Flame size={32} color="white" />
        <Text style={styles.headerTitle}>Flame Test Analysis</Text>
        <Text style={styles.headerSubtitle}>Identify metal ions by flame color</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Metal Ion</Text>
          <View style={styles.metalGrid}>
            {metalIons.map((metal) => (
              <TouchableOpacity
                key={metal.id}
                style={[
                  styles.metalButton,
                  selectedMetal?.id === metal.id && styles.selectedMetal,
                  isFlameOn && styles.disabledMetal
                ]}
                onPress={() => selectMetal(metal)}
                disabled={isFlameOn}
              >
                <Text style={styles.metalFormula}>{metal.formula}</Text>
                <Text style={styles.metalName}>{metal.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bunsen Burner</Text>
          <View style={styles.burnerContainer}>
            <View style={styles.burner}>
              <View style={[
                styles.flame,
                isFlameOn && selectedMetal && { backgroundColor: selectedMetal.flameColor },
                !isFlameOn && styles.noFlame
              ]}>
                {isFlameOn && selectedMetal && (
                  <Text style={styles.flameText}>🔥</Text>
                )}
              </View>
              <View style={styles.burnerBase} />
            </View>
            
            {selectedMetal && (
              <View style={styles.sampleInfo}>
                <Text style={styles.sampleLabel}>Sample: {selectedMetal.name} ({selectedMetal.formula})</Text>
                {isFlameOn && (
                  <Text style={styles.flameDescription}>{selectedMetal.description}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.testButton,
              (!selectedMetal || isFlameOn) && styles.disabledButton
            ]}
            onPress={performFlameTest}
            disabled={!selectedMetal || isFlameOn}
          >
            <Eye size={24} color="white" />
            <Text style={styles.controlButtonText}>
              {isFlameOn ? 'Testing...' : 'Perform Test'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]} 
            onPress={reset}
            disabled={isFlameOn}
          >
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {testResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            {testResults.map((result) => (
              <View key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultMetal}>{result.name} ({result.formula})</Text>
                  <View style={[styles.colorSample, { backgroundColor: result.flameColor }]} />
                </View>
                <Text style={styles.resultDescription}>{result.description}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Flame Tests</Text>
          <Text style={styles.infoText}>
            Flame tests are used to identify metal ions based on the characteristic colors they produce when heated in a flame. 
            The colors result from electrons being excited to higher energy levels and then returning to ground state, 
            emitting light at specific wavelengths.
          </Text>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metalButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMetal: {
    borderColor: '#9013FE',
    borderWidth: 3,
  },
  disabledMetal: {
    opacity: 0.5,
  },
  metalFormula: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9013FE',
    marginBottom: 4,
  },
  metalName: {
    fontSize: 14,
    color: '#666',
  },
  burnerContainer: {
    alignItems: 'center',
  },
  burner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flame: {
    width: 60,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  noFlame: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  flameText: {
    fontSize: 40,
  },
  burnerBase: {
    width: 80,
    height: 40,
    backgroundColor: '#666',
    borderRadius: 8,
  },
  sampleInfo: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sampleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  flameDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'center',
  },
  testButton: {
    backgroundColor: '#FF5722',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultMetal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  colorSample: {
    width: 30,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
});