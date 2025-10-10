import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Droplet, RotateCcw, TestTube2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Sample = 'none' | 'olive-oil' | 'coconut-oil' | 'fat' | 'palm-oil' | 'sunflower-oil' | 'water';
type TestType = 'none' | 'bromine' | 'baeyer';

interface TestResult {
  sample: Sample;
  test: TestType;
  isUnsaturated: boolean;
  observation: string;
}

const sampleData: Record<Sample, { name: string; unsaturated: boolean }> = {
  'none': { name: '', unsaturated: false },
  'olive-oil': { name: 'Olive Oil', unsaturated: true },
  'coconut-oil': { name: 'Coconut Oil', unsaturated: false },
  'fat': { name: 'Fat', unsaturated: false },
  'palm-oil': { name: 'Palm Oil', unsaturated: false },
  'sunflower-oil': { name: 'Sunflower Oil', unsaturated: true },
  'water': { name: 'Water (Control)', unsaturated: false },
};

export default function UnsaturationTests() {
  const insets = useSafeAreaInsets();
  const [selectedSample, setSelectedSample] = useState<Sample>('none');
  const [selectedTest, setSelectedTest] = useState<TestType>('none');
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const performTest = () => {
    if (selectedSample === 'none' || selectedTest === 'none') return;

    setIsTesting(true);
    
    setTimeout(() => {
      const isUnsaturated = sampleData[selectedSample].unsaturated;
      let observation = '';

      if (selectedTest === 'bromine') {
        observation = isUnsaturated 
          ? 'Brown/orange-red color immediately turned COLORLESS (decolorization)'
          : 'Brown/orange-red color PERSISTS (no reaction)';
      } else {
        observation = isUnsaturated 
          ? 'Purple solution changed to BROWN (MnO₂ precipitate formed)'
          : 'Purple color PERSISTS (no reaction)';
      }

      setResult({
        sample: selectedSample,
        test: selectedTest,
        isUnsaturated,
        observation,
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

  const getTestTubeColor = () => {
    if (result === null) {
      if (selectedTest === 'bromine') return '#FF6B35';
      if (selectedTest === 'baeyer') return '#9C27B0';
      return '#E3F2FD';
    }

    if (selectedTest === 'bromine') {
      return result.isUnsaturated ? '#F0F0F0' : '#FF6B35';
    } else {
      return result.isUnsaturated ? '#8B4513' : '#9C27B0';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Unsaturation Tests',
          headerStyle: { backgroundColor: '#F5A623' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#F5A623', '#E8931E']}
        style={styles.header}
      >
        <TestTube2 size={32} color="white" />
        <Text style={styles.headerTitle}>Unsaturation Tests</Text>
        <Text style={styles.headerSubtitle}>Testing for C=C Double Bonds</Text>
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
              Simulate chemical tests for carbon-carbon double bonds (unsaturation) in various oils and fats.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Sample:</Text>
            <View style={styles.samplesGrid}>
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
                    <Droplet size={20} color={selectedSample === sample ? '#F5A623' : '#666'} />
                    <Text style={[
                      styles.sampleButtonText,
                      selectedSample === sample && styles.sampleButtonTextSelected
                    ]}>
                      {sampleData[sample].name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select Test:</Text>
            <TouchableOpacity
              style={[
                styles.testButton,
                selectedTest === 'bromine' && styles.testButtonSelected,
                result !== null && styles.buttonDisabled
              ]}
              onPress={() => setSelectedTest('bromine')}
              disabled={result !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonTitle}>Bromine Test</Text>
              <Text style={styles.testButtonDesc}>
                Unsaturated: Brown/orange-red → Colorless
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testButton,
                selectedTest === 'baeyer' && styles.testButtonSelected,
                result !== null && styles.buttonDisabled
              ]}
              onPress={() => setSelectedTest('baeyer')}
              disabled={result !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.testButtonTitle}>Baeyer&apos;s Test (KMnO₄)</Text>
              <Text style={styles.testButtonDesc}>
                Unsaturated: Purple → Brown (MnO₂)
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
              <TestTube2 size={20} color="white" />
              <Text style={styles.performButtonText}>
                {isTesting ? 'Testing...' : 'Perform Test'}
              </Text>
            </TouchableOpacity>
          )}

          {(selectedTest !== 'none' || result !== null) && (
            <View style={styles.visualContainer}>
              <Text style={styles.visualTitle}>Test Tube:</Text>
              <View style={styles.testTubeContainer}>
                <View style={[styles.testTube, { backgroundColor: getTestTubeColor() }]}>
                  {isTesting && (
                    <Text style={styles.testingText}>Reacting...</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {result && (
            <View style={styles.resultContainer}>
              <View style={[
                styles.resultCard,
                { backgroundColor: result.isUnsaturated ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.resultTitle,
                  { color: result.isUnsaturated ? '#2E7D32' : '#E65100' }
                ]}>
                  RESULT: {result.isUnsaturated ? 'UNSATURATED' : 'SATURATED'}
                </Text>
                <Text style={styles.resultObservation}>
                  Observation: {result.observation}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={reset}
                activeOpacity={0.7}
              >
                <RotateCcw size={20} color="white" />
                <Text style={styles.resetButtonText}>Reset Test</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>Theory</Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Unsaturated compounds</Text> contain C=C double bonds that react with Br₂ and KMnO₄
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Bromine Test:</Text> Br₂ adds across double bond, losing its color
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Baeyer&apos;s Test:</Text> KMnO₄ oxidizes double bond, forming brown MnO₂
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Saturated compounds</Text> have no double bonds and show no reaction
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
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sampleButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '47%',
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
  sampleButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  sampleButtonTextSelected: {
    color: '#F5A623',
    fontWeight: 'bold',
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
  visualContainer: {
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
  testTubeContainer: {
    alignItems: 'center',
  },
  testTube: {
    width: 60,
    height: 150,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultObservation: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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