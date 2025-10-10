import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Droplets, Microscope, RotateCcw, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Sample {
  id: string;
  name: string;
  actualConcentration: number;
}

interface Measurement {
  sample: Sample;
  absorbance: number;
  calculatedConcentration: number;
}

const samples: Sample[] = [
  { id: 'bsa1', name: 'BSA Standard 1', actualConcentration: 0.2 },
  { id: 'bsa2', name: 'BSA Standard 2', actualConcentration: 0.5 },
  { id: 'bsa3', name: 'BSA Standard 3', actualConcentration: 1.0 },
  { id: 'bsa4', name: 'BSA Standard 4', actualConcentration: 1.5 },
  { id: 'unknown1', name: 'Unknown Sample 1', actualConcentration: 0.75 },
  { id: 'unknown2', name: 'Unknown Sample 2', actualConcentration: 1.2 },
  { id: 'serum', name: 'Serum Sample', actualConcentration: 0.9 },
  { id: 'lysate', name: 'Cell Lysate', actualConcentration: 1.35 }
];

export default function ProteinAssay() {
  const insets = useSafeAreaInsets();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measuring, setMeasuring] = useState<boolean>(false);

  const performAssay = () => {
    if (!selectedSample) return;

    setMeasuring(true);
    setTimeout(() => {
      const absorbance = selectedSample.actualConcentration * 0.65 + (Math.random() - 0.5) * 0.05;
      const calculatedConc = absorbance / 0.65;
      
      const newMeasurement: Measurement = {
        sample: selectedSample,
        absorbance: absorbance,
        calculatedConcentration: calculatedConc
      };

      setMeasurements(prev => {
        const filtered = prev.filter(m => m.sample.id !== selectedSample.id);
        return [...filtered, newMeasurement];
      });
      
      setMeasuring(false);
    }, 2000);
  };

  const reset = () => {
    setSelectedSample(null);
    setMeasurements([]);
    setMeasuring(false);
  };

  const getAbsorbanceColor = (absorbance: number) => {
    const intensity = Math.min(absorbance / 1.5, 1);
    const r = Math.floor(0 + intensity * 0);
    const g = Math.floor(100 + intensity * 50);
    const b = Math.floor(200 + intensity * 55);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const calculateAccuracy = (measured: number, actual: number) => {
    const error = Math.abs(measured - actual);
    const percentError = (error / actual) * 100;
    return percentError.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Protein Assay',
          headerStyle: { backgroundColor: '#7ED321' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#7ED321', '#5BA517']}
        style={styles.header}
      >
        <Microscope size={32} color="white" />
        <Text style={styles.headerTitle}>Bradford Protein Assay</Text>
        <Text style={styles.headerSubtitle}>Determine protein concentration</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Sample</Text>
          <View style={styles.samplesGrid}>
            {samples.map((sample) => (
              <TouchableOpacity
                key={sample.id}
                style={[
                  styles.sampleButton,
                  selectedSample?.id === sample.id && styles.selectedSample,
                  sample.id.includes('bsa') && styles.standardSample
                ]}
                onPress={() => setSelectedSample(sample)}
              >
                <Text style={styles.sampleName}>{sample.name}</Text>
                {sample.id.includes('bsa') && (
                  <Text style={styles.standardLabel}>{sample.actualConcentration} mg/mL</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spectrophotometer</Text>
          <View style={styles.spectrophotometer}>
            <View style={styles.cuvetteHolder}>
              <View style={[
                styles.cuvette,
                selectedSample && { backgroundColor: getAbsorbanceColor(selectedSample.actualConcentration * 0.65) }
              ]}>
                {selectedSample && (
                  <Text style={styles.cuvetteLabel}>{selectedSample.name}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.display}>
              <Text style={styles.displayLabel}>Absorbance (595 nm)</Text>
              <Text style={styles.displayValue}>
                {measuring ? 'Reading...' : 
                 measurements.find(m => m.sample.id === selectedSample?.id)?.absorbance.toFixed(3) || '---'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.measureButton,
              (!selectedSample || measuring) && styles.disabledButton
            ]}
            onPress={performAssay}
            disabled={!selectedSample || measuring}
          >
            <Droplets size={24} color="white" />
            <Text style={styles.controlButtonText}>
              {measuring ? 'Measuring...' : 'Run Assay'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {measurements.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <TrendingUp size={24} color="#7ED321" />
              <Text style={styles.sectionTitle}>Results</Text>
            </View>
            
            <View style={styles.resultsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Sample</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>A₅₉₅</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Conc.</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Error</Text>
              </View>
              
              {measurements.map((measurement) => (
                <View key={measurement.sample.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                    {measurement.sample.name}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {measurement.absorbance.toFixed(3)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {measurement.calculatedConcentration.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {calculateAccuracy(measurement.calculatedConcentration, measurement.sample.actualConcentration)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Bradford Assay</Text>
          <Text style={styles.infoText}>
            The Bradford assay is a colorimetric protein assay based on the binding of Coomassie Brilliant Blue G-250 dye 
            to proteins. The dye undergoes a color change from brown to blue upon binding, with maximum absorbance at 595 nm. 
            The assay is quick, sensitive, and widely used for protein quantification.
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
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sampleButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  standardSample: {
    backgroundColor: '#f0f8ff',
  },
  selectedSample: {
    borderColor: '#7ED321',
    borderWidth: 3,
  },
  sampleName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  standardLabel: {
    fontSize: 12,
    color: '#666',
  },
  spectrophotometer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cuvetteHolder: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cuvette: {
    width: 60,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  cuvetteLabel: {
    fontSize: 10,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  display: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  displayLabel: {
    fontSize: 12,
    color: '#00ff00',
    marginBottom: 8,
  },
  displayValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'monospace',
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
    backgroundColor: '#7ED321',
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
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTable: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#7ED321',
    padding: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
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
