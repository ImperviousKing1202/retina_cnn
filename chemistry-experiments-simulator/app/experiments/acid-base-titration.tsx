import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Beaker, Pause, Play, RotateCcw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function AcidBaseTitration() {
  const [volume, setVolume] = useState<number>(0);
  const [pH, setPH] = useState<number>(1.0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [equivalencePoint, setEquivalencePoint] = useState<number>(25.0);
  const [currentColor, setCurrentColor] = useState<string>('#ff4444');
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && volume < 50) {
      interval = setInterval(() => {
        setVolume(prev => {
          const newVolume = prev + 0.5;
          calculatePH(newVolume);
          return newVolume;
        });
      }, 200);
    } else if (volume >= 50) {
      setIsRunning(false);
      setIsComplete(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, volume]);

  const calculatePH = (vol: number) => {
    let newPH: number;
    if (vol < equivalencePoint - 2) {
      newPH = 1.0 + (vol / equivalencePoint) * 2;
    } else if (vol >= equivalencePoint - 2 && vol <= equivalencePoint + 2) {
      newPH = 3 + ((vol - (equivalencePoint - 2)) / 4) * 8;
    } else {
      newPH = 11 + ((vol - equivalencePoint - 2) / 23) * 2;
    }
    
    setPH(Math.min(Math.max(newPH, 0), 14));
    
    if (vol < equivalencePoint - 1) {
      setCurrentColor('#ff4444');
    } else if (vol >= equivalencePoint - 1 && vol <= equivalencePoint + 1) {
      setCurrentColor('#ffaaff');
    } else {
      setCurrentColor('#ff44ff');
    }
  };

  const reset = () => {
    setVolume(0);
    setPH(1.0);
    setIsRunning(false);
    setCurrentColor('#ff4444');
    setIsComplete(false);
  };

  const toggleTitration = () => {
    if (isComplete) {
      Alert.alert('Titration Complete', 'Please reset to start a new titration.');
      return;
    }
    setIsRunning(!isRunning);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Acid-Base Titration',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Beaker size={32} color="white" />
        <Text style={styles.headerTitle}>Acid-Base Titration</Text>
        <Text style={styles.headerSubtitle}>NaOH + HCl → NaCl + H₂O</Text>
      </LinearGradient>

      <View style={styles.simulationContainer}>
        <View style={styles.apparatusContainer}>
          <Svg width={width - 40} height={300}>
            <Rect x={width/2 - 60} y={50} width={120} height={200} fill="none" stroke="#333" strokeWidth={3} />
            <Rect 
              x={width/2 - 55} 
              y={250 - (volume * 4)} 
              width={110} 
              height={volume * 4} 
              fill={currentColor} 
              opacity={0.7}
            />
            
            <Rect x={width/2 - 10} y={20} width={20} height={40} fill="#666" />
            <Circle cx={width/2} cy={15} r={8} fill="#333" />
            
            <SvgText x={width/2 + 80} y={70} fontSize={14} fill="#333">Burette</SvgText>
            <SvgText x={width/2 + 80} y={180} fontSize={14} fill="#333">Conical Flask</SvgText>
            <SvgText x={width/2 + 80} y={200} fontSize={12} fill="#666">HCl + Indicator</SvgText>
          </Svg>
        </View>

        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Volume Added:</Text>
            <Text style={styles.dataValue}>{volume.toFixed(1)} mL</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>pH:</Text>
            <Text style={[styles.dataValue, { color: pH < 7 ? '#ff4444' : pH > 7 ? '#4444ff' : '#44ff44' }]}>
              {pH.toFixed(2)}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Equivalence Point:</Text>
            <Text style={styles.dataValue}>{equivalencePoint} mL</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isRunning ? '#ff6b6b' : '#4CAF50' }]}
            onPress={toggleTitration}
          >
            {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Pause' : isComplete ? 'Complete' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {Math.abs(volume - equivalencePoint) < 1 && volume > 0 && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>🎉 Near Equivalence Point!</Text>
            <Text style={styles.resultSubtext}>Perfect pink color indicates neutralization</Text>
          </View>
        )}
      </View>
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
  simulationContainer: {
    flex: 1,
    padding: 20,
  },
  apparatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dataContainer: {
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
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#666',
    minWidth: 120,
    justifyContent: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  resultSubtext: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 4,
  },
});