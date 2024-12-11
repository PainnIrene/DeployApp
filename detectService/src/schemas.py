from pydantic import BaseModel
from typing import List

class ProductMessage(BaseModel):
    productName: str
    productDescription: str
    productImages: List[str]

class DetectionResult(BaseModel):
    decision: str  # "detect", "not_detect", "refer"
    confidence: float
    message: str
    source: str    # "text" or "image"
    details: dict = {}