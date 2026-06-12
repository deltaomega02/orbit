// src/screens/Outfit/OutfitScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAIN_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.58;
const THUMBNAIL_SIZE = 56;
const THUMBNAIL_SPACING = 8;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 60) / 3;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Content Area
  contentArea: {
    flex: 1,
  },

  // Fixed Bottom Area
  fixedBottomArea: {
    paddingBottom: 110,
  },

  // Main Image Container
  mainImageContainer: {
    height: MAIN_IMAGE_HEIGHT,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // [ì¶”ê°€] ì´ë¯¸ì§€ê°€ ì—†ì„ ë•Œ ë³´ì—¬ì¤„ ë¹ˆ ì¹´ë“œ ìŠ¤íƒ€ì¼
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F2F5', // ë°ì€ íšŒìƒ‰ ë°°ê²½
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // í…ìŠ¤íŠ¸ ê°€ë…ì„±ì„ ìœ„í•´ ì¡°ê¸ˆ ë†’ìž„
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },

  // Bottom Info
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  occasionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // weatherText ì‚­ì œë¨

  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // ë°°ê²½ì„ ì¡°ê¸ˆ ë” ì–´ë‘¡ê²Œ
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  
  // í•˜íŠ¸ ì•„ì´ì½˜ ìœ„ì¹˜ (êµ¬ wornIndicator)
  likeIndicator: {
    position: 'absolute',
    top: 20,    // ìƒë‹¨ìœ¼ë¡œ ì´ë™ (ì¼ë°˜ì ì¸ ì¹´ë“œ UI íŒ¨í„´)
    right: 20,
  },

  // Date and Stats
  dateStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  currentDate: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  
  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 13,
    paddingVertical: 20,
    position: 'relative',
  },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  progressFilled: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 5,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    zIndex: 1,
  },
  progressIndicator: {
    position: 'absolute',
    top: -2.5,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  // Thumbnail Strip
  thumbnailContainer: {
    position: 'absolute',
    height: THUMBNAIL_SIZE,
    left: 0,
    right: 0,
    bottom: -10,
  },
  thumbnailScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginRight: THUMBNAIL_SPACING,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },
  thumbnailActive: {
    transform: [{ scale: 1.1 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailActiveBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 3,
    gap: 12,
  },
  skipButton: {
    flexDirection: 'row',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Grid Modal
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  gridContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gridContent: {
    padding: 20,
    paddingBottom: 40,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.3,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },
  gridItemActive: {
    transform: [{ scale: 0.95 }],
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 125, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridActiveBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  gridCheckmark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gridItemInfo: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gridItemDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
});