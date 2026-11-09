// docs/03 5번 예시(데모 케이스 B 등기부)를 돌려주는 데모 OCR이에요. 실제 연결에서는 서버가 서류를 읽어요.
const caseB = [
  ['T1_ADDRESS', 'YES', '표제부 주소·동·호수가 입력 주소와 같음'],
  ['T2_USAGE', 'NO', '표제부 건물내역: 제2종근린생활시설'],
  ['A1_OWNER', null, '등기부상 소유자: 홍○○ (계약 상대방과 같은지 확인해 주세요)'],
  ['A2_RECENT_OWNER', 'YES', '갑구 3번 소유권이전 2026년9월1일 접수'],
  ['A3_TRUST', 'NO', '갑구에 유효한 신탁 기록 없음'],
  ['A4_SEIZURE', 'NO', '갑구에 유효한 압류·가압류·가처분·가등기·경매 기록 없음'],
  ['B1_MORTGAGE', 'YES', '을구 1번 근저당권설정 채권최고액 금36,000,000원'],
  ['B2_LEASE_REG', 'NO', '을구에 유효한 주택임차권 기록 없음'],
  ['B3_JEONSE_RIGHT', null, '을구 2번 일부를 읽지 못함'],
  ['R1_VIOLATION', null, null],
];
export function mockOcr({ buildingLedger }) {
  const answers = caseB.map(([code, answer, evidence]) =>
    code === 'R1_VIOLATION' && buildingLedger
      ? { code, status: 'CONFIRMED', answer: 'NO', evidence: '건축물대장에 위반건축물 표시 없음' }
      : { code, status: answer ? 'CONFIRMED' : 'UNCONFIRMED', answer, evidence },
  );
  return {
    addressMatch: 'MATCH',
    answers,
    mortgageMax: 3600,
    warnings: buildingLedger
      ? []
      : ['건축물대장을 첨부하지 않아 위반건축물 여부는 직접 답해 주세요.'],
  };
}
