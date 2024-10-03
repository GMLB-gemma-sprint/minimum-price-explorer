from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from transformers import AutoProcessor, PaliGemmaForConditionalGeneration
from PIL import Image
import requests
import torch


# FastAPI 앱 생성
app = FastAPI()

##### Model Initialize #####
model_id = "google/paligemma-3b-pt-224"
model = PaliGemmaForConditionalGeneration.from_pretrained(model_id).eval()
processor = AutoProcessor.from_pretrained(model_id)
############################

# 이미지와 텍스트를 함께 처리하는 엔드포인트 설정
@app.post("/predict/")
async def predict(file: UploadFile = File(...), text_data: str = Form(None)):
    # 이미지를 PIL 형식으로 로드
    image = Image.open(file.file).convert('RGB')
    print(text_data)
    if text_data is not None: 
        # 입력받은 텍스트를 프롬프트로 사용
        prompt = text_data
    else: # 미리 설정한 프롬프트 사용
        prompt = """
        ocr name and price of the product.
        """

    model_inputs = processor(text=prompt, images=image, return_tensors="pt")
    input_len = model_inputs["input_ids"].shape[-1]

    ##### model Inference #####
    with torch.inference_mode():
        generation = model.generate(**model_inputs, max_new_tokens=100, do_sample=False)
        generation = generation[0][input_len:]
        decoded = processor.decode(generation, skip_special_tokens=True)
        print(decoded)
    ###########################
    
    # 결과 반환
    return {"result": decoded}
