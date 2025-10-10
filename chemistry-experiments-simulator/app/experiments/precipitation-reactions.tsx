import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Plus, RotateCcw, TestTube } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Reaction {
  id: string;
  reactant1: string;
  reactant2: string;
  product: string;
  color: string;
  equation: string;
}

const reactions: Reaction[] = [
  {
    id: '1',
    reactant1: 'AgNO₃',
    reactant2: 'NaCl',
    product: 'AgCl',
    color: '#f0f0f0',
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃'
  },
  {
    id: '2',
    reactant1: 'BaCl₂',
    reactant2: 'Na₂SO₄',
    product: 'BaSO₄',
    color: '#ffffff',
    equation: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl'
  },
  {
    id: '3',
    reactant1: 'Pb(NO₃)₂',
    reactant2: 'KI',
    product: 'PbI₂',
    color: '#ffff00',
    equation: 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃'
  },
  {
    id: '4',
    reactant1: 'CuSO₄',
    reactant2: 'NaOH',
    product: 'Cu(OH)₂',
    color: '#4169e1',
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄'
  },
  {
    id: '5',
    reactant1: 'FeCl₃',
    reactant2: 'NH₄OH',
    product: 'Fe(OH)₃',
    color: '#8b4513',
    equation: 'FeCl₃ + 3NH₄OH → Fe(OH)₃↓ + 3NH₄Cl'
  }
];

export default function PrecipitationReactions() {
  const [selectedReactant1, setSelectedReactant1] = useState<string>('');
  const [selectedReactant2, setSelectedReactant2] = useState<string>('');
  const [currentReaction, setCurrentReaction] = useState<Reaction | null>(null);
  const [mixingAnimation, setMixingAnimation] = useState<boolean>(false);

  const reactants = [
    'AgNO₃', 'NaCl', 'BaCl₂', 'Na₂SO₄', 'Pb(NO₃)₂', 'KI', 'CuSO₄', 'NaOH', 'FeCl₃', 'NH₄OH'
  ];

  const mixReactants = () => {
    if (!selectedReactant1 || !selectedReactant2) {
      Alert.alert('Select Reactants', 'Please select both reactants before mixing.');
      return;
    }

    const reaction = reactions.find(r => 
      (r.reactant1 === selectedReactant1 && r.reactant2 === selectedReactant2) ||
      (r.reactant1 === selectedReactant2 && r.reactant2 === selectedReactant1)
    );

    setMixingAnimation(true);
    setTimeout(() => {
      setMixingAnimation(false);
      if (reaction) {
        setCurrentReaction(reaction);
      } else {
        Alert.alert('No Reaction', 'These reactants do not form a precipitate.');
        setCurrentReaction(null);
      }
    }, 1500);
  };

  const reset = () => {
    setSelectedReactant1('');
    setSelectedReactant2('');
    setCurrentReaction(null);
    setMixingAnimation(false);
  };

  const getReactantColor = (reactant: string) => {
    const colors: { [key: string]: string } = {
      'AgNO₃': '#e0e0e0',
      'NaCl': '#f0f0f0',
      'BaCl₂': '#e8e8e8',
      'Na₂SO₄': '#f5f5f5',
      'Pb(NO₃)₂': '#d0d0d0',
      'KI': '#fff8dc',
      'CuSO₄': '#87ceeb',
      'NaOH': '#f0f8ff',
      'FeCl₃': '#daa520',
      'NH₄OH': '#f0f8ff'
    };
    return colors[reactant] || '#e0e0e0';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Precipitation Reactions',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <TestTube size={32} color="white" />
        <Text style={styles.headerTitle}>Precipitation Reactions</Text>
        <Text style={styles.headerSubtitle}>Mix ionic solutions to form precipitates</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Reactants</Text>
          <View style={styles.reactantGrid}>
            {reactants.map((reactant) => (
              <TouchableOpacity
                key={reactant}
                style={[
                  styles.reactantButton,
                  { backgroundColor: getReactantColor(reactant) },
                  (selectedReactant1 === reactant || selectedReactant2 === reactant) && styles.selectedReactant
                ]}
                onPress={() => {
                  if (!selectedReactant1) {
                    setSelectedReactant1(reactant);
                  } else if (!selectedReactant2 && reactant !== selectedReactant1) {
                    setSelectedReactant2(reactant);
                  } else if (selectedReactant1 === reactant) {
                    setSelectedReactant1('');
                  } else if (selectedReactant2 === reactant) {
                    setSelectedReactant2('');
                  }
                }}
              >
                <Text style={styles.reactantText}>{reactant}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Tube</Text>
          <View style={styles.testTubeContainer}>
            <View style={styles.testTube}>
              {selectedReactant1 && (
                <View style={[styles.solution, { backgroundColor: getReactantColor(selectedReactant1) }]} />
              )}
              {selectedReactant2 && (
                <View style={[styles.solution, { backgroundColor: getReactantColor(selectedReactant2) }]} />
              )}
              {mixingAnimation && (
                <View style={[styles.solution, styles.mixingSolution]} />
              )}
              {currentReaction && !mixingAnimation && (
                <View style={[styles.precipitate, { backgroundColor: currentReaction.color }]} />
              )}
            </View>
            <Text style={styles.testTubeLabel}>Reaction Vessel</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.mixButton]}
            onPress={mixReactants}
            disabled={mixingAnimation}
          >
            <Plus size={24} color="white" />
            <Text style={styles.controlButtonText}>
              {mixingAnimation ? 'Mixing...' : 'Mix Reactants'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {currentReaction && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Reaction Result</Text>
            <Text style={styles.equation}>{currentReaction.equation}</Text>
            <Text style={styles.productInfo}>
              Precipitate formed: <Text style={styles.productName}>{currentReaction.product}</Text>
            </Text>
            <View style={[styles.colorSample, { backgroundColor: currentReaction.color }]} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Precipitation Reactions</Text>
          <Text style={styles.infoText}>
            Precipitation reactions occur when two soluble ionic compounds react to form an insoluble product (precipitate). 
            The precipitate forms because the product has low solubility in water.
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
  reactantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reactantButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedReactant: {
    borderColor: '#4A90E2',
    borderWidth: 3,
  },
  reactantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  testTubeContainer: {
    alignItems: 'center',
  },
  testTube: {
    width: 80,
    height: 200,
    borderWidth: 3,
    borderColor: '#333',
    borderTopWidth: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  solution: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.7,
  },
  mixingSolution: {
    backgroundColor: '#ff9800',
    height: 120,
  },
  precipitate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderRadius: 4,
  },
  testTubeLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
  mixButton: {
    backgroundColor: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  equation: {
    fontSize: 16,
    color: '#4A90E2',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  productInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
  },
  colorSample: {
    width: 40,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
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