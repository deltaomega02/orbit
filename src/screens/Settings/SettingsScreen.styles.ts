// src/screens/Settings/SettingsScreen.styles.ts

import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 110,
  },

  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Main Container
  mainContainer: {
    paddingHorizontal: 24,
  },

  // Top Panel
  topPanel: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 5,
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  topPanelContent: {
    flexDirection: 'row',
    padding: 32,
    gap: 28,
  },

  // Photo Section
  photoSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTouchable: {
    alignItems: 'center',
  },
  photoCircle: {
    width: 160,
    height: 360,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoGlow: {
    position: 'absolute',
    width: 220,
    height: 420,
    borderRadius: 36,
  },
  photoContent: {
    alignItems: 'center',
    gap: 12,
  },
  cameraIcon: {
    opacity: 0.6,
  },
  photoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  photoSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textTertiary,
    letterSpacing: 0.2,
    opacity: 0.7,
  },

  // Metrics Section
  metricsSection: {
    flex: 1,
    gap: 28,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  metricGroup: {
    gap: 10,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    opacity: 0.6,
  },
  metricInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: 'rgba(245, 245, 247, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  metricInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metricUnit: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
    opacity: 0.7,
  },

  // Gender Toggle
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 245, 247, 0.5)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    height: 44,
  },
  genderOption: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    overflow: 'hidden',
  },
  genderActive: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Bottom Panel
  bottomPanel: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 3,
  },
  settingsContent: {
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    marginRight: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 245, 247, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  switch: {
    transform: [{ scale: 0.85 }],
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginLeft: 62,
    marginRight: 16,
  },
});