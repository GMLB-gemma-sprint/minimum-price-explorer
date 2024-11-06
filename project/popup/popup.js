async function loadConfig(fileName) {
    try {
        const response = await fetch(); // JSON 파일 경로
        if (!response.ok) {
            throw new Error('Config 파일을 불러오는 데 실패했습니다');
        }
        const config = await response.json();
        return config;
    } catch (error) {
        console.error(error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const compareButton = document.getElementById('compareButton');
    const priceComparison = document.getElementById('priceComparison');
    const priceList = document.getElementById('priceList'); // 가격 리스트를 업데이트할 요소
    let droppedImageFile = null; 
    

    // console.log('NAVER_CLIENT_ID:',CLIENT_ID); // 예시로 API URL 출력
    // console.log('NAVER_CLIENT_SECRET:', CLIENT_SECRET);
    // 네이버 API 요청 함수 (XML 형식)
    async function fetchNaverPrices(query) {

        const keys = await loadConfig('/keys.json'); // config.json에서 API 키를 불러옴
        if (!keys) {
            console.error('API 키를 불러올 수 없습니다');
            return;
        }

        const CLIENT_ID = keys.NAVER_CLIENT_ID;
        const CLIENT_SECRET = keys.NAVER_CLIENT_SECRET;

        const apiUrl = `https://openapi.naver.com/v1/search/shop.xml?query=${encodeURIComponent(query)}&display=10&start=1&sort=sim`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-Naver-Client-Id': CLIENT_ID,
                    'X-Naver-Client-Secret': CLIENT_SECRET
                }
            });

            if (!response.ok) {
                throw new Error('네이버 API 요청에 실패했습니다.');
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

            // XML에서 <item> 태그 목록 가져오기
            const items = xmlDoc.getElementsByTagName('item');
            let result = [];

            // <item> 태그에서 상품명(title), 최저가(lprice), 이미지(image) 추출
            for (let i = 0; i < items.length; i++) {
                const title = items[i].getElementsByTagName('title')[0].textContent;
                const lprice = items[i].getElementsByTagName('lprice')[0].textContent;
                const image = items[i].getElementsByTagName('image')[0].textContent; // 이미지 URL
                result.push({ title, lprice: parseInt(lprice, 10), image });
            }

            // 최저가 순으로 정렬
            result.sort((a, b) => a.lprice - b.lprice);

            return result;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }
 
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
            droppedImageFile = imageFile; // 드롭된 이미지 파일 저장
            displayImage(imageFile);
        } else {
            alert('이미지 파일을 드래그 앤 드롭해주세요.');
        }
    });
        
    // 버튼 클릭 시 현재 페이지 URL과 드롭된 이미지를 서버로 전송
    compareButton.addEventListener('click', async function() {
        // 현재 탭의 URL 가져오기
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTabUrl = tabs[0].url;
            PALI_API = 'APIadress'
            if (droppedImageFile) {
                // FormData 객체 생성
                const formData = new FormData();
                formData.append('file', droppedImageFile); // 이미지 파일 추가
                formData.append('text_data', currentTabUrl); // URL 추가

                // 서버로 POST 요청
                fetch(PALI_API, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())  // 응답을 JSON으로 변환
                .then(async data => {
                    console.log('서버 응답:', data);

                    // 서버 응답에서 result 값을 사용하여 네이버 API 호출
                    const query = data.brand + data.name; // 검색할 상품명 (예: 가방)
                    console.log('검색 쿼리', query)
                    // 네이버 API를 통해 최저가 정보 가져오기
                    const items = await fetchNaverPrices(query);

                    // priceComparison을 보이도록 설정
                    priceComparison.style.display = 'block';

                    // priceList에 결과 표시
                    priceList.innerHTML = '';
                    if (items.length > 0) {
                        items.forEach(item => {
                            const li = document.createElement('li');
                            
                            // 상품 이미지와 텍스트를 포함한 요소 생성
                            li.innerHTML = `
                                <div class="product-item">
                                    <img src="${item.image}" alt="Product Image" class="product-image" />
                                    <div class="product-info">
                                        <span class="product-title">${item.title}</span>
                                        <span class="product-price">${item.lprice.toLocaleString()}원</span>
                                    </div>
                                </div>`;
                            priceList.appendChild(li);
                        });
                    } else {
                        priceList.innerHTML = '<li>가격 정보를 찾을 수 없습니다.</li>';
                    }
                })
                .catch(error => {
                    console.error('이미지 업로드 중 오류 발생:', error);
                });
            } else {
                alert('이미지 파일을 먼저 드롭하세요.');
            }
        });
    });
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
