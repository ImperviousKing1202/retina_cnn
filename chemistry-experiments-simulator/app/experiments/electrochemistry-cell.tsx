import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Calculator, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CalculationInputs {
  eCell: string;
  n: string;
  oxidizedConc: string;
  reducedConc: string;
}

interface CalculationResults {
  eCellActual: number;
  wMax: number;
}

const FARADAY_CONSTANT = 96500;
const R = 8.314;
const T = 298.15;

export default function ElectrochemistryCell() {
  const insets = useSafeAreaInsets();
  
  const [inputs, setInputs] = useState<CalculationInputs>({
    eCell: '1.10',
    n: '2',
    oxidizedConc: '1.0',
    reducedConc: '1.0',
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const calculateNernst = () => {
    const eStandard = parseFloat(inputs.eCell);
    const n = parseFloat(inputs.n);
    const oxidizedConc = parseFloat(inputs.oxidizedConc);
    const reducedConc = parseFloat(inputs.reducedConc);

    if (isNaN(eStandard) || isNaN(n) || isNaN(oxidizedConc) || isNaN(reducedConc)) {
      alert('Please enter valid numbers for all fields');
      return;
    }

    if (oxidizedConc <= 0 || reducedConc <= 0) {
      alert('Concentrations must be greater than 0');
      return;
    }

    const Q = oxidizedConc / reducedConc;
    
    const eCellActual = eStandard - ((R * T) / (n * FARADAY_CONSTANT)) * Math.log(Q);
    
    const wMax = -n * FARADAY_CONSTANT * eCellActual;

    setResults({
      eCellActual,
      wMax,
    });
  };

  const reset = () => {
    setInputs({
      eCell: '1.10',
      n: '2',
      oxidizedConc: '1.0',
      reducedConc: '1.0',
    });
    setResults(null);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Electrochemistry Cell',
          headerStyle: { backgroundColor: '#9013FE' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={['#9013FE', '#7B1FA2']}
        style={styles.header}
      >
        <Zap size={32} color="white" />
        <Text style={styles.headerTitle}>Electrochemistry Cell</Text>
        <Text style={styles.headerSubtitle}>Nernst Equation & Work Calculation</Text>
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
              Calculate E_cell and maximum work (w_max) using the Nernst Equation for electrochemical cells.
            </Text>
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Nernst Equation</Text>
            <Text style={styles.formula}>E_cell = E°_cell - (RT/nF) × ln(Q)</Text>
            <Text style={styles.formulaNote}>
              Where Q = [Oxidized] / [Reduced]
            </Text>
            <Text style={styles.formulaNote}>
              R = 8.314 J/(mol·K), T = 298.15 K, F = 96500 C/mol
            </Text>
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Maximum Work</Text>
            <Text style={styles.formula}>w_max = -nFE_cell</Text>
            <Text style={styles.formulaNote}>
              Work is in Joules (J)
            </Text>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Input Parameters:</Text>

            <Text style={styles.inputLabel}>Standard Cell Potential (E°_cell) in V:</Text>
            <TextInput
              style={styles.input}
              value={inputs.eCell}
              onChangeText={(text) => setInputs({ ...inputs, eCell: text })}
              keyboardType="numeric"
              placeholder="e.g., 1.10"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>Default: 1.10 V for Cu/Zn cell</Text>

            <Text style={styles.inputLabel}>Number of Electrons (n):</Text>
            <TextInput
              style={styles.input}
              value={inputs.n}
              onChangeText={(text) => setInputs({ ...inputs, n: text })}
              keyboardType="numeric"
              placeholder="e.g., 2"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>Default: 2 for Cu/Zn cell</Text>

            <Text style={styles.inputLabel}>[Oxidized Species] in M:</Text>
            <TextInput
              style={styles.input}
              value={inputs.oxidizedConc}
              onChangeText={(text) => setInputs({ ...inputs, oxidizedConc: text })}
              keyboardType="numeric"
              placeholder="e.g., 1.0"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>[Reduced Species] in M:</Text>
            <TextInput
              style={styles.input}
              value={inputs.reducedConc}
              onChangeText={(text) => setInputs({ ...inputs, reducedConc: text })}
              keyboardType="numeric"
              placeholder="e.g., 1.0"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculateNernst}
              activeOpacity={0.7}
            >
              <Calculator size={20} color="white" />
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>
          </View>

          {results && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Calculation Results</Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Reaction Quotient (Q):</Text>
                  <Text style={styles.resultValue}>
                    {(parseFloat(inputs.oxidizedConc) / parseFloat(inputs.reducedConc)).toFixed(4)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>E_cell (Actual):</Text>
                  <Text style={[styles.resultValue, styles.resultValueLarge]}>
                    {results.eCellActual.toFixed(6)} V
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>w_max (Maximum Work):</Text>
                  <Text style={[styles.resultValue, styles.resultValueLarge]}>
                    {results.wMax.toFixed(2)} J
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>w_max (in kJ):</Text>
                  <Text style={styles.resultValue}>
                    {(results.wMax / 1000).toFixed(4)} kJ
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={reset}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>Reset Calculator</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Example: Cu/Zn Cell</Text>
            <Text style={styles.exampleText}>
              • Half-reactions:
            </Text>
            <Text style={styles.exampleText}>
              Zn(s) → Zn²⁺(aq) + 2e⁻ (oxidation)
            </Text>
            <Text style={styles.exampleText}>
              Cu²⁺(aq) + 2e⁻ → Cu(s) (reduction)
            </Text>
            <Text style={styles.exampleText}>
              • E°_cell = 1.10 V, n = 2
            </Text>
            <Text style={styles.exampleText}>
              • Q = [Zn²⁺] / [Cu²⁺]
            </Text>
          </View>

          <View style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>Theory</Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>Nernst Equation:</Text> Relates cell potential to concentrations
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>E_cell {'>'} 0:</Text> Spontaneous reaction (galvanic cell)
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>E_cell {'<'} 0:</Text> Non-spontaneous (electrolytic cell)
            </Text>
            <Text style={styles.theoryText}>
              • <Text style={styles.bold}>w_max:</Text> Maximum electrical work the cell can perform
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
  formulaCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9013FE',
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5E35B1',
    marginBottom: 8,
  },
  formula: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#311B92',
    marginBottom: 8,
  },
  formulaNote: {
    fontSize: 12,
    color: '#5E35B1',
    fontStyle: 'italic',
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
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
  resultsContainer: {
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '500',
  },
  resultValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#C8E6C9',
    marginVertical: 12,
  },
  resetButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  },
  exampleCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 4,
  },
  theoryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  theoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 12,
  },
  theoryText: {
    fontSize: 13,
    color: '#0D47A1',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});
