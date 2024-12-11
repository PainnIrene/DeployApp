import json
import asyncio
import aio_pika
from src.config import RABBITMQ_CONFIG
from src.schemas import ProductMessage, DetectionResult
from src.analyzer import ProductAnalyzer

async def process_message(message: aio_pika.IncomingMessage, analyzer: ProductAnalyzer, channel: aio_pika.Channel):
    async with message.process():
        try:
            # Parse message
            body = json.loads(message.body.decode())
            print("\n----- New Product Analysis -----")
            print(f"Analyzing product: {body['productName']}")
            
            product = ProductMessage(**body)
            result = None
            
            # Analyze text first
            print("\nKiểm tra text...")
            text_result = analyzer.analyze_text(product.productName, product.productDescription)
            if text_result:
                result = text_result
                print("🚫 KẾT QUẢ: PHÁT HIỆN VI PHẠM")
                print(f"Lý do: {text_result.message}")
                print(f"Từ khóa vi phạm: {text_result.details['matched_keywords']}")
            else:
                print("✅ Text không có từ khóa vi phạm")
                
                # If text is clean, analyze images
                print("\nKiểm tra ảnh...")
                for idx, image_url in enumerate(product.productImages, 1):
                    print(f"Đang kiểm tra ảnh {idx}/{len(product.productImages)}")
                    image_result = await analyzer.analyze_image(image_url)
                    if image_result:
                        if image_result.decision == "detect":
                            print("🚫 KẾT QUẢ: PHÁT HIỆN VI PHẠM")
                            print(f"Độ tin cậy: {image_result.confidence:.2%}")
                            print("Lý do: Phát hiện hình ảnh thuốc lá/thuốc lá điện tử")
                            result = image_result
                            break
                        elif image_result.decision == "refer":
                            print("⚠️ KẾT QUẢ: KHÔNG CHẮC CHẮN - CẦN KIỂM DUYỆT")
                            print(f"Độ tin cậy: {image_result.confidence:.2%}")
                            result = image_result
                            break
                        else:
                            print(f"✅ Ảnh {idx} không phát hiện vi phạm")
                
            # Hiển thị kết quả cuối cùng
            print("\n=== KẾT QUẢ CUỐI CÙNG ===")
            final_decision = "not_detect"
            if result:
                final_decision = result.decision
                
            if final_decision == "not_detect":
                print("✅ KHÔNG PHÁT HIỆN VI PHẠM")
            elif final_decision == "detect":
                print("🚫 PHÁT HIỆN VI PHẠM")
            else:
                print("⚠️ CẦN KIỂM DUYỆT")
            
            # Publish result message
            result_message = {
                "_id": body.get("_id"),
                "result": final_decision
            }
            
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps(result_message).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key="detect_product_queue"
            )
            
            print(f"Đã gửi kết quả phân tích cho sản phẩm ID: {body.get('_id')}")
            print("---------------------------------\n")

        except Exception as e:
            print("\n❌ LỖI KHI PHÂN TÍCH SẢN PHẨM")
            print(f"Chi tiết lỗi: {str(e)}")
            print("---------------------------------\n")

async def main():
    connection = None
    retry_count = 0
    max_retries = 5
    
    while retry_count < max_retries:
        try:
            # Khởi tạo analyzer
            analyzer = ProductAnalyzer()

            # Connect to RabbitMQ
            connection = await aio_pika.connect_robust(
                f"amqp://{RABBITMQ_CONFIG['username']}:{RABBITMQ_CONFIG['password']}@"
                f"{RABBITMQ_CONFIG['host']}:{RABBITMQ_CONFIG['port']}{RABBITMQ_CONFIG['vhost']}",
                retry_delay=5
            )

            channel = await connection.channel()
            
            # Setup exchange và queue
            exchange = await channel.declare_exchange(
                "product_exchange",
                aio_pika.ExchangeType.DIRECT,
                durable=True
            )
            
            queue = await channel.declare_queue(
                "product_queue",
                durable=True
            )
            
            # Declare detect product queue for results
            await channel.declare_queue(
                "detect_product_queue",
                durable=True
            )
            
            await queue.bind(exchange, "product.detect")
            
            # Start consuming
            async def message_handler(message):
                await process_message(message, analyzer, channel)
                
            await queue.consume(message_handler)
            
            print(" [*] Waiting for messages. To exit press CTRL+C")
            await asyncio.Future()  # wait forever
            
            break  # If successful, break the retry loop
            
        except aio_pika.AMQPException as e:
            retry_count += 1
            print(f"RabbitMQ Error (attempt {retry_count}/{max_retries}): {str(e)}")
            await asyncio.sleep(5)  # Wait before retrying
            
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            break
            
        finally:
            if connection:
                try:
                    await connection.close()
                except:
                    pass

if __name__ == "__main__":
    asyncio.run(main())