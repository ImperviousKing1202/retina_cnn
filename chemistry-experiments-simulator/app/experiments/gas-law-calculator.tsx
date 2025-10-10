import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Calculator, Wind } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CalculatorType = 'charles' | 'boyle' | 'ideal-gas';

export default function GasLawCalculator() {
  const insets = useSafeAreaInsets();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('charles');

  const [charlesInputs, setCharlesInputs] = useState({ v1: '', t1: '', t2: '' });
  const [charlesResult, setCharlesResult] = useState<number | null>(null);

  const [boyleInputs, setBoyleInputs] = useState({ p1: '', v1: '', v2: '' });
  const [boyleResult, setBoyleResult] = useState<number | null>(null);

  const [idealGasInputs, setIdealGasInputs] = useState({ 
    p: '', 
    v: '', 
    t: '', 
    pUnit: 'atm' as 'atm' | 'mmHg',
    vUnit: 'L' as 'L' | 'mL'
  });
  const [idealGasResult, setIdealGasResult] = useState<number | null>(null);

  const calculateCharles = () => {
    const v1 = parseFloat(charlesInputs.v1);
    const t1Celsius = parseFloat(charlesInputs.t1);
    const t2Celsius = parseFloat(charlesInputs.t2);

    if (isNaN(v1) || isNaN(t1Celsius) || isNaN(t2Celsius)) {
      alert('Please enter valid numbers');
      return;
    }

    const t1Kelvin = t1Celsius + 273.15;
    const t2Kelvin = t2Celsius + 273.15;

    const v2 = v1 * (t2Kelvin / t1Kelvin);
    setCharlesResult(v2);
  };

  const calculateBoyle = () => {
    const p1 = parseFloat(boyleInputs.p1);
    const v1 = parseFloat(boyleInputs.v1);
    const v2 = parseFloat(boyleInputs.v2);

    if (isNaN(p1) || isNaN(v1) || isNaN(v2)) {
      alert('Please enter valid numbers');
      return;
    }

    const p2 = (p1 * v1) / v2;
    setBoyleResult(p2);
  };

  const calculateIdealGas = () => {
    let p = parseFloat(idealGasInputs.p);
    let v = parseFloat(idealGasInputs.v);
    const tCelsius = parseFloat(idealGasInputs.t);

    if (isNaN(p) || isNaN(v) || isNaN(tCelsius)) {
      alert('Please enter valid numbers');
      return;
    }

    if (idealGasInputs.pUnit === 'mmHg') {
      p = p / 760;
    }

    if (idealGasInputs.vUnit === 'mL') {
      v = v / 1000;
    }

    const tKelvin = tCelsius + 273.15;
    const R = 0.08206;

    const n = (p * v) / (R * tKelvin);
    setIdealGasResult(n);
  };

  const resetCharles = () => {
    setCharlesInputs({ v1: '', t1: '', t2: '' });
    setCharlesResult(null);
  };

  const resetBoyle = () => {
    setBoyleInputs({ p1: '', v1: '', v2: '' });
    setBoyleResult(null);
  };

  const resetIdealGas = () => {
    setIdealGasInputs({ p: '', v: '', t: '', pUnit: 'atm', vUnit: 'L' });
    setIdealGasResult(null);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gas Law Calculator',
          headerStyle: { backgroundColor: '#9013FE' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#9013FE', '#7B1FA2']}
        style={styles.header}
      >
        <Calculator size={32} color="white" />
        <Text style={styles.headerTitle}>Gas Law Calculator</Text>
        <Text style={styles.headerSubtitle}>Interactive Calculations</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeCalculator === 'charles' && styles.tabActive]}
          onPress={() => setActiveCalculator('charles')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeCalculator === 'charles' && styles.tabTextActive]}>
            Charles&apos; Law
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeCalculator === 'boyle' && styles.tabActive]}
          onPress={() => setActiveCalculator('boyle')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeCalculator === 'boyle' && styles.tabTextActive]}>
            Boyle&apos;s Law
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeCalculator === 'ideal-gas' && styles.tabActive]}
          onPress={() => setActiveCalculator('ideal-gas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeCalculator === 'ideal-gas' && styles.tabTextActive]}>
            Ideal Gas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.content}>
          {activeCalculator === 'charles' && (
            <View>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Charles&apos; Law</Text>
                <Text style={styles.formula}>V₂ = V₁ × (T₂ / T₁)</Text>
                <Text style={styles.formulaNote}>
                  Temperature must be in Kelvin (K = °C + 273.15)
                </Text>
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Initial Volume (V₁) in L:</Text>
                <TextInput
                  style={styles.input}
                  value={charlesInputs.v1}
                  onChangeText={(text) => setCharlesInputs({ ...charlesInputs, v1: text })}
                  keyboardType="numeric"
                  placeholder="Enter V₁"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Initial Temperature (T₁) in °C:</Text>
                <TextInput
                  style={styles.input}
                  value={charlesInputs.t1}
                  onChangeText={(text) => setCharlesInputs({ ...charlesInputs, t1: text })}
                  keyboardType="numeric"
                  placeholder="Enter T₁"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Final Temperature (T₂) in °C:</Text>
                <TextInput
                  style={styles.input}
                  value={charlesInputs.t2}
                  onChangeText={(text) => setCharlesInputs({ ...charlesInputs, t2: text })}
                  keyboardType="numeric"
                  placeholder="Enter T₂"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={calculateCharles}
                  activeOpacity={0.7}
                >
                  <Wind size={20} color="white" />
                  <Text style={styles.calculateButtonText}>Calculate V₂</Text>
                </TouchableOpacity>

                {charlesResult !== null && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Result:</Text>
                    <Text style={styles.resultValue}>V₂ = {charlesResult.toFixed(4)} L</Text>
                    <TouchableOpacity style={styles.resetSmallButton} onPress={resetCharles}>
                      <Text style={styles.resetSmallButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeCalculator === 'boyle' && (
            <View>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Boyle&apos;s Law</Text>
                <Text style={styles.formula}>P₂ = (P₁ × V₁) / V₂</Text>
                <Text style={styles.formulaNote}>
                  At constant temperature
                </Text>
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Initial Pressure (P₁) in atm:</Text>
                <TextInput
                  style={styles.input}
                  value={boyleInputs.p1}
                  onChangeText={(text) => setBoyleInputs({ ...boyleInputs, p1: text })}
                  keyboardType="numeric"
                  placeholder="Enter P₁"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Initial Volume (V₁) in L:</Text>
                <TextInput
                  style={styles.input}
                  value={boyleInputs.v1}
                  onChangeText={(text) => setBoyleInputs({ ...boyleInputs, v1: text })}
                  keyboardType="numeric"
                  placeholder="Enter V₁"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Final Volume (V₂) in L:</Text>
                <TextInput
                  style={styles.input}
                  value={boyleInputs.v2}
                  onChangeText={(text) => setBoyleInputs({ ...boyleInputs, v2: text })}
                  keyboardType="numeric"
                  placeholder="Enter V₂"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={calculateBoyle}
                  activeOpacity={0.7}
                >
                  <Wind size={20} color="white" />
                  <Text style={styles.calculateButtonText}>Calculate P₂</Text>
                </TouchableOpacity>

                {boyleResult !== null && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Result:</Text>
                    <Text style={styles.resultValue}>P₂ = {boyleResult.toFixed(4)} atm</Text>
                    <TouchableOpacity style={styles.resetSmallButton} onPress={resetBoyle}>
                      <Text style={styles.resetSmallButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeCalculator === 'ideal-gas' && (
            <View>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Ideal Gas Law</Text>
                <Text style={styles.formula}>n = PV / RT</Text>
                <Text style={styles.formulaNote}>
                  R = 0.08206 L·atm/(mol·K)
                </Text>
              </View>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Pressure (P):</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.input, styles.inputWithUnitField]}
                    value={idealGasInputs.p}
                    onChangeText={(text) => setIdealGasInputs({ ...idealGasInputs, p: text })}
                    keyboardType="numeric"
                    placeholder="Enter P"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.unitSelector}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        idealGasInputs.pUnit === 'atm' && styles.unitButtonActive
                      ]}
                      onPress={() => setIdealGasInputs({ ...idealGasInputs, pUnit: 'atm' })}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        idealGasInputs.pUnit === 'atm' && styles.unitButtonTextActive
                      ]}>atm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        idealGasInputs.pUnit === 'mmHg' && styles.unitButtonActive
                      ]}
                      onPress={() => setIdealGasInputs({ ...idealGasInputs, pUnit: 'mmHg' })}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        idealGasInputs.pUnit === 'mmHg' && styles.unitButtonTextActive
                      ]}>mmHg</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Volume (V):</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.input, styles.inputWithUnitField]}
                    value={idealGasInputs.v}
                    onChangeText={(text) => setIdealGasInputs({ ...idealGasInputs, v: text })}
                    keyboardType="numeric"
                    placeholder="Enter V"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.unitSelector}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        idealGasInputs.vUnit === 'L' && styles.unitButtonActive
                      ]}
                      onPress={() => setIdealGasInputs({ ...idealGasInputs, vUnit: 'L' })}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        idealGasInputs.vUnit === 'L' && styles.unitButtonTextActive
                      ]}>L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        idealGasInputs.vUnit === 'mL' && styles.unitButtonActive
                      ]}
                      onPress={() => setIdealGasInputs({ ...idealGasInputs, vUnit: 'mL' })}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        idealGasInputs.vUnit === 'mL' && styles.unitButtonTextActive
                      ]}>mL</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Temperature (T) in °C:</Text>
                <TextInput
                  style={styles.input}
                  value={idealGasInputs.t}
                  onChangeText={(text) => setIdealGasInputs({ ...idealGasInputs, t: text })}
                  keyboardType="numeric"
                  placeholder="Enter T"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={calculateIdealGas}
                  activeOpacity={0.7}
                >
                  <Wind size={20} color="white" />
                  <Text style={styles.calculateButtonText}>Calculate n (moles)</Text>
                </TouchableOpacity>

                {idealGasResult !== null && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Result:</Text>
                    <Text style={styles.resultValue}>n = {idealGasResult.toFixed(6)} mol</Text>
                    <TouchableOpacity style={styles.resetSmallButton} onPress={resetIdealGas}>
                      <Text style={styles.resetSmallButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#9013FE',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#9013FE',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  formulaCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9013FE',
  },
  formulaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 8,
  },
  formula: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#311B92',
    marginBottom: 8,
  },
  formulaNote: {
    fontSize: 12,
    color: '#5E35B1',
    fontStyle: 'italic',
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputWithUnit: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithUnitField: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 5,
  },
  unitButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitButtonActive: {
    backgroundColor: '#9013FE',
    borderColor: '#9013FE',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  unitButtonTextActive: {
    color: 'white',
  },
  calculateButton: {
    backgroundColor: '#9013FE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  resetSmallButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resetSmallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
