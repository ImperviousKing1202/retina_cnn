import { FuturisticColors } from '@/constants/colors';
import { futuristicStyles, getDifficultyColor } from '@/constants/futuristic-styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Clock, FlaskConical, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Experiment {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  materials: string[];
}

const analyticalChemistryExperiments: Experiment[] = [
  {
    id: 'gas-law-calculator',
    title: 'Gas Law Calculator',
    description: 'Interactive calculators for Charles\' Law, Boyle\'s Law, and Ideal Gas Law.',
    duration: '30 min',
    difficulty: 'Beginner',
    materials: ['Calculator', 'Gas law formulas', 'Temperature conversions', 'Unit conversions']
  },
  {
    id: 'electrochemistry-cell',
    title: 'Electrochemistry Cell',
    description: 'Calculate E_cell and maximum work using the Nernst Equation.',
    duration: '45 min',
    difficulty: 'Intermediate',
    materials: ['Nernst equation', 'Standard potentials', 'Concentration data', 'Calculator']
  },
  {
    id: 'spectrophotometry',
    title: 'UV-Vis Spectrophotometry',
    description: 'Determine the concentration of colored solutions using Beer-Lambert law.',
    duration: '75 min',
    difficulty: 'Intermediate',
    materials: ['UV-Vis spectrophotometer', 'Cuvettes', 'Standard solutions', 'Unknown samples', 'Pipettes']
  },
  {
    id: 'flame-test',
    title: 'Flame Test Analysis',
    description: 'Identify metal ions based on the characteristic colors they produce in a flame.',
    duration: '30 min',
    difficulty: 'Beginner',
    materials: ['Bunsen burner', 'Nichrome wire', 'Metal salt solutions', 'HCl solution', 'Safety goggles']
  },
  {
    id: 'ph-measurement',
    title: 'pH Measurement & Calibration',
    description: 'Learn proper pH meter calibration and measure pH of various solutions.',
    duration: '45 min',
    difficulty: 'Beginner',
    materials: ['pH meter', 'Buffer solutions', 'Unknown solutions', 'Electrode', 'Distilled water']
  }
];

export default function AnalyticalChemistryExperiments() {
  const insets = useSafeAreaInsets();

  return (
    <View style={futuristicStyles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Analytical Chemistry',
          headerStyle: { backgroundColor: FuturisticColors.gradients.analytical[0] },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={FuturisticColors.gradients.analytical}
        style={futuristicStyles.header}
      >
        <View style={futuristicStyles.iconGlow}>
          <FlaskConical size={48} color="white" strokeWidth={2.5} />
        </View>
        <Text style={futuristicStyles.headerTitle}>Analytical Chemistry</Text>
        <Text style={futuristicStyles.headerSubtitle}>Analysis & Detection</Text>
      </LinearGradient>

      <ScrollView style={futuristicStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={futuristicStyles.experimentsContainer}>
          {analyticalChemistryExperiments.map((experiment) => (
            <TouchableOpacity
              key={experiment.id}
              style={futuristicStyles.experimentCard}
              onPress={() => {
                switch (experiment.id) {
                  case 'gas-law-calculator':
                    router.push('/experiments/gas-law-calculator');
                    break;
                  case 'electrochemistry-cell':
                    router.push('/experiments/electrochemistry-cell');
                    break;
                  case 'spectrophotometry':
                    router.push('/experiments/spectrophotometry');
                    break;
                  case 'flame-test':
                    router.push('/experiments/flame-test');
                    break;
                  case 'ph-measurement':
                    router.push('/experiments/ph-measurement');
                    break;
                  default:
                    router.push(`/experiment-detail/${experiment.id}` as any);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[futuristicStyles.cardGlow, { backgroundColor: FuturisticColors.gradients.analytical[0] }]} />
              <View style={futuristicStyles.cardHeader}>
                <Text style={futuristicStyles.experimentTitle}>{experiment.title}</Text>
                <View style={[futuristicStyles.difficultyBadge, { backgroundColor: getDifficultyColor(experiment.difficulty) }]}>
                  <Text style={futuristicStyles.difficultyText}>{experiment.difficulty}</Text>
                </View>
              </View>
              
              <Text style={futuristicStyles.experimentDescription}>{experiment.description}</Text>
              
              <View style={futuristicStyles.cardFooter}>
                <View style={futuristicStyles.durationContainer}>
                  <Clock size={16} color={FuturisticColors.neonBlue} />
                  <Text style={futuristicStyles.durationText}>{experiment.duration}</Text>
                </View>
                <View style={futuristicStyles.materialsContainer}>
                  <Users size={16} color={FuturisticColors.neonPink} />
                  <Text style={futuristicStyles.materialsText}>{experiment.materials.length} materials</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

