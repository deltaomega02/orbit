// src/screens/Camera/components/PermissionView.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { styles } from '../CameraScreen.styles';

interface PermissionViewProps {
  onRequestPermission: () => void;
}

export const PermissionView: React.FC<PermissionViewProps> = ({ 
  onRequestPermission 
}) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.permissionCard}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.permissionContent}>
          <Ionicons name="camera" size={48} color={Colors.primary} />
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionDescription}>
            Orbit needs camera access to capture your wardrobe
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={onRequestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};