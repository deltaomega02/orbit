// src/screens/Closet/ClosetScreen.styles.ts
// â­ v2.3: gridContainer ìŠ¤íƒ€ì¼ ì¶”ê°€ (í•œ ì¤„ì— 2ê°œì”© í‘œì‹œ)

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Sizes } from '../../constants/dimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;
const LIST_CARD_HEIGHT = 100;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // í—¤ë” ì„œë¸Œíƒ€ì´í‹€
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // ìŠ¤í¬ë¡¤ ì»¨í…ì¸ 
  scrollContent: {
    paddingBottom: 100,
  },

  // ê¸€ëž˜ìŠ¤ ë ˆì´ì–´
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dockBackground,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
  },

  // ì¹´í…Œê³ ë¦¬
  categoryContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryPillActive: {
    backgroundColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  categoryIcon: {
    marginRight: 5,
    zIndex: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 5,
    marginRight: 5,
    zIndex: 1,
  },
  categoryLabelActive: {
    color: Colors.textPrimary,
  },
  categoryCount: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  categoryCountActive: {
    backgroundColor: Colors.primaryLight,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  categoryCountTextActive: {
    color: Colors.primary,
  },

  // ìŠ¤í…Œì´í„°ìŠ¤
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  statGradient: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    borderRadius: 14,
    zIndex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ì•„ì´í…œ ì»¨í…Œì´ë„ˆ
  itemsContainer: {
    flex: 1,
  },

  // â­ ê·¸ë¦¬ë“œ ë·° - gridContainer ì¶”ê°€
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  itemPressable: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  frequentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  wearCount: {
    fontSize: 11,
    color: Colors.textTertiary,
  },

  // ë¦¬ìŠ¤íŠ¸ ë·°
  listContainer: {
    paddingHorizontal: 10,
  },
  listItemCard: {
    marginBottom: 12,
    marginHorizontal: 0,
  },
  listItemPressable: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  listItemImage: {
    width: 80,
    height: LIST_CARD_HEIGHT - 20,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  listItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemCategory: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  listCategoryText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  listWearCount: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // FAB ë²„íŠ¼
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  fabGlassBar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  fabGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dockBackground,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
  },
  fabTopLine: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fabContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ì¤‘ì•™ ì •ë ¬ ì»¨í…Œì´ë„ˆ
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // ë¡œë”© ìƒíƒœ
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ì—ëŸ¬ ìƒíƒœ
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },

  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ë¹ˆ ìƒíƒœ
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },

  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  emptySubtitle: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyDescription: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ì´ë¯¸ì§€ ì—†ëŠ” ìƒíƒœ (ClothingGridItemì—ì„œ ì‚¬ìš©)
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  noImageText: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // 삭제 버튼 (그리드 뷰)
  deleteButton: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  deleteButtonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  // 삭제 버튼 (리스트 뷰)
  listItemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Prefetch 배너 스타일
  prefetchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  prefetchText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
  },
});