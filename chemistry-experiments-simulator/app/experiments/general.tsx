import { FuturisticColors } from '@/constants/colors';
import { futuristicStyles, getDifficultyColor } from '@/constants/futuristic-styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Atom, Clock, Users } from 'lucide-react-native';
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

const generalChemistryExperiments: Experiment[] = [
  {
    id: 'solution-enthalpy',
    title: 'Solution & Enthalpy Lab',
    description: 'Simulate dissolution processes to determine if they are endothermic or exothermic.',
    duration: '35 min',
    difficulty: 'Beginner',
    materials: ['NaCH₃COO·3H₂O', 'NaOH', 'Water', 'Thermometer', 'Beaker']
  },
  {
    id: 'acid-base',
    title: 'Acid-Base Titration',
    description: 'Learn to determine the concentration of an unknown acid using a standard base solution.',
    duration: '45 min',
    difficulty: 'Intermediate',
    materials: ['NaOH solution', 'HCl solution', 'Phenolphthalein indicator', 'Burette', 'Conical flask']
  },
  {
    id: 'precipitation',
    title: 'Precipitation Reactions',
    description: 'Observe the formation of precipitates when mixing different ionic solutions.',
    duration: '30 min',
    difficulty: 'Beginner',
    materials: ['AgNO₃ solution', 'NaCl solution', 'BaCl₂ solution', 'Na₂SO₄ solution', 'Test tubes']
  },
  {
    id: 'gas-laws',
    title: 'Gas Laws Demonstration',
    description: 'Explore the relationship between pressure, volume, and temperature of gases.',
    duration: '40 min',
    difficulty: 'Intermediate',
    materials: ['Gas syringe', 'Pressure gauge', 'Water bath', 'Thermometer', 'Boyle\'s law apparatus']
  }
];

export default function GeneralChemistryExperiments() {
  const insets = useSafeAreaInsets();

  return (
    <View style={futuristicStyles.container}>
      <Stack.Screen 
        options={{ 
          title: 'General Chemistry',
          headerStyle: { backgroundColor: FuturisticColors.gradients.general[0] },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <LinearGradient
        colors={FuturisticColors.gradients.general}
        style={futuristicStyles.header}
      >
        <View style={futuristicStyles.iconGlow}>
          <Atom size={48} color="white" strokeWidth={2.5} />
        </View>
        <Text style={futuristicStyles.headerTitle}>General Chemistry</Text>
        <Text style={futuristicStyles.headerSubtitle}>Fundamentals & Reactions</Text>
      </LinearGradient>

      <ScrollView style={futuristicStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={futuristicStyles.experimentsContainer}>
          {generalChemistryExperiments.map((experiment) => (
            <TouchableOpacity
              key={experiment.id}
              style={futuristicStyles.experimentCard}
              onPress={() => {
                switch (experiment.id) {
                  case 'solution-enthalpy':
                    router.push('/experiments/solution-enthalpy');
                    break;
                  case 'gas-laws':
                    router.push('/experiments/gas-laws');
                    break;
                  case 'acid-base':
                    router.push('/experiments/acid-base-titration');
                    break;
                  case 'precipitation':
                    router.push('/experiments/precipitation-reactions');
                    break;

                  default:
                    router.push(`/experiment-detail/${experiment.id}` as any);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[futuristicStyles.cardGlow, { backgroundColor: FuturisticColors.gradients.general[0] }]} />
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