from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from pathlib import Path
from datetime import datetime

# ============================================================
# ✅ Custom Retina CNN
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
# ✅ FastAPI setup
# ============================================================
app = FastAPI(title="Retina CNN Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://retina-inky.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ✅ Model + Dataset setup
# ============================================================
DATASET_DIR = Path(__file__).parent / "retinal-samples"
MODEL_PATH = Path(__file__).parent / "model.pth"

if DATASET_DIR.exists():
    CLASS_NAMES = sorted([p.name for p in DATASET_DIR.iterdir() if p.is_dir()])
else:
    CLASS_NAMES = ["cataract", "diabetic-retinopathy", "glaucoma", "normal"]

device = (
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)
print(f"🧠 Using device: {device}")

# ============================================================
# ✅ Load trained CNN model
# ============================================================
model = RetinaCNN(num_classes=len(CLASS_NAMES))
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

print(f"✅ Loaded RetinaCNN model from: {MODEL_PATH}")
print(f"📊 Classes: {CLASS_NAMES}")

# ============================================================
# ✅ Image preprocessing
# ============================================================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ============================================================
# ✅ Routes
# ============================================================
@app.get("/status")
def status():
    return {
        "model": "Custom Retina CNN",
        "device": device,
        "classes": CLASS_NAMES,
        "status": "ready"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = F.softmax(outputs, dim=1)[0]

    top_idx = probs.argmax().item()
    confidence = float(probs[top_idx])
    prediction = CLASS_NAMES[top_idx]

    return {
        "filename": file.filename,
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "timestamp": datetime.utcnow().isoformat()
    }
