import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from "@floating-ui/react";
import styles from "./ImageToolTip.module.scss";
import classNames from "classnames/bind";
import cropIcon from "../../../assets/icons/product/crop.svg";
import deleteIcon from "../../../assets/icons/product/delete.svg";
const cx = classNames.bind(styles);

function ImageToolTip({ image, ratio, index, deleteImageAtVariations1 }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const arrowRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const { refs, floatingStyles, placement, middlewareData, update } =
    useFloating({
      placement: "right",
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 8 }),
        arrow({ element: arrowRef }),
      ],
    });
  console.log(index);
  useEffect(() => {
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, [update]);

  const startHideTimer = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearHideTimer();
    setShowTooltip(true);
  }, [clearHideTimer]);

  const handleMouseLeave = useCallback(() => {
    startHideTimer();
  }, [startHideTimer]);

  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]];

  return (
    <>
      <div
        className={cx("options-image-preview", {
          "small-preview-3-4": ratio === "3:4",
          "small-preview-1-1": ratio === "1:1",
        })}
        ref={refs.setReference}
      >
        <img
          src={image}
          alt="preview"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      {showTooltip && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={cx("tooltipContainer", {
            show: showTooltip,
            "ratio-3-4": ratio === "3:4",
            "ratio-1-1": ratio === "1:1",
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={cx("control-group-buttons")}>
            <button>
              <img src={cropIcon} alt="crop icon" />
            </button>
            <hr />
            <button
              onClick={() => {
                deleteImageAtVariations1(index);
              }}
            >
              <img src={deleteIcon} alt="delete icon" />
            </button>
          </div>
          <img src={image} alt="zoom container" className={cx("largeImage")} />
          <div
            ref={arrowRef}
            className={cx("arrow")}
            style={{
              position: "absolute",
              left:
                middlewareData.arrow?.x != null
                  ? `${middlewareData.arrow.x}px`
                  : "",
              top:
                middlewareData.arrow?.y != null
                  ? `${middlewareData.arrow.y}px`
                  : "",
              right: "",
              bottom: "",
              [staticSide]: "-6px",
            }}
          />
        </div>
      )}
    </>
  );
}

export default ImageToolTip;
