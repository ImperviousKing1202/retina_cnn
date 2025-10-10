import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { ArrowRight, Plus, RotateCcw, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RedoxReaction {
  id: string;
  oxidizingAgent: string;
  reducingAgent: string;
  products: string[];
  equation: string;
  color: string;
  description: string;
}

const reactions: RedoxReaction[] = [
  {
    id: '1',
    oxidizingAgent: 'KMnO₄',
    reducingAgent: 'FeSO₄',
    products: ['MnSO₄', 'Fe₂(SO₄)₃'],
    equation: '10FeSO₄ + 2KMnO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O',
    color: '#d4a574',
    description: 'Purple permanganate reduced to pale pink/colorless'
  },
  {
    id: '2',
    oxidizingAgent: 'K₂Cr₂O₇',
    reducingAgent: 'FeSO₄',
    products: ['Cr₂(SO₄)₃', 'Fe₂(SO₄)₃'],
    equation: '6FeSO₄ + K₂Cr₂O₇ + 7H₂SO₄ → 3Fe₂(SO₄)₃ + Cr₂(SO₄)₃ + K₂SO₄ + 7H₂O',
    color: '#90ee90',
    description: 'Orange dichromate reduced to green chromium(III)'
  },
  {
    id: '3',
    oxidizingAgent: 'Br₂',
    reducingAgent: 'KI',
    products: ['I₂', 'KBr'],
    equation: 'Br₂ + 2KI → I₂ + 2KBr',
    color: '#8b4513',
    description: 'Brown bromine oxidizes iodide to brown iodine'
  },
  {
    id: '4',
    oxidizingAgent: 'H₂O₂',
    reducingAgent: 'KI',
    products: ['I₂', 'H₂O'],
    equation: 'H₂O₂ + 2KI + H₂SO₄ → I₂ + K₂SO₄ + 2H₂O',
    color: '#daa520',
    description: 'Hydrogen peroxide oxidizes iodide to yellow-brown iodine'
  }
];

const oxidizingAgents = ['KMnO₄', 'K₂Cr₂O₇', 'Br₂', 'H₂O₂'];
const reducingAgents = ['FeSO₄', 'KI', 'Na₂S₂O₃', 'Zn'];

export default function RedoxReactions() {
  const insets = useSafeAreaInsets();
  const [selectedOxidizer, setSelectedOxidizer] = useState<string>('');
  const [selectedReducer, setSelectedReducer] = useState<string>('');
  const [currentReaction, setCurrentReaction] = useState<RedoxReaction | null>(null);
  const [reacting, setReacting] = useState<boolean>(false);

  const performReaction = () => {
    if (!selectedOxidizer || !selectedReducer) {
      Alert.alert('Select Reagents', 'Please select both oxidizing and reducing agents.');
      return;
    }

    const reaction = reactions.find(r => 
      r.oxidizingAgent === selectedOxidizer && r.reducingAgent === selectedReducer
    );

    setReacting(true);
    setTimeout(() => {
      setReacting(false);
      if (reaction) {
        setCurrentReaction(reaction);
      } else {
        Alert.alert('No Reaction', 'These reagents do not produce a visible redox reaction.');
        setCurrentReaction(null);
      }
    }, 1500);
  };

  const reset = () => {
    setSelectedOxidizer('');
    setSelectedReducer('');
    setCurrentReaction(null);
    setReacting(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Redox Reactions',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: 'white'
        }} 
      />
      
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Zap size={32} color="white" />
        <Text style={styles.headerTitle}>Redox Reactions</Text>
        <Text style={styles.headerSubtitle}>Oxidation-Reduction Chemistry</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oxidizing Agents</Text>
          <View style={styles.reagentGrid}>
            {oxidizingAgents.map((agent) => (
              <TouchableOpacity
                key={agent}
                style={[
                  styles.reagentButton,
                  styles.oxidizerButton,
                  selectedOxidizer === agent && styles.selectedOxidizer
                ]}
                onPress={() => setSelectedOxidizer(agent)}
              >
                <Text style={styles.reagentText}>{agent}</Text>
                <Text style={styles.reagentLabel}>Oxidizer</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reducing Agents</Text>
          <View style={styles.reagentGrid}>
            {reducingAgents.map((agent) => (
              <TouchableOpacity
                key={agent}
                style={[
                  styles.reagentButton,
                  styles.reducerButton,
                  selectedReducer === agent && styles.selectedReducer
                ]}
                onPress={() => setSelectedReducer(agent)}
              >
                <Text style={styles.reagentText}>{agent}</Text>
                <Text style={styles.reagentLabel}>Reducer</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reactionVisualization}>
          <View style={styles.reactionFlow}>
            <View style={[styles.reagentBox, styles.oxidizerBox]}>
              <Text style={styles.boxLabel}>Oxidizing Agent</Text>
              <Text style={styles.boxContent}>{selectedOxidizer || '?'}</Text>
            </View>
            
            <Plus size={24} color="#666" />
            
            <View style={[styles.reagentBox, styles.reducerBox]}>
              <Text style={styles.boxLabel}>Reducing Agent</Text>
              <Text style={styles.boxContent}>{selectedReducer || '?'}</Text>
            </View>
            
            <ArrowRight size={24} color="#666" />
            
            <View style={[styles.reagentBox, styles.productBox, reacting && styles.reacting]}>
              <Text style={styles.boxLabel}>Products</Text>
              {currentReaction && !reacting ? (
                <View style={[styles.colorIndicator, { backgroundColor: currentReaction.color }]} />
              ) : (
                <Text style={styles.boxContent}>?</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.reactButton]}
            onPress={performReaction}
            disabled={reacting}
          >
            <Zap size={24} color="white" />
            <Text style={styles.controlButtonText}>
              {reacting ? 'Reacting...' : 'Perform Reaction'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={reset}>
            <RotateCcw size={24} color="white" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {currentReaction && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Reaction Result</Text>
            <Text style={styles.equation}>{currentReaction.equation}</Text>
            <Text style={styles.description}>{currentReaction.description}</Text>
            <View style={styles.productsContainer}>
              <Text style={styles.productsLabel}>Products formed:</Text>
              {currentReaction.products.map((product, index) => (
                <Text key={index} style={styles.productItem}>• {product}</Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Redox Reactions</Text>
          <Text style={styles.infoText}>
            Redox reactions involve the transfer of electrons between species. The oxidizing agent gains electrons (is reduced), 
            while the reducing agent loses electrons (is oxidized). These reactions are fundamental to many chemical processes 
            including combustion, corrosion, and cellular respiration.
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
  reagentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reagentButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  oxidizerButton: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ffcccc',
  },
  reducerButton: {
    backgroundColor: '#e0f0ff',
    borderColor: '#cce5ff',
  },
  selectedOxidizer: {
    borderColor: '#ff4444',
    borderWidth: 3,
  },
  selectedReducer: {
    borderColor: '#4444ff',
    borderWidth: 3,
  },
  reagentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reagentLabel: {
    fontSize: 12,
    color: '#666',
  },
  reactionVisualization: {
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
  reactionFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  reagentBox: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    marginVertical: 8,
  },
  oxidizerBox: {
    backgroundColor: '#ffe0e0',
  },
  reducerBox: {
    backgroundColor: '#e0f0ff',
  },
  productBox: {
    backgroundColor: '#f0f0f0',
  },
  reacting: {
    backgroundColor: '#fff3cd',
  },
  boxLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  boxContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
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
  reactButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
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
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  equation: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'monospace',
    marginBottom: 12,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  productsContainer: {
    marginTop: 8,
  },
  productsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
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
