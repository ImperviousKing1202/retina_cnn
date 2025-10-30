from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
from pathlib import Path
from datetime import datetime
import io, os, json
import torch.nn as nn

# ============================================================
# ✅ Retina CNN model
# ============================================================
class RetinaCNN(nn.Module):
    def __init__(self, num_classes=4):
        super(RetinaCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1)
        self.pool1 = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1)
        self.pool2 = nn.MaxPool2d(2, 2)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1)
        self.pool3 = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(128 * 28 * 28, 256)
        self.fc2 = nn.Linear(256, num_classes)

    def forward(self, x):
        x = F.relu(self.conv1(x)); x = self.pool1(x)
        x = F.relu(self.conv2(x)); x = self.pool2(x)
        x = F.relu(self.conv3(x)); x = self.pool3(x)
        x = torch.flatten(x, 1)
        x = self.dropout(F.relu(self.fc1(x)))
        return self.fc2(x)

# ============================================================
# ✅ App setup
# ============================================================
app = FastAPI(title="RETINA CNN Backup Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://retina-inky.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model.pth"
DATASET_DIR = BASE_DIR / "retinal-samples"
MODEL_INFO_PATH = BASE_DIR / "model_info.json"

device = (
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)
print(f"🧠 Using device: {device}")

# ============================================================
# ✅ Dataset / Class Names
# ============================================================
if DATASET_DIR.exists():
    CLASS_NAMES = sorted([p.name for p in DATASET_DIR.iterdir() if p.is_dir()])
else:
    CLASS_NAMES = ["cataract", "diabetic-retinopathy", "glaucoma", "normal"]

print(f"📂 Classes detected: {CLASS_NAMES}")

# ============================================================
# ✅ Load trained CNN model
# ============================================================
model = RetinaCNN(num_classes=len(CLASS_NAMES))
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

print(f"✅ Loaded RetinaCNN model from: {MODEL_PATH}")

# ============================================================
# ✅ Transform
# ============================================================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ============================================================
# ✅ Routes
# ============================================================
@app.get("/")
def root():
    return {"message": "RETINA CNN backup backend running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok", "device": str(device), "classes": CLASS_NAMES}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(img_tensor)
            probs = F.softmax(outputs, dim=1)[0]

        top_idx = probs.argmax().item()
        confidence = float(probs[top_idx])
        label = CLASS_NAMES[top_idx]

        top_probs, top_idxs = torch.topk(probs, k=min(3, len(CLASS_NAMES)))
        top_predictions = [
            {"class": CLASS_NAMES[i], "confidence": float(top_probs[j])}
            for j, i in enumerate(top_idxs)
        ]

        return JSONResponse({
            "filename": file.filename,
            "prediction": label,
            "confidence": round(confidence, 4),
            "top_predictions": top_predictions,
            "timestamp": datetime.now().isoformat(),
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
