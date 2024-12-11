import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import styles from "./CropImage.module.scss";
import classNames from "classnames/bind";
import debounce from "lodash.debounce";
import zoomInIcon from "../../assets/icons/CropTools/zoomin.svg";
import zoomOutIcon from "../../assets/icons/CropTools/zoomout.svg";
import rotateLeftIcon from "../../assets/icons/CropTools/rotateleft.svg";
import rotateRightIcon from "../../assets/icons/CropTools/rotateright.svg";
import resetIcon from "../../assets/icons/CropTools/reset.svg";
import flipHoriIcon from "../../assets/icons/CropTools/fliphorizontal.svg";
import flipVertiIcon from "../../assets/icons/CropTools/flipvertical.svg";
const cx = classNames.bind(styles);

function CropImage({
  setDisplayCropImage,
  aspectRatio,
  image,
  setIsPromotionCrop,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const cropperRef = useRef(null);

  useEffect(() => {
    if (image && cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.replace(image);
      setPreviewImage(null); // Clear previous cropped image
    }
  }, [image]);

  const handleCrop = useCallback(
    debounce(() => {
      const cropper = cropperRef.current.cropper;
      const croppedCanvas = cropper.getCroppedCanvas();
      setPreviewImage(croppedCanvas.toDataURL());
    }, 250), // Increase delay if necessary
    []
  );

  const handleRotate = useCallback((direction) => {
    const cropper = cropperRef.current.cropper;
    cropper.rotate(direction);
  }, []);

  const handleZoom = useCallback((zoomValue) => {
    const cropper = cropperRef.current.cropper;
    cropper.zoom(zoomValue);
  }, []);

  const handleReset = useCallback(() => {
    const cropper = cropperRef.current.cropper;
    if (cropper) {
      cropper.reset();
      setScaleX(1);
      setScaleY(1);
    }
  }, []);

  const handleFlipHorizontal = useCallback(() => {
    const cropper = cropperRef.current.cropper;
    cropper.scaleX(-scaleX);
    setScaleX(-scaleX);
  }, [scaleX]);

  const handleFlipVertical = useCallback(() => {
    const cropper = cropperRef.current.cropper;
    cropper.scaleY(-scaleY);
    setScaleY(-scaleY);
  }, [scaleY]);

  const leftClass = aspectRatio === 1 ? "left-ratio-1-1" : "left-ratio-3-4";
  const handleExitButton = () => {
    setDisplayCropImage(false);
    if (setIsPromotionCrop) setIsPromotionCrop(false);
  };
  return (
    <div className={cx("container-mask")}>
      <div className={cx("container")}>
        <div className={cx("heading-container")}>
          <h1 className={cx("title")}>Crop Image</h1>
          <button className={cx("exitButton")} onClick={handleExitButton}>
            X
          </button>
        </div>
        <div className={cx("main-contents")}>
          <div className={cx(leftClass)}>
            <div className={cx("left-top")}>
              {image && (
                <Cropper
                  src={image}
                  style={{ height: "100%", width: "100%" }}
                  initialAspectRatio={aspectRatio}
                  aspectRatio={aspectRatio}
                  guides={false}
                  ref={cropperRef}
                  viewMode={0} // Ensures crop box can be resized
                  dragMode="move" // Enables moving of the image
                  cropBoxResizable={true} // Allows resizing of crop box
                  cropBoxMovable={false} // Disables moving of the crop box
                  crop={handleCrop}
                  autoCropArea={1}
                />
              )}
            </div>
            <div className={cx("left-bottom")}>
              <button onClick={() => handleRotate(90)}>
                <img src={rotateLeftIcon} alt="rotate Left Icon" />
              </button>
              <button onClick={() => handleRotate(-90)}>
                <img src={rotateRightIcon} alt="rotate right Icon" />
              </button>
              <button onClick={() => handleZoom(0.1)}>
                <img src={zoomInIcon} alt="zoom in icon" />
              </button>
              <button onClick={() => handleZoom(-0.1)}>
                <img src={zoomOutIcon} alt="zoom out icon" />
              </button>
              <button onClick={handleReset}>
                <img src={resetIcon} alt="reset Icon" />
              </button>
              <button onClick={() => handleFlipHorizontal()}>
                <img src={flipHoriIcon} alt="flip horizontal icon" />
              </button>
              <button onClick={() => handleFlipVertical()}>
                <img src={flipVertiIcon} alt="flip vertical icon" />
              </button>
            </div>
          </div>
          <hr />
          <div className={cx("right")}>
            {previewImage && (
              <div>
                <h3>Preview:</h3>
                <img src={previewImage} alt="Cropped Preview" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropImage;
