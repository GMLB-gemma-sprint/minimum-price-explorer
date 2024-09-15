document.addEventListener('DOMContentLoaded', function() {
    const productInfoElement = document.getElementById('productInfo');
    const priceListElement = document.getElementById('priceList');
    const compareButton = document.getElementById('compareButton');

    // 현재 탭의 상품 정보 가져오기
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getProductInfo"}, function(response) {
            if (response && response.productName) {
                productInfoElement.innerHTML = `<p>상품명: ${response.productName}</p>`;
            } else {
                productInfoElement.innerHTML = '<p>상품 정보를 찾을 수 없습니다.</p>';
            }
        });
    });

    // 가격 비교 버튼 클릭 이벤트
    compareButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: "comparePrices"}, function(response) {
            if (response && response.prices) {
                priceListElement.innerHTML = '';
                response.prices.forEach(function(price) {
                    const li = document.createElement('li');
                    li.textContent = `${price.store}: ${price.price}원`;
                    priceListElement.appendChild(li);
                });
            } else {
                priceListElement.innerHTML = '<li>가격 정보를 찾을 수 없습니다.</li>';
            }
        });
    });
});