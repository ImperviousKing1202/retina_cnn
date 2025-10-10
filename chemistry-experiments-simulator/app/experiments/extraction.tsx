import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Beaker, Droplets, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Layer {
  name: string;
  color: string;
  compounds: string[];
}

interface ExtractionStep {
  id: number;
  action: string;
  description: string;
  completed: boolean;
}

export default function LiquidLiquidExtraction() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [organicLayer, setOrganicLayer] = useState<Layer>({
    name: 'Organic Layer (Ether)',
    color: '#e8f5e9',
    compounds: ['Benzoic Acid', 'Naphthalene', 'Aniline']
  });
  const [aqueousLayer, setAqueousLayer] = useState<Layer>({
    name: 'Aqueous Layer',
    color: '#e3f2fd',
    compounds: []
  });
  const [extracting, setExtracting] = useState<boolean>(false);

  const steps: ExtractionStep[] = [
    {
      id: 1,
      action: 'Add NaOH Solution',
      description: 'Extract benzoic acid (acidic) into aqueous layer as sodium benzoate',
      completed: false
    },
    {
      id: 2,
      action: 'Separate Layers',
      description: 'Drain aqueous layer containing sodium benzoate',
      completed: false
    },
    {
      id: 3,
      action: 'Add HCl Solution',
      description: 'Extract aniline (basic) into aqueous layer as anilinium chloride',
      completed: false
    },
    {
      id: 4,
      action: 'Separate Layers',
      description: 'Drain aqueous layer containing anilinium chloride',
      completed: false
    },
    {
      id: 5,
      action: 'Dry Organic Layer',
      description: 'Naphthalene (neutral) remains in organic layer',
      completed: false
    }
  ];

  const performStep = () => {
    if (currentStep >= steps.length) return;

    setExtracting(true);
    setTimeout(() => {
      const newOrganic = { ...organicLayer };
      const newAqueous = { ...aqueousLayer };

      if (currentStep === 0) {
        newOrganic.compounds = newOrganic.compounds.filter(c => c !== 'Benzoic Acid');
        newAqueous.compounds = ['Sodium Benzoate'];
        newAqueous.color = '#fff9c4';
      } else if (currentStep === 1) {
        newAqueous.compounds = [];
        newAqueous.color = '#e3f2fd';
      } else if (currentStep === 2) {
        newOrganic.compounds = newOrganic.compounds.filter(c => c !== 'Aniline');
        newAqueous.compounds = ['Anilinium Chloride'];
        newAqueous.color = '#f3e5f5';
      } else if (currentStep === 3) {
        newAqueous.compounds = [];
        newAqueous.color = '#e3f2fd';
      } else if (currentStep === 4) {
        newOrganic.color = '#c8e6c9';
      }

      setOrganicLayer(newOrganic);
      setAqueousLayer(newAqueous);
      setCurrentStep(prev => prev + 1);
      setExtracting(false);
    }, 2000);
  };

  const reset = () => {
    setCurrentStep(0);
    setOrganicLayer({
      name: 'Organic Layer (Ether)',
      color: '#e8f5e9',
      compounds: ['Benzoic Acid', 'Naphthalene', 'Aniline']
    });
    setAqueousLayer({
      name: 'Aqueous Layer',
      color: '#e3f2fd',
      compounds: []
    });
    setExtracting(false);
  };

  const isComplete = currentStep >= steps.length;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Liquid-Liquid Extraction',
          headerStyle: { backgroundColor: '#F5A623' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#F5A623', '#E8931E']}
        style={styles.header}
      >
        <Beaker size={32} color="white" />
        <Text style={styles.headerTitle}>Liquid-Liquid Extraction</Text>
        <Text style={styles.headerSubtitle}>Separate organic compounds</Text>
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

        <View style={styles.separatoryFunnelContainer}>
          <Text style={styles.sectionTitle}>Separatory Funnel</Text>
          <View style={styles.funnel}>
            <View style={styles.funnelTop} />
            <View style={styles.funnelBody}>
              <View style={[styles.layer, styles.organicLayerView, { backgroundColor: organicLayer.color }]}>
                <Text style={styles.layerLabel}>{organicLayer.name}</Text>
                {organicLayer.compounds.map((compound, index) => (
                  <Text key={index} style={styles.compoundText}>• {compound}</Text>
                ))}
              </View>
              {aqueousLayer.compounds.length > 0 && (
                <View style={[styles.layer, styles.aqueousLayerView, { backgroundColor: aqueousLayer.color }]}>
                  <Text style={styles.layerLabel}>{aqueousLayer.name}</Text>
                  {aqueousLayer.compounds.map((compound, index) => (
                    <Text key={index} style={styles.compoundText}>• {compound}</Text>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.funnelBottom} />
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Extraction Steps</Text>
          {steps.map((step, index) => (
            <View 
              key={step.id}
              style={[
                styles.stepCard,
                index < currentStep && styles.completedStep,
                index === currentStep && styles.activeStep
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={[
                  styles.stepNumber,
                  { backgroundColor: index < currentStep ? '#4CAF50' : index === currentStep ? '#2196F3' : '#ccc' }
                ]}>
                  <Text style={styles.stepNumberText}>{step.id}</Text>
                </View>
                <Text style={styles.stepAction}>{step.action}</Text>
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
                    {extracting ? 'Extracting...' : 'Perform Step'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {isComplete && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>✓ Extraction Complete!</Text>
            <Text style={styles.resultText}>
              Successfully separated the mixture into individual components:
            </Text>
            <View style={styles.separatedCompounds}>
              <View style={styles.compoundBox}>
                <Text style={styles.compoundBoxTitle}>Benzoic Acid</Text>
                <Text style={styles.compoundBoxText}>Extracted with NaOH</Text>
              </View>
              <View style={styles.compoundBox}>
                <Text style={styles.compoundBoxTitle}>Aniline</Text>
                <Text style={styles.compoundBoxText}>Extracted with HCl</Text>
              </View>
              <View style={styles.compoundBox}>
                <Text style={styles.compoundBoxTitle}>Naphthalene</Text>
                <Text style={styles.compoundBoxText}>Remained in ether</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Liquid-Liquid Extraction</Text>
          <Text style={styles.infoText}>
            Liquid-liquid extraction is a method to separate compounds based on their solubility in two immiscible liquids. 
            By adjusting pH, acidic compounds can be extracted into basic aqueous solutions, and basic compounds into acidic 
            aqueous solutions, while neutral compounds remain in the organic layer. This technique is fundamental in organic 
            chemistry for purification and separation.
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
    backgroundColor: '#F5A623',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  separatoryFunnelContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  funnel: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  funnelTop: {
    width: 60,
    height: 20,
    backgroundColor: '#666',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  funnelBody: {
    width: 120,
    minHeight: 200,
    borderWidth: 3,
    borderColor: '#333',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  funnelBottom: {
    width: 20,
    height: 40,
    backgroundColor: '#666',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  layer: {
    width: '100%',
    padding: 12,
    justifyContent: 'center',
  },
  organicLayerView: {
    minHeight: 100,
  },
  aqueousLayerView: {
    minHeight: 80,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  layerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  compoundText: {
    fontSize: 11,
    color: '#666',
  },
  stepsContainer: {
    marginBottom: 20,
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
  stepAction: {
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
    backgroundColor: '#F5A623',
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
  resultContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#558b2f',
    marginBottom: 12,
  },
  separatedCompounds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compoundBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  compoundBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  compoundBoxText: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F5A623',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#bf360c',
    lineHeight: 20,
  },
});
