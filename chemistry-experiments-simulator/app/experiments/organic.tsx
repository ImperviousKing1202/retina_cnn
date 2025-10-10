import { FuturisticColors } from '@/constants/colors';
import { futuristicStyles, getDifficultyColor } from '@/constants/futuristic-styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Beaker, Clock, Users } from 'lucide-react-native';
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

const organicChemistryExperiments: Experiment[] = [
  {
    id: 'unsaturation-tests',
    title: 'Unsaturation Tests',
    description: 'Simulate chemical tests for carbon-carbon double bonds in various oils and fats.',
    duration: '45 min',
    difficulty: 'Intermediate',
    materials: ['Oil samples', 'Bromine solution', 'KMnO₄ solution', 'Test tubes', 'Pipettes']
  },
  {
    id: 'alcohol-properties',
    title: 'Alcohol Properties',
    description: 'Simulate tests to classify different types of alcohols based on their properties.',
    duration: '60 min',
    difficulty: 'Intermediate',
    materials: ['Alcohol samples', 'Ferric chloride', 'Iodine solution', 'Test tubes', 'Water']
  },
  {
    id: 'synthesis-aspirin',
    title: 'Aspirin Synthesis',
    description: 'Synthesize acetylsalicylic acid (aspirin) from salicylic acid and acetic anhydride.',
    duration: '120 min',
    difficulty: 'Advanced',
    materials: ['Salicylic acid', 'Acetic anhydride', 'Phosphoric acid', 'Ice bath', 'Recrystallization setup']
  },
  {
    id: 'functional-groups',
    title: 'Functional Group Tests',
    description: 'Identify various functional groups in organic compounds using chemical tests.',
    duration: '60 min',
    difficulty: 'Intermediate',
    materials: ['Unknown compounds', 'Brady\'s reagent', 'Tollens\' reagent', 'Fehling\'s solution', 'Test tubes']
  },
  {
    id: 'extraction',
    title: 'Liquid-Liquid Extraction',
    description: 'Separate organic compounds using different solvent systems and pH conditions.',
    duration: '45 min',
    difficulty: 'Intermediate',
    materials: ['Organic mixture', 'Diethyl ether', 'NaOH solution', 'HCl solution', 'Separatory funnel']
  }
];

export default function OrganicChemistryExperiments() {
  const insets = useSafeAreaInsets();

  return (
    <View style={futuristicStyles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Organic Chemistry',
          headerStyle: { backgroundColor: FuturisticColors.gradients.organic[0] },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={FuturisticColors.gradients.organic}
        style={futuristicStyles.header}
      >
        <View style={futuristicStyles.iconGlow}>
          <Beaker size={48} color="white" strokeWidth={2.5} />
        </View>
        <Text style={futuristicStyles.headerTitle}>Organic Chemistry</Text>
        <Text style={futuristicStyles.headerSubtitle}>Carbon Compounds</Text>
      </LinearGradient>

      <ScrollView style={futuristicStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={futuristicStyles.experimentsContainer}>
          {organicChemistryExperiments.map((experiment) => (
            <TouchableOpacity
              key={experiment.id}
              style={futuristicStyles.experimentCard}
              onPress={() => {
                switch (experiment.id) {
                  case 'unsaturation-tests':
                    router.push('/experiments/unsaturation-tests');
                    break;
                  case 'alcohol-properties':
                    router.push('/experiments/alcohol-properties');
                    break;
                  case 'synthesis-aspirin':
                    router.push('/experiments/aspirin-synthesis');
                    break;
                  case 'functional-groups':
                    router.push('/experiments/functional-groups');
                    break;
                  case 'extraction':
                    router.push('/experiments/extraction');
                    break;
                  default:
                    router.push(`/experiment-detail/${experiment.id}` as any);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[futuristicStyles.cardGlow, { backgroundColor: FuturisticColors.gradients.organic[0] }]} />
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