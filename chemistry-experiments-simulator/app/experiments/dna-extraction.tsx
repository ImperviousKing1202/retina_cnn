import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { CheckCircle, Dna, Droplets, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExtractionStep {
  id: number;
  title: string;
  description: string;
  action: string;
  completed: boolean;
}

const initialSteps: ExtractionStep[] = [
  {
    id: 1,
    title: 'Cell Lysis',
    description: 'Add lysis buffer to break down cell membranes and release DNA',
    action: 'Add Lysis Buffer',
    completed: false
  },
  {
    id: 2,
    title: 'Protein Removal',
    description: 'Add protease to digest proteins and separate them from DNA',
    action: 'Add Protease',
    completed: false
  },
  {
    id: 3,
    title: 'DNA Precipitation',
    description: 'Add cold ethanol to precipitate DNA out of solution',
    action: 'Add Ethanol',
    completed: false
  },
  {
    id: 4,
    title: 'DNA Collection',
    description: 'Spool the precipitated DNA using a glass rod',
    action: 'Collect DNA',
    completed: false
  },
  {
    id: 5,
    title: 'DNA Washing',
    description: 'Wash DNA with 70% ethanol to remove salts and impurities',
    action: 'Wash DNA',
    completed: false
  },
  {
    id: 6,
    title: 'DNA Resuspension',
    description: 'Dissolve purified DNA in TE buffer for storage',
    action: 'Resuspend DNA',
    completed: false
  }
];

export default function DNAExtraction() {
  const insets = useSafeAreaInsets();
  const [steps, setSteps] = useState<ExtractionStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [dnaYield, setDnaYield] = useState<number | null>(null);

  const performStep = () => {
    if (currentStep >= steps.length) return;

    setExtracting(true);
    setTimeout(() => {
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      
      if (currentStep === steps.length - 1) {
        const yield_ug = 15 + Math.random() * 10;
        setDnaYield(yield_ug);
      }
      
      setCurrentStep(prev => prev + 1);
      setExtracting(false);
    }, 2000);
  };

  const reset = () => {
    setSteps(initialSteps);
    setCurrentStep(0);
    setExtracting(false);
    setDnaYield(null);
  };

  const getStepColor = (step: ExtractionStep, index: number) => {
    if (step.completed) return '#4CAF50';
    if (index === currentStep) return '#2196F3';
    return '#ccc';
  };

  const getTubeColor = () => {
    if (currentStep === 0) return '#f0f0f0';
    if (currentStep === 1) return '#ffe0e0';
    if (currentStep === 2) return '#e0e0ff';
    if (currentStep >= 3) return '#ffffff';
    return '#f0f0f0';
  };

  const showDNA = currentStep >= 3;
  const isComplete = currentStep >= steps.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'DNA Extraction',
          headerStyle: { backgroundColor: '#7ED321' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#7ED321', '#5BA517']}
        style={styles.header}
      >
        <Dna size={32} color="white" />
        <Text style={styles.headerTitle}>DNA Extraction</Text>
        <Text style={styles.headerSubtitle}>Extract DNA from cells</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Extraction Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
          </Text>
        </View>

        <View style={styles.visualizationContainer}>
          <View style={styles.tubeContainer}>
            <View style={[styles.tube, { backgroundColor: getTubeColor() }]}>
              {showDNA && (
                <View style={styles.dnaStrands}>
                  <Text style={styles.dnaText}>🧬</Text>
                </View>
              )}
            </View>
            <Text style={styles.tubeLabel}>Extraction Tube</Text>
          </View>

          {isComplete && dnaYield && (
            <View style={styles.yieldContainer}>
              <CheckCircle size={32} color="#4CAF50" />
              <Text style={styles.yieldTitle}>Extraction Complete!</Text>
              <Text style={styles.yieldValue}>{dnaYield.toFixed(1)} μg DNA</Text>
              <Text style={styles.yieldLabel}>Total Yield</Text>
            </View>
          )}
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Extraction Steps</Text>
          {steps.map((step, index) => (
            <View 
              key={step.id} 
              style={[
                styles.stepCard,
                step.completed && styles.completedStep,
                index === currentStep && styles.activeStep
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: getStepColor(step, index) }]}>
                  {step.completed ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <Text style={styles.stepNumberText}>{step.id}</Text>
                  )}
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              
              {index === currentStep && !isComplete && (
                <TouchableOpacity 
                  style={[styles.stepButton, extracting && styles.disabledButton]}
                  onPress={performStep}
                  disabled={extracting}
                >
                  <Droplets size={20} color="white" />
                  <Text style={styles.stepButtonText}>
                    {extracting ? 'Processing...' : step.action}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About DNA Extraction</Text>
          <Text style={styles.infoText}>
            DNA extraction is a fundamental technique in molecular biology. The process involves breaking down cell 
            membranes (lysis), removing proteins and other contaminants, and precipitating the DNA using alcohol. 
            The extracted DNA can be used for PCR, sequencing, cloning, and other molecular biology applications.
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
  progressContainer: {
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
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7ED321',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  visualizationContainer: {
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
  tubeContainer: {
    alignItems: 'center',
  },
  tube: {
    width: 80,
    height: 150,
    borderWidth: 3,
    borderColor: '#333',
    borderTopWidth: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dnaStrands: {
    position: 'absolute',
    bottom: 20,
  },
  dnaText: {
    fontSize: 40,
  },
  tubeLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  yieldContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    width: '100%',
  },
  yieldTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
  yieldValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  yieldLabel: {
    fontSize: 14,
    color: '#558b2f',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  stepCard: {
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
  completedStep: {
    backgroundColor: '#f1f8f4',
  },
  activeStep: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7ED321',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  stepButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controlsContainer: {
    alignItems: 'center',
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
  resetButton: {
    backgroundColor: '#666',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7ED321',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#558b2f',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#33691e',
    lineHeight: 20,
  },
});
