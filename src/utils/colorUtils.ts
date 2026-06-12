// src/utils/colorUtils.ts

/**
 * 한글 색상명을 hex 코드로 정규화하는 함수
 * @param color - 한글 색상명 (예: "검은색", "빨강", "회색")
 * @returns hex 색상 코드 (예: "#000000", "#FF0000", "#808080")
 */
export const normalizeColor = (color: string | null | undefined): string => {
    if (!color) return '#CCCCCC';
    
    const normalized = color.toLowerCase().replace(/색$/, ''); // "검은색" -> "검은"
    
    if (normalized.includes('빨') || normalized.includes('빨강') || normalized.includes('빨간')) return '#FF0000';
    if (normalized.includes('주황') || normalized.includes('오렌지')) return '#FF8800';
    if (normalized.includes('노랑') || normalized.includes('옐로우')) return '#FFD700';
    if (normalized.includes('초록') || normalized.includes('녹') || normalized.includes('연두')) return '#00AA00';
    if (normalized.includes('파랑') || normalized.includes('파란') || normalized.includes('하늘')) return '#0066FF';
    if (normalized.includes('남')) return '#000080';
    if (normalized.includes('보라')) return '#AA00FF';
    if (normalized.includes('분홍') || normalized.includes('핑크')) return '#FF69B4';
    if (normalized.includes('검') || normalized.includes('검정') || normalized.includes('검은')) return '#000000';
    if (normalized.includes('하얀') || normalized.includes('흰')) return '#FFFFFF';
    if (normalized.includes('회')) return '#808080';
    if (normalized.includes('갈')) return '#8B4513';
    if (normalized.includes('베이지')) return '#F5F5DC';
    if (normalized.includes('카키')) return '#C3B091';
    if (normalized.includes('민트')) return '#98FF98';
    
    return '#CCCCCC'; // 매칭 안되면 기본 회색
  };