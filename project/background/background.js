// 익스텐션이 설치되거나 업데이트될 때 실행되는 리스너
chrome.runtime.onInstalled.addListener(() => {
    console.log('최저가 비교 익스텐션이 설치되었습니다.');
  });
  
  // 메시지 리스너 설정
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "comparePrices") {
      comparePrices(request.productInfo)
        .then(results => sendResponse({ prices: results }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // 비동기 응답을 위해 true 반환
    }
  });
  
  // 가격 비교 함수 (실제 구현은 API 호출 등이 필요함)
  async function comparePrices(productInfo) {
    // 여기에 실제 가격 비교 로직 구현
    // 예: API 호출, 데이터 처리 등
    console.log('가격 비교 중:', productInfo);
    
    // 임시 더미 데이터 반환
    return [
      { store: "A 스토어", price: "100,000원" },
      { store: "B 스토어", price: "95,000원" },
      { store: "C 스토어", price: "105,000원" }
    ];
  }
  
  // 탭 업데이트 리스너 (옵션)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // 새 페이지 로드 완료 시 수행할 작업
      console.log('새 페이지 로드됨:', tab.url);
    }
  });