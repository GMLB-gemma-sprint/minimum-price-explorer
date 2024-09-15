// 상품 정보를 추출하는 함수
function extractProductInfo() {
    let productName = '';
    let productPrice = '';
    let productImage = '';

    // 예시: 일반적인 쇼핑몰 구조를 가정한 선택자
    productName = document.querySelector('h1.product-title')?.textContent.trim();
    productPrice = document.querySelector('span.price')?.textContent.trim();
    productImage = document.querySelector('img.product-image')?.src;

    // 실제 구현 시에는 여러 쇼핑몰의 구조를 고려해야 합니다
    // 예: 아마존, 쿠팡, 11번가 등의 구조를 각각 처리

    return {
        name: productName,
        price: productPrice,
        image: productImage
    };
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProductInfo") {
        const productInfo = extractProductInfo();
        sendResponse(productInfo);
    }
});

// 페이지 로드 완료 시 실행되는 함수
function onPageLoad() {
    console.log('상품 정보 추출 준비 완료');
    // 필요한 경우 여기에 추가 초기화 로직을 구현할 수 있습니다
}

// 페이지 로드 이벤트 리스너
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageLoad);
} else {
    onPageLoad();
}

// 옵션: MutationObserver를 사용하여 동적 콘텐츠 변경 감지
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            console.log('페이지 콘텐츠가 변경되었습니다');
            // 필요한 경우 여기에 추가 로직을 구현할 수 있습니다
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});