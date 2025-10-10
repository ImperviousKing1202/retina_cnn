import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Beaker, RotateCcw, Thermometer } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Chemical = 'none' | 'sodium-acetate' | 'sodium-hydroxide';

interface SimulationState {
  selectedChemical: Chemical;
  temperature: number;
  isReacting: boolean;
  result: 'endothermic' | 'exothermic' | null;
}

const INITIAL_TEMP = 25.0;

export default function SolutionEnthalpyLab() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<SimulationState>({
    selectedChemical: 'none',
    temperature: INITIAL_TEMP,
    isReacting: false,
    result: null,
  });

  const addChemical = (chemical: 'sodium-acetate' | 'sodium-hydroxide') => {
    setState({ ...state, selectedChemical: chemical, isReacting: true });
    
    setTimeout(() => {
      const finalTemp = chemical === 'sodium-acetate' ? 22.5 : 28.0;
      const result = chemical === 'sodium-acetate' ? 'endothermic' : 'exothermic';
      
      setState({
        selectedChemical: chemical,
        temperature: finalTemp,
        isReacting: false,
        result,
      });
    }, 1500);
  };

  const reset = () => {
    setState({
      selectedChemical: 'none',
      temperature: INITIAL_TEMP,
      isReacting: false,
      result: null,
    });
  };

  const getBeakerColor = () => {
    if (state.selectedChemical === 'none') return '#E3F2FD';
    if (state.isReacting) return '#FFF9C4';
    if (state.result === 'endothermic') return '#B3E5FC';
    return '#FFCCBC';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Solution & Enthalpy Lab',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Thermometer size={32} color="white" />
        <Text style={styles.headerTitle}>Solution & Enthalpy Lab</Text>
        <Text style={styles.headerSubtitle}>Endothermic vs Exothermic Dissolution</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Goal</Text>
            <Text style={styles.infoText}>
              Simulate dissolution processes to determine if they are endothermic or exothermic.
            </Text>
          </View>

          <View style={styles.simulationContainer}>
            <View style={styles.beakerContainer}>
              <View style={[styles.beaker, { backgroundColor: getBeakerColor() }]}>
                <View style={styles.waterLevel}>
                  <Text style={styles.waterLabel}>H₂O</Text>
                </View>
                {state.selectedChemical !== 'none' && (
                  <View style={styles.chemicalIndicator}>
                    <Text style={styles.chemicalText}>
                      {state.selectedChemical === 'sodium-acetate' 
                        ? 'NaCH₃COO·3H₂O' 
                        : 'NaOH'}
                    </Text>
                  </View>
                )}
              </View>
              <Beaker size={120} color="#4A90E2" style={styles.beakerIcon} />
            </View>

            <View style={styles.thermometerDisplay}>
              <Thermometer size={40} color="#F44336" />
              <Text style={styles.temperatureText}>
                {state.temperature.toFixed(1)}°C
              </Text>
              {state.isReacting && (
                <Text style={styles.reactingText}>Dissolving...</Text>
              )}
            </View>

            {state.result && (
              <View style={[
                styles.resultCard,
                { backgroundColor: state.result === 'endothermic' ? '#E3F2FD' : '#FFEBEE' }
              ]}>
                <Text style={[
                  styles.resultLabel,
                  { color: state.result === 'endothermic' ? '#1976D2' : '#D32F2F' }
                ]}>
                  RESULT: {state.result.toUpperCase()}
                </Text>
                <Text style={styles.resultExplanation}>
                  {state.result === 'endothermic' 
                    ? 'Temperature decreased - Heat absorbed from surroundings'
                    : 'Temperature increased - Heat released to surroundings'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chemicalsSection}>
            <Text style={styles.sectionTitle}>Select Chemical to Add:</Text>
            
            <TouchableOpacity
              style={[
                styles.chemicalButton,
                state.selectedChemical === 'sodium-acetate' && styles.chemicalButtonSelected,
                state.isReacting && styles.chemicalButtonDisabled
              ]}
              onPress={() => addChemical('sodium-acetate')}
              disabled={state.isReacting || state.selectedChemical !== 'none'}
              activeOpacity={0.7}
            >
              <Text style={styles.chemicalButtonTitle}>Sodium Acetate Trihydrate</Text>
              <Text style={styles.chemicalFormula}>NaCH₃COO·3H₂O</Text>
              <Text style={styles.chemicalHint}>Expected: Temperature ↓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chemicalButton,
                state.selectedChemical === 'sodium-hydroxide' && styles.chemicalButtonSelected,
                state.isReacting && styles.chemicalButtonDisabled
              ]}
              onPress={() => addChemical('sodium-hydroxide')}
              disabled={state.isReacting || state.selectedChemical !== 'none'}
              activeOpacity={0.7}
            >
              <Text style={styles.chemicalButtonTitle}>Sodium Hydroxide</Text>
              <Text style={styles.chemicalFormula}>NaOH</Text>
              <Text style={styles.chemicalHint}>Expected: Temperature ↑</Text>
            </TouchableOpacity>
          </View>

          {state.selectedChemical !== 'none' && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={reset}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color="white" />
              <Text style={styles.resetButtonText}>Reset Experiment</Text>
            </TouchableOpacity>
          )}

          <View style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>Theory</Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Endothermic Process:</Text> Absorbs heat from surroundings, temperature decreases (ΔH {'>'} 0)
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Exothermic Process:</Text> Releases heat to surroundings, temperature increases (ΔH {'<'} 0)
            </Text>
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  simulationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  beakerContainer: {
    position: 'relative',
    width: 140,
    height: 160,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaker: {
    width: 100,
    height: 120,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#4A90E2',
    position: 'absolute',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  waterLevel: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  chemicalIndicator: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
  },
  chemicalText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  beakerIcon: {
    position: 'absolute',
    opacity: 0.3,
  },
  thermometerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 8,
  },
  reactingText: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  resultCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultExplanation: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  chemicalsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chemicalButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chemicalButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  chemicalButtonDisabled: {
    opacity: 0.5,
  },
  chemicalButtonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chemicalFormula: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  chemicalHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  theoryCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  theoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 12,
  },
  theoryText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});
