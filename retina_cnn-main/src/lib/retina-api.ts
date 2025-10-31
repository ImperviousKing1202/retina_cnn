// src/lib/retina-api.ts
import axios from "axios";

/**
 * Dynamically resolve backend URL
 * - Prefers .env.local → NEXT_PUBLIC_BACKEND_URL
 * - Falls back to http://127.0.0.1:8000 (FastAPI)
 * - Always logs resolved backend for debugging
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

if (typeof window !== "undefined") {
  console.log(`🧠 Using backend: ${BACKEND_URL}`);
}

/**
 * Upload an image to the FastAPI /predict endpoint
 * Returns JSON { filename, prediction, confidence }
 */
export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${BACKEND_URL}/predict`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 20000,
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Error analyzing image:", error);
    throw new Error(
      error.response?.data?.error ||
        `Failed to connect to backend at ${BACKEND_URL}/predict`
    );
  }
}

/**
 * Retrieve list of supported classes from FastAPI /classes
 * Returns JSON { classes: string[] }
 */
export async function fetchClasses() {
  try {
    const response = await axios.get(`${BACKEND_URL}/classes`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching classes:", error);
    throw new Error(
      error.response?.data?.error ||
        `Failed to connect to backend at ${BACKEND_URL}/classes`
    );
  }
}

/**
 * Fetch model info such as accuracy, num_classes, etc.
 */
export async function fetchModelInfo() {
  try {
    const endpoint =
      process.env.NEXT_PUBLIC_BACKEND_URL
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/model-info`
        : 'http://127.0.0.1:8000/model-info'

    const response = await axios.get(endpoint)
    return response.data
  } catch (error: any) {
    console.error('❌ Error fetching model info:', error)
    throw new Error(
      error.response?.data?.error ||
        'Failed to load model info — check backend connection.'
    )
  }
}
