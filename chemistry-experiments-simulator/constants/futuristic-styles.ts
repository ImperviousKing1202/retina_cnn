import { StyleSheet } from 'react-native';
import { FuturisticColors } from './colors';

export const futuristicStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FuturisticColors.darkBg,
  },
  scrollView: {
    flex: 1,
  },
  experimentsContainer: {
    padding: 20,
  },
  experimentCard: {
    backgroundColor: FuturisticColors.darkCard,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: FuturisticColors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experimentTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  experimentDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    color: FuturisticColors.neonBlue,
    fontWeight: '600',
  },
  materialsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  materialsText: {
    fontSize: 13,
    color: FuturisticColors.neonPink,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginTop: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '600',
  },
  iconGlow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
});

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return FuturisticColors.neonGreen;
    case 'Intermediate': return FuturisticColors.neonYellow;
    case 'Advanced': return FuturisticColors.neonPink;
    default: return '#757575';
  }
};
