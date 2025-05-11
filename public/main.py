from fastapi import FastAPI, File, UploadFile
from deepface import DeepFace
import cv2
import numpy as np
import io
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message":"CORS esta corriendo correctamente"}

@app.post("/predict-emotion/")
async def predict_emotion(file:UploadFile = File(...)):
    model = DeepFace.build_model("Facenet")
    contents = await file.read()
    nparr = np.frombuffer(contents,np.uint8)
    img = cv2.imdecode(nparr,cv2.IMREAD_COLOR)

    print(img.shape)

    if img is None:
        return {"error": "Imagen no válida o no se pudo cargar."}
    
    result = DeepFace.analyze(img,actions=['emotion'])

    if isinstance(result, list) and len(result) > 0:
        emotion = result[0].get('dominant_emotion', 'Desconocida')
        return {"emotion": emotion}
    else:
        return {"error": "No se pudo obtener el análisis de emociones"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)