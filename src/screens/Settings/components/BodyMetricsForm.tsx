// src/screens/Settings/components/BodyMetricsForm.tsx

import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { styles } from '../SettingsScreen.styles';

interface BodyMetricsFormProps {
  height: string;
  weight: string;
  gender: 'male' | 'female';
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onGenderChange: (value: 'male' | 'female') => void;
}

export const BodyMetricsForm: React.FC<BodyMetricsFormProps> = ({
  height,
  weight,
  gender,
  onHeightChange,
  onWeightChange,
  onGenderChange,
}) => {
  return (
    <View style={styles.metricsSection}>
      {/* Height */}
      <View style={styles.metricGroup}>
        <Text style={styles.metricLabel}>HEIGHT</Text>
        <View style={styles.metricInputWrapper}>
          <TextInput
            style={styles.metricInput}
            value={height}
            onChangeText={onHeightChange}
            placeholder="170"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.metricUnit}>cm</Text>
        </View>
      </View>

      {/* Weight */}
      <View style={styles.metricGroup}>
        <Text style={styles.metricLabel}>WEIGHT</Text>
        <View style={styles.metricInputWrapper}>
          <TextInput
            style={styles.metricInput}
            value={weight}
            onChangeText={onWeightChange}
            placeholder="65"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.metricUnit}>kg</Text>
        </View>
      </View>

      {/* Gender */}
      <View style={styles.metricGroup}>
        <Text style={styles.metricLabel}>GENDER</Text>
        <View style={styles.genderToggle}>
          <Pressable
            style={[
              styles.genderOption,
              gender === 'male' && styles.genderActive,
            ]}
            onPress={() => onGenderChange('male')}
          >
            {gender === 'male' && (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Ionicons
              name="male"
              size={18}
              color={gender === 'male' ? '#FFF' : Colors.textTertiary}
            />
          </Pressable>

          <Pressable
            style={[
              styles.genderOption,
              gender === 'female' && styles.genderActive,
            ]}
            onPress={() => onGenderChange('female')}
          >
            {gender === 'female' && (
              <LinearGradient
                colors={[Colors.secondary, Colors.primary]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Ionicons
              name="female"
              size={18}
              color={gender === 'female' ? '#FFF' : Colors.textTertiary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};