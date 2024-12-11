import requests
import tempfile
import os
from roboflow import Roboflow
from src.config import SMOKING_KEYWORDS, CONFIDENCE_THRESHOLDS
from src.schemas import DetectionResult

class ProductAnalyzer:
    def __init__(self):
        # Khởi tạo Roboflow model
        rf = Roboflow(api_key="H0MozU0VLc7qO44a45Gf")
        self.model = rf.workspace("smoking-pwchg").project("smoker-zz9gb").version(2).model

    def analyze_text(self, name: str, description: str) -> DetectionResult:
        """Phân tích text xem có chứa từ khóa thuốc lá không"""
        text = f"{name} {description}".lower()
        
        matched_keywords = [k for k in SMOKING_KEYWORDS if k in text]
        
        if matched_keywords:
            return DetectionResult(
                decision="detect",
                confidence=1.0,
                message="Phát hiện từ khóa liên quan đến thuốc lá",
                source="text",
                details={"matched_keywords": matched_keywords}
            )
        return None

    async def analyze_image(self, image_url: str) -> DetectionResult:
        """Phân tích ảnh từ URL"""
        temp_path = None
        try:
            # Tải ảnh từ URL
            response = requests.get(image_url)
            if response.status_code != 200:
                raise Exception(f"Failed to download image: {response.status_code}")

            # Lưu ảnh tạm thời
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                tmp_file.write(response.content)
                temp_path = tmp_file.name

            # Phân tích ảnh từ file tạm
            predictions = self.model.predict(temp_path, confidence=40, overlap=30).json()
            confidences = [float(p['confidence']) for p in predictions.get('predictions', [])]
            
            # Nếu không có predictions hoặc confidences rỗng
            if not predictions.get('predictions', []) or not confidences:
                return DetectionResult(
                    decision="not_detect",
                    confidence=0.0,
                    message="Không phát hiện hình ảnh thuốc lá",
                    source="image",
                    details={"predictions": []}
                )
            
            max_confidence = max(confidences)
            
            if max_confidence >= CONFIDENCE_THRESHOLDS["HIGH"]:
                decision = "detect"
                message = "Phát hiện hình ảnh thuốc lá với độ tin cậy cao"
            elif max_confidence <= CONFIDENCE_THRESHOLDS["LOW"]:
                decision = "not_detect" 
                message = "Không phát hiện hình ảnh thuốc lá"
            else:
                decision = "refer"
                message = "Cần admin xem xét và phê duyệt"

            return DetectionResult(
                decision=decision,
                confidence=max_confidence,
                message=message,
                source="image",
                details={"predictions": predictions.get('predictions', [])}
            )

        except Exception as e:
            print(f"Error analyzing image {image_url}: {str(e)}")
            return None
            
        finally:
            # Đảm bảo xóa file tạm sau khi xử lý
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)