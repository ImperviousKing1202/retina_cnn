import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { CheckCircle, FlaskConical, Thermometer, Timer } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SynthesisStep {
  id: number;
  title: string;
  description: string;
  duration: number;
  temperature: number;
  completed: boolean;
}

const synthesisSteps: SynthesisStep[] = [
  {
    id: 1,
    title: 'Mix Reactants',
    description: 'Combine salicylic acid with acetic anhydride in round-bottom flask',
    duration: 5,
    temperature: 25,
    completed: false
  },
  {
    id: 2,
    title: 'Add Catalyst',
    description: 'Add 3 drops of phosphoric acid as catalyst',
    duration: 2,
    temperature: 25,
    completed: false
  },
  {
    id: 3,
    title: 'Heat Reaction',
    description: 'Heat the mixture to 85°C for 15 minutes',
    duration: 15,
    temperature: 85,
    completed: false
  },
  {
    id: 4,
    title: 'Cool Down',
    description: 'Cool the reaction mixture in ice bath',
    duration: 10,
    temperature: 5,
    completed: false
  },
  {
    id: 5,
    title: 'Crystallization',
    description: 'Add cold water to precipitate aspirin crystals',
    duration: 8,
    temperature: 5,
    completed: false
  },
  {
    id: 6,
    title: 'Filtration',
    description: 'Filter and wash the aspirin crystals',
    duration: 5,
    temperature: 25,
    completed: false
  }
];

export default function AspirinSynthesis() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<SynthesisStep[]>(synthesisSteps);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentTemp, setCurrentTemp] = useState<number>(25);
  const [yieldPercent, setYieldPercent] = useState<number>(0);
  const [purity, setPurity] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeCurrentStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  useEffect(() => {
    if (isRunning && currentStep < steps.length) {
      const targetTemp = steps[currentStep].temperature;
      const tempInterval = setInterval(() => {
        setCurrentTemp(prev => {
          const diff = targetTemp - prev;
          if (Math.abs(diff) < 1) return targetTemp;
          return prev + (diff > 0 ? 2 : -2);
        });
      }, 200);
      return () => clearInterval(tempInterval);
    }
  }, [isRunning, currentStep]);

  const startStep = () => {
    if (currentStep >= steps.length) {
      Alert.alert('Synthesis Complete', 'All steps have been completed!');
      return;
    }
    
    setIsRunning(true);
    setTimeRemaining(steps[currentStep].duration);
  };

  const completeCurrentStep = () => {
    setIsRunning(false);
    
    const updatedSteps = [...steps];
    updatedSteps[currentStep].completed = true;
    setSteps(updatedSteps);
    
    if (currentStep === steps.length - 1) {
      calculateYield();
      Alert.alert('Synthesis Complete!', `Aspirin synthesized successfully!\nYield: ${yieldPercent.toFixed(1)}%\nPurity: ${purity.toFixed(1)}%`);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const calculateYield = () => {
    const baseYield = 75;
    const tempPenalty = Math.abs(currentTemp - 85) * 0.5;
    const finalYield = Math.max(50, baseYield - tempPenalty + Math.random() * 10);
    const finalPurity = Math.max(85, 95 - tempPenalty + Math.random() * 5);
    
    setYieldPercent(finalYield);
    setPurity(finalPurity);
  };

  const reset = () => {
    setCurrentStep(0);
    setSteps(synthesisSteps.map(step => ({ ...step, completed: false })));
    setIsRunning(false);
    setTimeRemaining(0);
    setCurrentTemp(25);
    setYieldPercent(0);
    setPurity(0);
  };

  const getStepColor = (step: SynthesisStep, index: number) => {
    if (step.completed) return '#4CAF50';
    if (index === currentStep) return '#FF9800';
    return '#E0E0E0';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Aspirin Synthesis',
          headerStyle: { backgroundColor: '#F5A623' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#F5A623', '#E8931E']}
        style={styles.header}
      >
        <FlaskConical size={32} color="white" />
        <Text style={styles.headerTitle}>Aspirin Synthesis</Text>
        <Text style={styles.headerSubtitle}>C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + C₂H₄O₂</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Thermometer size={24} color="#FF5722" />
            <Text style={styles.statusLabel}>Temperature</Text>
            <Text style={styles.statusValue}>{currentTemp}°C</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Timer size={24} color="#2196F3" />
            <Text style={styles.statusLabel}>Time Left</Text>
            <Text style={styles.statusValue}>{timeRemaining}s</Text>
          </View>
          
          <View style={styles.statusItem}>
            <CheckCircle size={24} color="#4CAF50" />
            <Text style={styles.statusLabel}>Progress</Text>
            <Text style={styles.statusValue}>{currentStep}/{steps.length}</Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Synthesis Steps</Text>
          {steps.map((step, index) => (
            <View 
              key={step.id} 
              style={[
                styles.stepCard,
                { borderLeftColor: getStepColor(step, index) }
              ]}
            >
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>{step.id}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.completed && <CheckCircle size={20} color="#4CAF50" />}
              </View>
              
              <Text style={styles.stepDescription}>{step.description}</Text>
              
              <View style={styles.stepDetails}>
                <Text style={styles.stepDetail}>Duration: {step.duration} min</Text>
                <Text style={styles.stepDetail}>Temperature: {step.temperature}°C</Text>
              </View>
              
              {index === currentStep && !step.completed && (
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={startStep}
                  disabled={isRunning}
                >
                  <Text style={styles.startButtonText}>
                    {isRunning ? 'Running...' : 'Start Step'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {yieldPercent > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Synthesis Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Yield:</Text>
              <Text style={[styles.resultValue, { color: yieldPercent > 70 ? '#4CAF50' : '#FF9800' }]}>
                {yieldPercent.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Purity:</Text>
              <Text style={[styles.resultValue, { color: purity > 90 ? '#4CAF50' : '#FF9800' }]}>
                {purity.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.resultNote}>
              {yieldPercent > 70 && purity > 90 ? 
                '🎉 Excellent synthesis! High yield and purity achieved.' :
                '⚠️ Good synthesis, but could be optimized for better results.'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Reset Synthesis</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Aspirin Synthesis</Text>
          <Text style={styles.infoText}>
            Aspirin (acetylsalicylic acid) is synthesized through an esterification reaction between 
            salicylic acid and acetic anhydride. The reaction is catalyzed by phosphoric acid and 
            requires careful temperature control to maximize yield and purity.
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5A623',
    marginRight: 12,
    width: 24,
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
    marginBottom: 8,
    marginLeft: 36,
  },
  stepDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 36,
    marginBottom: 8,
  },
  stepDetail: {
    fontSize: 12,
    color: '#888',
  },
  startButton: {
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultNote: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
});