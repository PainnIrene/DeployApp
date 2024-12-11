import os
from dotenv import load_dotenv

load_dotenv()

# RabbitMQ config
RABBITMQ_CONFIG = {
    'username': os.getenv('RABBITMQ_USERNAME', 'guest'),
    'password': os.getenv('RABBITMQ_PASSWORD', 'guest'),
    'host': os.getenv('RABBITMQ_HOSTNAME', 'localhost'),
    'port': os.getenv('RABBITMQ_PORT', 5672),
    'vhost': os.getenv('RABBITMQ_VHOST', '/')
}

# Từ khóa liên quan đến thuốc lá
SMOKING_KEYWORDS = [
    'thuốc lá', 'cigarette', 'tobacco', 'xì gà', 'cigar', 
    'thuốc lá điện tử', 'vape', 'e-cigarette', 'smoking',
    'nicotine', 'shisha', 'hookah'
]

# Ngưỡng confidence cho model
CONFIDENCE_THRESHOLDS = {
    "HIGH": 0.9,  # Chắc chắn phát hiện
    "LOW": 0.3    # Chắc chắn không phát hiện
}