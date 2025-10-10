import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Activity, Pause, Play, RotateCcw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function EnzymeKinetics() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(37);
  const [pH, setPH] = useState<number>(7.4);
  const [substrateConc, setSubstrateConc] = useState<number>(10);
  const [reactionRate, setReactionRate] = useState<number>(0);
  const [dataPoints, setDataPoints] = useState<Array<{x: number, y: number}>>([]);
  const [enzymeActivity, setEnzymeActivity] = useState<number>(100);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          calculateReactionRate(newTime);
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, temperature, pH, substrateConc]);

  const calculateReactionRate = (currentTime: number) => {
    const tempFactor = temperature < 20 ? 0.2 : 
                     temperature < 40 ? (temperature - 20) / 20 * 0.8 + 0.2 :
                     temperature < 60 ? 1 - (temperature - 40) / 20 * 0.7 : 0.3;
    
    const pHFactor = Math.exp(-Math.pow((pH - 7.4) / 2, 2));
    
    const vMax = 50 * tempFactor * pHFactor;
    const kM = 5;
    const rate = (vMax * substrateConc) / (kM + substrateConc);
    
    const timeDecay = Math.exp(-currentTime / 100);
    const finalRate = rate * timeDecay;
    
    setReactionRate(finalRate);
    setEnzymeActivity(tempFactor * pHFactor * 100);
    
    if (currentTime % 5 === 0) {
      setDataPoints(prev => {
        const newPoints = [...prev, { x: currentTime, y: finalRate }];
        return newPoints.slice(-50);
      });
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setReactionRate(0);
    setDataPoints([]);
    setEnzymeActivity(100);
  };

  const adjustParameter = (param: string, delta: number) => {
    switch (param) {
      case 'temp':
        setTemperature(prev => Math.max(0, Math.min(80, prev + delta)));
        break;
      case 'pH':
        setPH(prev => Math.max(1, Math.min(14, prev + delta)));
        break;
      case 'substrate':
        setSubstrateConc(prev => Math.max(1, Math.min(50, prev + delta)));
        break;
    }
  };

  const renderGraph = () => {
    if (dataPoints.length < 2) return null;
    
    const maxY = Math.max(...dataPoints.map(p => p.y), 1);
    const graphWidth = width - 80;
    const graphHeight = 150;
    
    let pathData = '';
    dataPoints.forEach((point, index) => {
      const x = (point.x / Math.max(...dataPoints.map(p => p.x))) * graphWidth;
      const y = graphHeight - (point.y / maxY) * graphHeight;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });
    
    return (
      <Svg width={graphWidth + 40} height={graphHeight + 40}>
        <Line x1={20} y1={20} x2={20} y2={graphHeight + 20} stroke="#333" strokeWidth={2} />
        <Line x1={20} y1={graphHeight + 20} x2={graphWidth + 20} y2={graphHeight + 20} stroke="#333" strokeWidth={2} />
        
        <Path d={pathData} stroke="#4CAF50" strokeWidth={3} fill="none" />
        
        {dataPoints.map((point, index) => {
          const x = (point.x / Math.max(...dataPoints.map(p => p.x))) * graphWidth + 20;
          const y = graphHeight + 20 - (point.y / maxY) * graphHeight;
          return <Circle key={index} cx={x} cy={y} r={3} fill="#4CAF50" />;
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Enzyme Kinetics',
          headerStyle: { backgroundColor: '#7ED321' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#7ED321', '#5BA517']}
        style={styles.header}
      >
        <Activity size={32} color="white" />
        <Text style={styles.headerTitle}>Enzyme Kinetics</Text>
        <Text style={styles.headerSubtitle}>Catalase + H₂O₂ → H₂O + O₂</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.parametersContainer}>
          <Text style={styles.sectionTitle}>Reaction Parameters</Text>
          
          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>Temperature: {temperature}°C</Text>
            <View style={styles.parameterControls}>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('temp', -5)}
              >
                <Text style={styles.parameterButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('temp', 5)}
              >
                <Text style={styles.parameterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>pH: {pH.toFixed(1)}</Text>
            <View style={styles.parameterControls}>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('pH', -0.5)}
              >
                <Text style={styles.parameterButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('pH', 0.5)}
              >
                <Text style={styles.parameterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>Substrate: {substrateConc} mM</Text>
            <View style={styles.parameterControls}>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('substrate', -2)}
              >
                <Text style={styles.parameterButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.parameterButton} 
                onPress={() => adjustParameter('substrate', 2)}
              >
                <Text style={styles.parameterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Reaction Rate:</Text>
            <Text style={styles.dataValue}>{reactionRate.toFixed(2)} μmol/min</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Enzyme Activity:</Text>
            <Text style={[styles.dataValue, { color: enzymeActivity > 70 ? '#4CAF50' : enzymeActivity > 30 ? '#FF9800' : '#F44336' }]}>
              {enzymeActivity.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Time:</Text>
            <Text style={styles.dataValue}>{(time / 10).toFixed(1)} s</Text>
          </View>
        </View>

        <View style={styles.graphContainer}>
          <Text style={styles.sectionTitle}>Reaction Rate vs Time</Text>
          {renderGraph()}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isRunning ? '#ff6b6b' : '#4CAF50' }]}
            onPress={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
  parametersContainer: {
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
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  parameterLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  parameterControls: {
    flexDirection: 'row',
  },
  parameterButton: {
    backgroundColor: '#7ED321',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  parameterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#7ED321',
  },
  graphContainer: {
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
});