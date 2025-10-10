import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { RotateCcw, Target, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Sample {
  id: string;
  name: string;
  concentration: number;
  absorbance: number;
  color: string;
}

const standardSamples: Sample[] = [
  { id: '1', name: 'Standard 1', concentration: 0.1, absorbance: 0.15, color: '#ffcccc' },
  { id: '2', name: 'Standard 2', concentration: 0.2, absorbance: 0.30, color: '#ff9999' },
  { id: '3', name: 'Standard 3', concentration: 0.3, absorbance: 0.45, color: '#ff6666' },
  { id: '4', name: 'Standard 4', concentration: 0.4, absorbance: 0.60, color: '#ff3333' },
  { id: '5', name: 'Standard 5', concentration: 0.5, absorbance: 0.75, color: '#ff0000' },
];

export default function Spectrophotometry() {
  const [selectedWavelength, setSelectedWavelength] = useState<number>(520);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [unknownSample, setUnknownSample] = useState<Sample | null>(null);
  const [calibrationCurve, setCalibrationCurve] = useState<Sample[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [calculatedConcentration, setCalculatedConcentration] = useState<number>(0);

  useEffect(() => {
    setCalibrationCurve(standardSamples);
    generateUnknownSample();
  }, []);

  const generateUnknownSample = () => {
    const randomConc = 0.15 + Math.random() * 0.3;
    const absorbance = randomConc * 1.5 + (Math.random() - 0.5) * 0.05;
    const intensity = Math.min(255, Math.max(0, 255 - (absorbance * 300)));
    const color = `rgb(255, ${intensity}, ${intensity})`;
    
    setUnknownSample({
      id: 'unknown',
      name: 'Unknown Sample',
      concentration: randomConc,
      absorbance: Math.max(0, absorbance),
      color: color
    });
  };

  const analyzeUnknown = () => {
    if (!unknownSample) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      const slope = 1.5;
      const intercept = 0;
      const calculated = (unknownSample.absorbance - intercept) / slope;
      setCalculatedConcentration(calculated);
      setIsAnalyzing(false);
    }, 2000);
  };

  const selectSample = (sample: Sample) => {
    setCurrentSample(sample);
  };

  const reset = () => {
    setCurrentSample(null);
    setCalculatedConcentration(0);
    setIsAnalyzing(false);
    generateUnknownSample();
  };

  const renderCalibrationCurve = () => {
    const graphWidth = width - 80;
    const graphHeight = 200;
    const maxConc = 0.6;
    const maxAbs = 1.0;
    
    return (
      <Svg width={graphWidth + 60} height={graphHeight + 60}>
        <Line x1={40} y1={20} x2={40} y2={graphHeight + 20} stroke="#333" strokeWidth={2} />
        <Line x1={40} y1={graphHeight + 20} x2={graphWidth + 40} y2={graphHeight + 20} stroke="#333" strokeWidth={2} />
        
        <SvgText x={10} y={25} fontSize={12} fill="#666">1.0</SvgText>
        <SvgText x={10} y={graphHeight/2 + 20} fontSize={12} fill="#666">0.5</SvgText>
        <SvgText x={10} y={graphHeight + 25} fontSize={12} fill="#666">0.0</SvgText>
        
        <SvgText x={40} y={graphHeight + 40} fontSize={12} fill="#666">0.0</SvgText>
        <SvgText x={graphWidth/2 + 40} y={graphHeight + 40} fontSize={12} fill="#666">0.3</SvgText>
        <SvgText x={graphWidth + 40} y={graphHeight + 40} fontSize={12} fill="#666">0.6</SvgText>
        
        <SvgText x={graphWidth/2} y={graphHeight + 55} fontSize={14} fill="#333" textAnchor="middle">Concentration (M)</SvgText>
        <SvgText x={15} y={graphHeight/2} fontSize={14} fill="#333" textAnchor="middle" transform={`rotate(-90, 15, ${graphHeight/2})`}>Absorbance</SvgText>
        
        <Line 
          x1={40} 
          y1={graphHeight + 20} 
          x2={graphWidth + 40} 
          y2={20} 
          stroke="#4CAF50" 
          strokeWidth={2} 
          strokeDasharray="5,5"
        />
        
        {calibrationCurve.map((sample, index) => {
          const x = 40 + (sample.concentration / maxConc) * graphWidth;
          const y = graphHeight + 20 - (sample.absorbance / maxAbs) * graphHeight;
          return (
            <Circle 
              key={index} 
              cx={x} 
              cy={y} 
              r={6} 
              fill="#2196F3" 
              stroke="white" 
              strokeWidth={2}
            />
          );
        })}
        
        {unknownSample && calculatedConcentration > 0 && (
          <Circle 
            cx={40 + (calculatedConcentration / maxConc) * graphWidth}
            cy={graphHeight + 20 - (unknownSample.absorbance / maxAbs) * graphHeight}
            r={8} 
            fill="#FF5722" 
            stroke="white" 
            strokeWidth={2}
          />
        )}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'UV-Vis Spectrophotometry',
          headerStyle: { backgroundColor: '#9013FE' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#9013FE', '#7B1FA2']}
        style={styles.header}
      >
        <Zap size={32} color="white" />
        <Text style={styles.headerTitle}>UV-Vis Spectrophotometry</Text>
        <Text style={styles.headerSubtitle}>Beer-Lambert Law: A = εbc</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.instrumentContainer}>
          <Text style={styles.sectionTitle}>Spectrophotometer Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Wavelength:</Text>
            <View style={styles.wavelengthControls}>
              <TouchableOpacity 
                style={styles.wavelengthButton}
                onPress={() => setSelectedWavelength(Math.max(400, selectedWavelength - 10))}
              >
                <Text style={styles.wavelengthButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.wavelengthValue}>{selectedWavelength} nm</Text>
              <TouchableOpacity 
                style={styles.wavelengthButton}
                onPress={() => setSelectedWavelength(Math.min(700, selectedWavelength + 10))}
              >
                <Text style={styles.wavelengthButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.samplesContainer}>
          <Text style={styles.sectionTitle}>Standard Samples</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.samplesRow}>
              {calibrationCurve.map((sample) => (
                <TouchableOpacity
                  key={sample.id}
                  style={[
                    styles.sampleVial,
                    { backgroundColor: sample.color },
                    currentSample?.id === sample.id && styles.selectedSample
                  ]}
                  onPress={() => selectSample(sample)}
                >
                  <Text style={styles.sampleLabel}>{sample.concentration.toFixed(1)}M</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {unknownSample && (
          <View style={styles.unknownContainer}>
            <Text style={styles.sectionTitle}>Unknown Sample</Text>
            <TouchableOpacity
              style={[
                styles.unknownVial,
                { backgroundColor: unknownSample.color }
              ]}
              onPress={() => setCurrentSample(unknownSample)}
            >
              <Text style={styles.unknownLabel}>Unknown</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentSample && (
          <View style={styles.readingContainer}>
            <Text style={styles.sectionTitle}>Current Reading</Text>
            <View style={styles.readingData}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Sample:</Text>
                <Text style={styles.dataValue}>{currentSample.name}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Absorbance:</Text>
                <Text style={styles.dataValue}>{currentSample.absorbance.toFixed(3)}</Text>
              </View>
              {currentSample.id !== 'unknown' && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Concentration:</Text>
                  <Text style={styles.dataValue}>{currentSample.concentration.toFixed(3)} M</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.calibrationContainer}>
          <Text style={styles.sectionTitle}>Calibration Curve</Text>
          {renderCalibrationCurve()}
        </View>

        {unknownSample && (
          <View style={styles.analysisContainer}>
            <TouchableOpacity 
              style={[styles.analyzeButton, isAnalyzing && styles.analyzingButton]}
              onPress={analyzeUnknown}
              disabled={isAnalyzing}
            >
              <Target size={24} color="white" />
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Unknown'}
              </Text>
            </TouchableOpacity>
            
            {calculatedConcentration > 0 && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Analysis Result</Text>
                <Text style={styles.resultValue}>
                  Calculated Concentration: {calculatedConcentration.toFixed(3)} M
                </Text>
                <Text style={styles.resultAccuracy}>
                  Accuracy: {(100 - Math.abs((calculatedConcentration - unknownSample.concentration) / unknownSample.concentration * 100)).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <RotateCcw size={24} color="white" />
          <Text style={styles.resetButtonText}>Reset Experiment</Text>
        </TouchableOpacity>
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
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instrumentContainer: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  wavelengthControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wavelengthButton: {
    backgroundColor: '#9013FE',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wavelengthButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wavelengthValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 80,
    textAlign: 'center',
  },
  samplesContainer: {
    marginBottom: 20,
  },
  samplesRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  sampleVial: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedSample: {
    borderColor: '#9013FE',
    borderWidth: 3,
  },
  sampleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unknownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  unknownVial: {
    width: 80,
    height: 100,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    borderWidth: 3,
    borderColor: '#FF5722',
  },
  unknownLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  readingContainer: {
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
  readingData: {
    marginTop: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9013FE',
  },
  calibrationContainer: {
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
  analysisContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  analyzingButton: {
    backgroundColor: '#666',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 16,
    color: '#388E3C',
    marginBottom: 4,
  },
  resultAccuracy: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});