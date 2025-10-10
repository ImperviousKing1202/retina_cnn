import { FuturisticColors } from '@/constants/colors';
import { futuristicStyles, getDifficultyColor } from '@/constants/futuristic-styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Clock, Dna, Users } from 'lucide-react-native';
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

const biochemistryExperiments: Experiment[] = [
  {
    id: 'enzyme-kinetics',
    title: 'Enzyme Kinetics',
    description: 'Study the rate of enzyme-catalyzed reactions and factors affecting enzyme activity.',
    duration: '90 min',
    difficulty: 'Advanced',
    materials: ['Catalase enzyme', 'H₂O₂ substrate', 'pH buffers', 'Spectrophotometer', 'Cuvettes']
  },
  {
    id: 'unsaturation-tests',
    title: 'Unsaturation Tests',
    description: 'Test for carbon-carbon double bonds in fats and oils - Learn about saturated vs unsaturated lipids.',
    duration: '45 min',
    difficulty: 'Intermediate',
    materials: ['Oil samples', 'Bromine solution', 'KMnO₄ solution', 'Test tubes', 'Pipettes']
  },
  {
    id: 'alcohol-properties',
    title: 'Alcohol Properties',
    description: 'Study the role of alcohols in biological systems through classification tests.',
    duration: '60 min',
    difficulty: 'Intermediate',
    materials: ['Alcohol samples', 'Ferric chloride', 'Iodine solution', 'Test tubes', 'Water']
  },
  {
    id: 'protein-assay',
    title: 'Protein Concentration Assay',
    description: 'Determine protein concentration using the Bradford assay method.',
    duration: '60 min',
    difficulty: 'Intermediate',
    materials: ['Bradford reagent', 'BSA standards', 'Protein samples', 'Microplate reader', '96-well plates']
  },
  {
    id: 'dna-extraction',
    title: 'DNA Extraction',
    description: 'Extract DNA from plant or bacterial cells using simple laboratory techniques.',
    duration: '45 min',
    difficulty: 'Beginner',
    materials: ['Plant tissue', 'Lysis buffer', 'Ethanol', 'Centrifuge tubes', 'Micropipettes']
  }
];

export default function BiochemistryExperiments() {
  const insets = useSafeAreaInsets();

  return (
    <View style={futuristicStyles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Biochemistry',
          headerStyle: { backgroundColor: FuturisticColors.gradients.biochemistry[0] },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={FuturisticColors.gradients.biochemistry}
        style={futuristicStyles.header}
      >
        <View style={futuristicStyles.iconGlow}>
          <Dna size={48} color="white" strokeWidth={2.5} />
        </View>
        <Text style={futuristicStyles.headerTitle}>Biochemistry</Text>
        <Text style={futuristicStyles.headerSubtitle}>Life & Molecules</Text>
      </LinearGradient>

      <ScrollView style={futuristicStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={futuristicStyles.experimentsContainer}>
          {biochemistryExperiments.map((experiment) => (
            <TouchableOpacity
              key={experiment.id}
              style={futuristicStyles.experimentCard}
              onPress={() => {
                switch (experiment.id) {
                  case 'enzyme-kinetics':
                    router.push('/experiments/enzyme-kinetics');
                    break;
                  case 'unsaturation-tests':
                    router.push('/experiments/unsaturation-tests');
                    break;
                  case 'alcohol-properties':
                    router.push('/experiments/alcohol-properties');
                    break;
                  case 'protein-assay':
                    router.push('/experiments/protein-assay');
                    break;
                  case 'dna-extraction':
                    router.push('/experiments/dna-extraction');
                    break;
                  default:
                    router.push(`/experiment-detail/${experiment.id}` as any);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[futuristicStyles.cardGlow, { backgroundColor: FuturisticColors.gradients.biochemistry[0] }]} />
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