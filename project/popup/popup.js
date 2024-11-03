document.addEventListener('DOMContentLoaded', function() {
    const productInfoElement = document.getElementById('productInfo');
    const priceListElement = document.getElementById('priceList');
    const compareButton = document.getElementById('compareButton');
    const captureButton = document.getElementById('captureButton');
    const searchButton = document.getElementById('searchButton');
    const searchQueryInput = document.getElementById('searchQuery');

    // 현재 탭의 상품 정보 가져오기
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getProductInfo" }, function(response) {
            if (response && response.productName) {
                productInfoElement.innerHTML = `<p>상품명: ${response.productName}</p>`;
            } else {
                productInfoElement.innerHTML = '<p>상품 정보를 찾을 수 없습니다.</p>';
            }
        });
    });

    // 가격 비교 버튼 클릭 이벤트
    compareButton.addEventListener('click', function() {
        const searchQuery = searchQueryInput.value.trim(); // 검색어 가져오기
        if (searchQuery) {
            chrome.runtime.sendMessage({ action: "comparePrices", productInfo: searchQuery }, function(response) {
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
        } else {
            alert('검색할 상품명을 입력하세요.');
        }
    });

    // 스크린 캡처 버튼 클릭 이벤트
    captureButton.addEventListener('click', function() {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
            const img = new Image();
            img.src = dataUrl;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // 팝업 창 크기 가져오기
                const popupWidth = document.body.clientWidth;
                const popupHeight = document.body.clientHeight;

                // 이미지 비율 계산
                const aspectRatio = img.width / img.height;
                let newWidth, newHeight;

                // 비율 유지하면서 팝업 크기에 맞게 조정
                if (popupWidth / popupHeight > aspectRatio) {
                    newHeight = popupHeight;
                    newWidth = popupHeight * aspectRatio;
                } else {
                    newWidth = popupWidth;
                    newHeight = popupWidth / aspectRatio;
                }

                // 캔버스 크기 설정
                canvas.width = newWidth;
                canvas.height = newHeight;

                // 자르고 리사이즈
                context.drawImage(img, 0, 0, img.width, img.height, 0, 0, newWidth, newHeight);

                // 캔버스를 이미지로 변환하여 팝업에 추가
                const resizedDataUrl = canvas.toDataURL('image/png');
                const resizedImg = document.createElement('img');
                resizedImg.src = resizedDataUrl;

                // 이미지 스타일 설정: 중앙 정렬
                resizedImg.style.display = 'block';
                resizedImg.style.margin = '0 auto';

                // 기존에 추가된 이미지가 있다면 제거하고 새 이미지를 추가
                const existingImage = document.querySelector('img');
                if (existingImage) {
                    document.body.removeChild(existingImage);
                }

                document.body.appendChild(resizedImg);
            };
        });
    });

    searchButton.addEventListener('click', function() {
        const searchQuery = searchQueryInput.value.trim();
        if (searchQuery) {
            chrome.runtime.sendMessage({ action: "comparePrices", productInfo: searchQuery }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError.message);
                    return;
                }

                console.log("Received response:", response); // 응답 확인

                if (response && response.prices.length > 0) {
                    priceListElement.innerHTML = '';
                    response.prices.forEach(function(price, index) {
                        const li = document.createElement('li');
                        li.textContent = `결과 ${index + 1}: ${price}`;
                        priceListElement.appendChild(li);
                    });
                } else {
                    priceListElement.innerHTML = '<li>가격 정보를 찾을 수 없습니다.</li>';
                }
            });
        } else {
            alert('검색할 상품명을 입력하세요.');
        }
    });
});



// document.addEventListener('DOMContentLoaded', function() {
//     const dropZone = document.getElementById('dropZone');

//     // 드래그 오버 이벤트 (드래그 중일 때 영역 스타일 변경)
//     dropZone.addEventListener('dragover', function(event) {
//         event.preventDefault();
//         dropZone.style.borderColor = '#00c73c';
//     });

//     // 드래그 떠남 이벤트 (드래그가 끝나면 원래 스타일로)
//     dropZone.addEventListener('dragleave', function(event) {
//         dropZone.style.borderColor = '#ccc';
//     });

//     // 드롭 이벤트 처리
//     dropZone.addEventListener('drop', function(event) {
//         event.preventDefault();
//         dropZone.style.borderColor = '#ccc';

//         const files = event.dataTransfer.files;
//         if (files.length > 0) {
//             const imageFile = files[0];
//             // uploadImage(imageFile);
//         }
//     });

//     // // 이미지 파일을 백엔드로 전송하는 함수
//     // function uploadImage(file) {
//     //     const formData = new FormData();
//     //     formData.append('image', file);

//     //     fetch('https://your-backend-url.com/upload', { // 백엔드 URL로 변경
//     //         method: 'POST',
//     //         body: formData,
//     //     })
//     //     .then(response => response.json())
//     //     .then(data => {
//     //         console.log('백엔드로부터 응답:', data);
//     //         alert('이미지가 성공적으로 업로드되었습니다!');
//     //     })
//     //     .catch(error => {
//     //         console.error('이미지 업로드 중 오류 발생:', error);
//     //         alert('이미지 업로드에 실패했습니다.');
//     //     });
//     // }
// });
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');

    // 드래그 오버 이벤트
    dropZone.addEventListener('dragover', function(event) {
        event.preventDefault();
        dropZone.classList.add('dragover');
    });

    // 드래그 떠남 이벤트
    dropZone.addEventListener('dragleave', function(event) {
        dropZone.classList.remove('dragover');
    });

    // 드롭 이벤트 처리
    dropZone.addEventListener('drop', function(event) {
        event.preventDefault();
        dropZone.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            const imageFile = files[0];
            displayImage(imageFile);
        } else {
            alert('이미지 파일을 드래그 앤 드롭해주세요.');
        }
    });

    // 이미지를 화면에 표시하는 함수
    // function displayImage(file) {
    //     const reader = new FileReader();
    //     reader.onload = function(event) {
    //         const imgElement = document.createElement('img');
    //         imgElement.src = event.target.result;
    //         dropZone.innerHTML = ''; // 기존 내용 지우기
    //         dropZone.appendChild(imgElement); // 이미지 추가
    //     };
    //     reader.readAsDataURL(file); // 파일을 Data URL로 읽기
    // }
    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                // dropZone의 크기 가져오기
                const dropZoneWidth = dropZone.clientWidth;
                const dropZoneHeight = dropZone.clientHeight;
    
                // canvas를 사용하여 이미지 크기를 조정
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = dropZoneWidth;
                canvas.height = dropZoneHeight;
    
                // 이미지 비율 유지하면서 dropZone 크기에 맞게 조정
                const aspectRatio = img.width / img.height;
                let newWidth, newHeight;
                if (dropZoneWidth / dropZoneHeight > aspectRatio) {
                    newHeight = dropZoneHeight;
                    newWidth = dropZoneHeight * aspectRatio;
                } else {
                    newWidth = dropZoneWidth;
                    newHeight = dropZoneWidth / aspectRatio;
                }
    
                // 이미지 그리기
                const x = (dropZoneWidth - newWidth) / 2; // 가운데 정렬
                const y = (dropZoneHeight - newHeight) / 2;
                context.drawImage(img, x, y, newWidth, newHeight);
    
                // canvas의 이미지를 dropZone에 추가
                const resizedImageUrl = canvas.toDataURL('image/png');
                const imgElement = document.createElement('img');
                imgElement.src = resizedImageUrl;
                dropZone.innerHTML = ''; // 기존 내용 지우기
                dropZone.appendChild(imgElement); // 리사이즈된 이미지 추가
            };
        };
        reader.readAsDataURL(file); // 파일을 Data URL로 읽기
    }
    
});

