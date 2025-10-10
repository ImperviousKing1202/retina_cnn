import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Droplets, FlaskRound, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Sample = 'none' | 'resorcinol' | 'isopropyl' | 'butyl' | 'octyl';
type TestType = 'none' | 'solubility' | 'iodoform' | 'ferric-chloride';

interface TestResult {
  sample: Sample;
  test: TestType;
  observation: string;
  interpretation: string;
}

const sampleData: Record<Sample, { 
  name: string; 
  type: string;
  solubility: string;
  iodoform: string;
  ferricChloride: string;
}> = {
  'none': { name: '', type: '', solubility: '', iodoform: '', ferricChloride: '' },
  'resorcinol': { 
    name: 'Resorcinol/Catechol (Phenol)', 
    type: 'Phenolic compound',
    solubility: 'Homogenous solution (soluble)',
    iodoform: 'No yellow precipitate',
    ferricChloride: 'Color change observed (violet/green complex)'
  },
  'isopropyl': { 
    name: 'Isopropyl Alcohol (2°)', 
    type: 'Secondary alcohol',
    solubility: 'Homogenous solution (soluble)',
    iodoform: 'Yellow precipitate formed (positive test)',
    ferricChloride: 'No color change'
  },
  'butyl': { 
    name: 'Butyl Alcohol (1° or 2°)', 
    type: 'Primary/Secondary alcohol',
    solubility: 'Homogenous solution (soluble)',
    iodoform: 'No yellow precipitate (if 1°) or Yellow precipitate (if 2° with CH₃CHOH-)',
    ferricChloride: 'No color change'
  },
  'octyl': { 
    name: 'Octyl Alcohol (Long-chain)', 
    type: 'Long-chain primary alcohol',
    solubility: 'Two separate layers (immiscible)',
    iodoform: 'No yellow precipitate',
    ferricChloride: 'No color change'
  },
};

export default function AlcoholProperties() {
  const insets = useSafeAreaInsets();
  const [selectedSample, setSelectedSample] = useState<Sample>('none');
  const [selectedTest, setSelectedTest] = useState<TestType>('none');
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const performTest = () => {
    if (selectedSample === 'none' || selectedTest === 'none') return;

    setIsTesting(true);
    
    setTimeout(() => {
      const sample = sampleData[selectedSample];
      let observation = '';
      let interpretation = '';

      switch (selectedTest) {
        case 'solubility':
          observation = sample.solubility;
          interpretation = observation.includes('Two separate layers') 
            ? 'Low solubility - Long hydrocarbon chain'
            : 'High solubility - Short chain or polar groups';
          break;
        case 'iodoform':
          observation = sample.iodoform;
          interpretation = observation.includes('Yellow precipitate') 
            ? 'Positive - Contains CH₃CHOH- group'
            : 'Negative - No methyl ketone or secondary alcohol with CH₃CHOH-';
          break;
        case 'ferric-chloride':
          observation = sample.ferricChloride;
          interpretation = observation.includes('Color change') 
            ? 'Positive - Phenolic compound present'
            : 'Negative - Not a phenol';
          break;
      }

      setResult({
        sample: selectedSample,
        test: selectedTest,
        observation,
        interpretation,
      });
      setIsTesting(false);
    }, 2000);
  };

  const reset = () => {
    setSelectedSample('none');
    setSelectedTest('none');
    setResult(null);
    setIsTesting(false);
  };

  const getVisualRepresentation = () => {
    if (!result) return null;

    if (result.test === 'solubility') {
      const isMiscible = !result.observation.includes('Two separate layers');
      return (
        <View style={styles.beakerContainer}>
          <View style={styles.beaker}>
            {isMiscible ? (
              <View style={[styles.layer, { backgroundColor: '#B3E5FC', height: '80%' }]}>
                <Text style={styles.layerText}>Homogenous</Text>
              </View>
            ) : (
              <>
                <View style={[styles.layer, { backgroundColor: '#FFF9C4', height: '40%' }]}>
                  <Text style={styles.layerText}>Alcohol</Text>
                </View>
                <View style={[styles.layer, { backgroundColor: '#B3E5FC', height: '40%' }]}>
                  <Text style={styles.layerText}>Water</Text>
                </View>
              </>
            )}
          </View>
        </View>
      );
    }

    if (result.test === 'iodoform') {
      const hasYellowPpt = result.observation.includes('Yellow precipitate');
      return (
        <View style={styles.testTubeVisual}>
          <View style={[styles.solution, { backgroundColor: hasYellowPpt ? '#FFF59D' : '#E3F2FD' }]}>
            {hasYellowPpt && (
              <View style={styles.precipitate}>
                <Text style={styles.precipitateText}>Yellow ppt</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (result.test === 'ferric-chloride') {
      const hasColorChange = result.observation.includes('Color change');
      return (
        <View style={styles.testTubeVisual}>
          <View style={[styles.solution, { backgroundColor: hasColorChange ? '#9C27B0' : '#FFF9C4' }]}>
            <Text style={[styles.solutionText, { color: hasColorChange ? 'white' : '#333' }]}>
              {hasColorChange ? 'Colored complex' : 'No change'}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Alcohol Properties',
          headerStyle: { backgroundColor: '#F5A623' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#F5A623', '#E8931E']}
        style={styles.header}
      >
        <FlaskRound size={32} color="white" />
        <Text style={styles.headerTitle}>Alcohol Properties</Text>
        <Text style={styles.headerSubtitle}>Classification Tests</Text>
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
              Simulate tests to classify different types of alcohols based on their chemical properties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Sample:</Text>
            {(Object.keys(sampleData) as Sample[])
              .filter(s => s !== 'none')
              .map((sample) => (
                <TouchableOpacity
                  key={sample}
                  style={[
                    styles.sampleButton,
                    selectedSample === sample && styles.sampleButtonSelected,
                    result !== null && styles.buttonDisabled
                  ]}
                  onPress={() => setSelectedSample(sample)}
                  disabled={result !== null}
                  activeOpacity={0.7}
                >
                  <Droplets size={20} color={selectedSample === sample ? '#F5A623' : '#666'} />
                  <View style={styles.sampleInfo}>
                    <Text style={[
                      styles.sampleName,
                      selectedSample === sample && styles.sampleNameSelected
                    ]}>
                      {sampleData[sample].name}
                    </Text>
                    <Text style={styles.sampleType}>{sampleData[sample].type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select Test:</Text>
            
            <TouchableOpacity
              style={[
                styles.testButton,
                selectedTest === 'solubility' && styles.testButtonSelected,
                result !== null && styles.buttonDisabled
              ]}
              onPress={() => setSelectedTest('solubility')}
              disabled={result !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonTitle}>Solubility Test</Text>
              <Text style={styles.testButtonDesc}>
                Mix with water - Check for layers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testButton,
                selectedTest === 'iodoform' && styles.testButtonSelected,
                result !== null && styles.buttonDisabled
              ]}
              onPress={() => setSelectedTest('iodoform')}
              disabled={result !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonTitle}>Iodoform Test</Text>
              <Text style={styles.testButtonDesc}>
                Tests for CH₃CHOH- group (yellow precipitate)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testButton,
                selectedTest === 'ferric-chloride' && styles.testButtonSelected,
                result !== null && styles.buttonDisabled
              ]}
              onPress={() => setSelectedTest('ferric-chloride')}
              disabled={result !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonTitle}>Ferric Chloride Test</Text>
              <Text style={styles.testButtonDesc}>
                Tests for phenolic compounds (color change)
              </Text>
            </TouchableOpacity>
          </View>

          {selectedSample !== 'none' && selectedTest !== 'none' && result === null && (
            <TouchableOpacity
              style={styles.performButton}
              onPress={performTest}
              disabled={isTesting}
              activeOpacity={0.7}
            >
              <FlaskRound size={20} color="white" />
              <Text style={styles.performButtonText}>
                {isTesting ? 'Testing...' : 'Perform Test'}
              </Text>
            </TouchableOpacity>
          )}

          {result && (
            <>
              <View style={styles.visualizationCard}>
                <Text style={styles.visualTitle}>Visual Result:</Text>
                {getVisualRepresentation()}
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Test Results</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Sample:</Text>
                  <Text style={styles.resultValue}>{sampleData[result.sample].name}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Test:</Text>
                  <Text style={styles.resultValue}>
                    {result.test === 'solubility' ? 'Solubility Test' :
                     result.test === 'iodoform' ? 'Iodoform Test' :
                     'Ferric Chloride Test'}
                  </Text>
                </View>
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Observation:</Text>
                  <Text style={styles.resultObservation}>{result.observation}</Text>
                </View>
                <View style={styles.resultSection}>
                  <Text style={styles.resultLabel}>Interpretation:</Text>
                  <Text style={styles.resultInterpretation}>{result.interpretation}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={reset}
                activeOpacity={0.7}
              >
                <RotateCcw size={20} color="white" />
                <Text style={styles.resetButtonText}>Reset Test</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>Theory</Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Solubility:</Text> Short-chain alcohols are water-soluble; long chains are not
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Iodoform Test:</Text> Positive for compounds with CH₃CHOH- group
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Ferric Chloride:</Text> Phenols form colored complexes with FeCl₃
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sampleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sampleButtonSelected: {
    borderColor: '#F5A623',
    backgroundColor: '#FFF8E1',
  },
  sampleInfo: {
    flex: 1,
  },
  sampleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sampleNameSelected: {
    color: '#F5A623',
    fontWeight: 'bold',
  },
  sampleType: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  testButton: {
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
  testButtonSelected: {
    borderColor: '#F5A623',
    backgroundColor: '#FFF8E1',
  },
  testButtonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testButtonDesc: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  performButton: {
    backgroundColor: '#F5A623',
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
  performButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  visualizationCard: {
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
  visualTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  beakerContainer: {
    alignItems: 'center',
  },
  beaker: {
    width: 120,
    height: 160,
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  layer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  testTubeVisual: {
    alignItems: 'center',
  },
  solution: {
    width: 80,
    height: 140,
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  solutionText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  precipitate: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  precipitateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  resultCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultSection: {
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  resultObservation: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultInterpretation: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
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
