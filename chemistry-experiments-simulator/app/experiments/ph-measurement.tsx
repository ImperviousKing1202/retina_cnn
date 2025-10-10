import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Beaker, Droplets, Gauge, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Solution {
  id: string;
  name: string;
  pH: number;
  color: string;
  type: 'acid' | 'neutral' | 'base';
}

const solutions: Solution[] = [
  { id: 'hcl', name: 'HCl (0.1M)', pH: 1.0, color: '#ff4444', type: 'acid' },
  { id: 'vinegar', name: 'Vinegar', pH: 2.4, color: '#ff6666', type: 'acid' },
  { id: 'lemon', name: 'Lemon Juice', pH: 2.0, color: '#ffaa44', type: 'acid' },
  { id: 'coffee', name: 'Coffee', pH: 5.0, color: '#8b4513', type: 'acid' },
  { id: 'milk', name: 'Milk', pH: 6.5, color: '#f5f5dc', type: 'acid' },
  { id: 'water', name: 'Pure Water', pH: 7.0, color: '#e0f7fa', type: 'neutral' },
  { id: 'blood', name: 'Blood', pH: 7.4, color: '#dc143c', type: 'base' },
  { id: 'baking_soda', name: 'Baking Soda', pH: 9.0, color: '#87ceeb', type: 'base' },
  { id: 'ammonia', name: 'Ammonia', pH: 11.0, color: '#add8e6', type: 'base' },
  { id: 'naoh', name: 'NaOH (0.1M)', pH: 13.0, color: '#4444ff', type: 'base' }
];

const bufferSolutions = [
  { pH: 4.0, name: 'pH 4.0 Buffer' },
  { pH: 7.0, name: 'pH 7.0 Buffer' },
  { pH: 10.0, name: 'pH 10.0 Buffer' }
];

export default function PHMeasurement() {
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [measuredPH, setMeasuredPH] = useState<number | null>(null);
  const [calibrationStep, setCalibrationStep] = useState<number>(0);
  const [measurements, setMeasurements] = useState<Array<{solution: Solution, pH: number}>>([]);

  const calibrateMeter = () => {
    if (calibrationStep < bufferSolutions.length - 1) {
      setCalibrationStep(prev => prev + 1);
    } else {
      setIsCalibrated(true);
      setCalibrationStep(0);
    }
  };

  const measurePH = () => {
    if (!selectedSolution || !isCalibrated) return;
    
    const actualPH = selectedSolution.pH + (Math.random() - 0.5) * 0.2;
    setMeasuredPH(actualPH);
    
    const existingIndex = measurements.findIndex(m => m.solution.id === selectedSolution.id);
    if (existingIndex >= 0) {
      const updatedMeasurements = [...measurements];
      updatedMeasurements[existingIndex] = { solution: selectedSolution, pH: actualPH };
      setMeasurements(updatedMeasurements);
    } else {
      setMeasurements(prev => [...prev, { solution: selectedSolution, pH: actualPH }]);
    }
  };

  const reset = () => {
    setSelectedSolution(null);
    setIsCalibrated(false);
    setMeasuredPH(null);
    setCalibrationStep(0);
    setMeasurements([]);
  };

  const getPHColor = (pH: number) => {
    if (pH < 3) return '#ff0000';
    if (pH < 5) return '#ff4400';
    if (pH < 6) return '#ff8800';
    if (pH < 7) return '#ffaa00';
    if (pH === 7) return '#00ff00';
    if (pH < 8) return '#00aa00';
    if (pH < 10) return '#0088ff';
    if (pH < 12) return '#0044ff';
    return '#0000ff';
  };

  const getPHDescription = (pH: number) => {
    if (pH < 3) return 'Strongly Acidic';
    if (pH < 7) return 'Acidic';
    if (pH === 7) return 'Neutral';
    if (pH < 11) return 'Basic';
    return 'Strongly Basic';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'pH Measurement',
          headerStyle: { backgroundColor: '#9013FE' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#9013FE', '#7B1FA2']}
        style={styles.header}
      >
        <Gauge size={32} color="white" />
        <Text style={styles.headerTitle}>pH Measurement</Text>
        <Text style={styles.headerSubtitle}>Calibrate & measure solution pH</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>pH Meter Calibration</Text>
          <View style={styles.calibrationContainer}>
            <Text style={styles.calibrationStatus}>
              Status: {isCalibrated ? '✅ Calibrated' : `📋 Step ${calibrationStep + 1}/3`}
            </Text>
            
            {!isCalibrated && (
              <View style={styles.calibrationStep}>
                <Text style={styles.bufferLabel}>
                  Use {bufferSolutions[calibrationStep].name}
                </Text>
                <TouchableOpacity 
                  style={styles.calibrateButton}
                  onPress={calibrateMeter}
                >
                  <Text style={styles.calibrateButtonText}>
                    {calibrationStep === bufferSolutions.length - 1 ? 'Complete Calibration' : 'Next Buffer'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Solution</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.solutionsRow}>
              {solutions.map((solution) => (
                <TouchableOpacity
                  key={solution.id}
                  style={[
                    styles.solutionVial,
                    { backgroundColor: solution.color },
                    selectedSolution?.id === solution.id && styles.selectedSolution
                  ]}
                  onPress={() => setSelectedSolution(solution)}
                >
                  <Text style={styles.solutionLabel}>{solution.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>pH Meter Reading</Text>
          <View style={styles.meterContainer}>
            <View style={styles.meterDisplay}>
              <Gauge size={40} color="#333" />
              <Text style={styles.pHValue}>
                {measuredPH !== null ? measuredPH.toFixed(2) : '--.-'}
              </Text>
              {measuredPH !== null && (
                <Text style={[styles.pHDescription, { color: getPHColor(measuredPH) }]}>
                  {getPHDescription(measuredPH)}
                </Text>
              )}
            </View>
            
            {selectedSolution && (
              <View style={styles.sampleInfo}>
                <Beaker size={24} color="#666" />
                <Text style={styles.sampleName}>{selectedSolution.name}</Text>
                <Text style={styles.actualPH}>Actual pH: {selectedSolution.pH}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.measureButton,
              (!selectedSolution || !isCalibrated) && styles.disabledButton
            ]}
            onPress={measurePH}
            disabled={!selectedSolution || !isCalibrated}
          >
            <Droplets size={24} color="white" />
            <Text style={styles.controlButtonText}>Measure pH</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {measurements.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Measurement Results</Text>
            {measurements.map((measurement, index) => (
              <View key={measurement.solution.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultSolution}>{measurement.solution.name}</Text>
                  <View style={styles.resultValues}>
                    <Text style={[styles.resultPH, { color: getPHColor(measurement.pH) }]}>
                      pH: {measurement.pH.toFixed(2)}
                    </Text>
                    <Text style={styles.resultAccuracy}>
                      Error: ±{Math.abs(measurement.pH - measurement.solution.pH).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.pHScaleContainer}>
          <Text style={styles.sectionTitle}>pH Scale Reference</Text>
          <View style={styles.pHScale}>
            {Array.from({ length: 15 }, (_, i) => (
              <View key={i} style={[styles.pHScaleItem, { backgroundColor: getPHColor(i) }]}>
                <Text style={styles.pHScaleText}>{i}</Text>
              </View>
            ))}
          </View>
          <View style={styles.pHLabels}>
            <Text style={styles.pHLabel}>Acidic</Text>
            <Text style={styles.pHLabel}>Neutral</Text>
            <Text style={styles.pHLabel}>Basic</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About pH Measurement</Text>
          <Text style={styles.infoText}>
            pH measures the concentration of hydrogen ions in a solution. The scale ranges from 0-14, 
            where 7 is neutral, below 7 is acidic, and above 7 is basic. Proper calibration with 
            standard buffer solutions ensures accurate measurements.
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
  calibrationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calibrationStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  calibrationStep: {
    alignItems: 'center',
  },
  bufferLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  calibrateButton: {
    backgroundColor: '#9013FE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  calibrateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  solutionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  solutionVial: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedSolution: {
    borderColor: '#9013FE',
    borderWidth: 3,
  },
  solutionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  meterContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meterDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pHValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  pHDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  sampleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  sampleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    marginRight: 12,
  },
  actualPH: {
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
  measureButton: {
    backgroundColor: '#4CAF50',
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
  },
  resultSolution: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resultValues: {
    alignItems: 'flex-end',
  },
  resultPH: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultAccuracy: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pHScaleContainer: {
    marginBottom: 20,
  },
  pHScale: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  pHScaleItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pHScaleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  pHLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pHLabel: {
    fontSize: 14,
    fontWeight: 'bold',
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