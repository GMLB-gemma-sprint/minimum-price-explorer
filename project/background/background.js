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
  
  
  try {
      // 네이버 최저가 검색 함수 호출
      const prices = await fetchNaverPrices(productInfo);
      return prices;
  } catch (error) {
      console.error('가격 비교 중 오류 발생:', error);
      return [{ store: "오류", price: "정보를 가져올 수 없습니다." }];
  }
  
  // // 임시 더미 데이터 반환
  // return [
  //     { store: "A 스토어", price: "100,000원" },
  //     { store: "B 스토어", price: "95,000원" },
  //     { store: "C 스토어", price: "105,000원" }
  // ];
}


// 네이버 쇼핑에서 최저가 가격 정보를 가져오는 함수
async function fetchNaverPrices(query) {
  const encodedQuery = encodeURIComponent(query); // 검색어 인코딩
  const searchUrl = `https://search.shopping.naver.com/search/all?query=${encodedQuery}`;
  console.log('searchUrl :',searchUrl)
  try {
      const response = await fetch(searchUrl);
      const html = await response.text();

      console.log('html :',html)
      // HTML 내에서 가격 정보를 찾기 위한 정규표현식 (HTML 구조가 변할 수 있으므로 확인 필요)
      const priceMatches = [...html.matchAll(/<span class="price_num__2WUXn">([\d,]+원)<\/span>/g)];

      let prices = priceMatches.map(match => match[1]);

      console.log('파싱된 가격 정보:', prices);

      return prices.length > 0 ? prices : ["가격 정보를 찾을 수 없습니다."];

  } catch (error) {
      console.error('네이버 쇼핑에서 가격 정보를 불러오는 중 오류 발생:', error);
      return ["정보를 가져올 수 없습니다."];
  }
}


// 탭 업데이트 리스너 (옵션)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
      // 새 페이지 로드 완료 시 수행할 작업
      console.log('새 페이지 로드됨:', tab.url);
  }
});