import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./AddNewProduct.module.scss";
import classNames from "classnames/bind";
import uploadImageIcon from "../../../assets/icons/product/uploadImage.svg";
import cropIcon from "../../../assets/icons/product/crop.svg";
import deleteIcon from "../../../assets/icons/product/delete.svg";
import plusIcon from "../../../assets/icons/product/plus.svg";
import uploadVideoIcon from "../../../assets/icons/product/videoUpload.svg";
import viewIcon from "../../../assets/icons/product/view.svg";
import CropImage from "../../Crop/CropImage";
import ViewVideo from "../../Video/ViewVideo";
import ImageToolTip from "../../ToolsTip/ImageToolTip/index";
import axios from "axios";
import Swal from "sweetalert2";

const cx = classNames.bind(styles);

const AddNewProduct = ({ setShowAddNewProduct }) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageRatio, setImageRatio] = useState("1:1");
  const [images, setImages] = useState([]);
  const [promotionImage, setPromotionImage] = useState("");
  const [promotionImagePreview, setPromotionImagePreview] = useState("");
  const [isPromotionCrop, setIsPromotionCrop] = useState(false);
  const [video, setVideo] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [duration, setDuration] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageCurrentIndex, setImageCurrentIndex] = useState(null);
  const [displayCropImage, setDisplayCropImage] = useState(false);
  const [displayVideo, setDisplayVideo] = useState(false);
  const [isVariations, setIsVariations] = useState(false);
  const [isVariation2, setIsVariation2] = useState(false);
  const [variations1, setVariations1] = useState([
    { value: "", image: "", preview: "" },
  ]);
  const [variations2, setVariations2] = useState([{ value: "" }]);
  const [variation1, setVariation1] = useState("");
  const [variation2, setVariation2] = useState("");
  //store options
  const [options, setOptions] = useState([]);
  const [applyToAllValues, setApplyToAllValues] = useState({
    inStock: "",
    price: "",
    SKU: "",
  });

  //ref list for upload image button in options
  const fileInputRefs = useRef([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const promotionInputRef = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!productName || !category || images.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Required Fields",
        text: "Please fill in all required fields (Product Name, Category, and at least one product image)",
        confirmButtonColor: "#8c52ff",
      });
      return;
    }

    // Show loading state
    Swal.fire({
      title: "Creating Product",
      html: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("ratio", imageRatio);
    formData.append("variations2Length", variations2.length);

    images.forEach((image) => {
      formData.append("images", image);
    });

    variations1.forEach((variation, index) => {
      if (variation.image) {
        formData.append(`optionImages`, variation.image);
        formData.append(`optionImagesIndex`, index);
      }
    });
    formData.append("promotionImage", promotionImage);
    formData.append("video", video);

    options.forEach((item, index) => {
      formData.append(`options[${index}][type1]`, item.type1);
      formData.append(`options[${index}][value1]`, item.value1);
      formData.append(`options[${index}][type2]`, item.type2);
      formData.append(`options[${index}][value2]`, item.value2);
      formData.append(`options[${index}][price]`, item.price);
      formData.append(`options[${index}][inStock]`, item.inStock);
      formData.append(`options[${index}][condition]`, item.condition);
      formData.append(`options[${index}][preOrder]`, item.preOrder);
      formData.append(`options[${index}][SKU]`, item.SKU);
    });

    try {
      const response = await axios.post(
        "http://localhost:3002/product/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Product created successfully",
          confirmButtonColor: "#8c52ff",
        });
        setShowAddNewProduct(false); // Close the modal
      }
    } catch (error) {
      console.error("Error creating product:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to create product. Please try again.",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  useEffect(() => {
    const newGeneratedArray = variations1
      .filter((v) => v.value !== "") // Loại bỏ các giá trị rỗng trong variations1
      .flatMap((v1) =>
        // Nếu variations2 rỗng, tạo ra object với type2 và value2 rỗng
        variations2.length === 0 || variations2.every((v) => v.value === "")
          ? [
              {
                type1: variation1,
                value1: v1.value,
                type2: "",
                value2: "",
                price: 0,
                image: v1.image || null,
                inStock: 0,
                condition: "",
                preOrder: 0,
              },
            ]
          : variations2
              .filter((v) => v.value !== "") // Loại bỏ các giá trị rỗng trong variations2
              .map((v2) => ({
                type1: variation1,
                value1: v1.value,
                type2: variation2,
                value2: v2.value,
                price: 0,
                image: v1.image || null,
                inStock: 0,
                condition: "",
                preOrder: 0,
              }))
      );

    setOptions(newGeneratedArray);
    console.log("Generated Array:", newGeneratedArray);
  }, [variations1, variations2, variation1, variation2]);
  const handleOptionsChange = (index, field, value) => {
    const updatedOptions = [...options];

    // Xử lý giá trị dựa trên trường field
    if (field === "price") {
      // Chuyển đổi giá trị thành số thực
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: parseFloat(value) || 0,
      };
    } else if (field === "inStock") {
      // Chuyển đổi giá trị thành số nguyên
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: parseInt(value, 10) || 0,
      };
    } else {
      // Các trường khác
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    }

    setOptions(updatedOptions);
  };

  const handleApplyToAll = () => {
    setOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        inStock: applyToAllValues.inStock
          ? parseInt(applyToAllValues.inStock, 10)
          : option.inStock,
        price: applyToAllValues.price
          ? parseFloat(applyToAllValues.price)
          : option.price,
        SKU: applyToAllValues.SKU || option.SKU,
      }))
    );
  };
  const handleApplyToAllChange = (e) => {
    const { name, value } = e.target;
    setApplyToAllValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Đặt lại chiều cao để tính toán chính xác
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Đặt chiều cao mới
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [description]);

  useEffect(() => {
    if (images.length > 0) {
      const newImagePreviews = images.map((image) =>
        URL.createObjectURL(image)
      );
      setImagePreviews(newImagePreviews);

      // Cleanup URLs when component unmounts or images change
      return () => {
        newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      };
    }
  }, [images]);

  const handleUploadImageButton = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);

    e.target.value = null; // set input=null to accept onChange new value
  };
  const handleUploadPromotionImageButton = () => {
    promotionInputRef.current.click();
  };
  const handlePromotionImageChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setPromotionImage(files[0]);
    }
  };
  useEffect(() => {
    if (promotionImage) {
      const objectUrl = URL.createObjectURL(promotionImage);
      setPromotionImagePreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [promotionImage]);
  const handleDeleteImage = (index) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
  };
  const handleDeletePromotionImage = () => {
    setPromotionImage("");
    setPromotionImagePreview("");
    URL.revokeObjectURL(promotionImagePreview);
  };

  const handleUploadVideoButton = () => {
    videoInputRef.current.click();
  };

  const handleVideoChange = async (e) => {
    const files = Array.from(e.target.files);

    // Nếu không có file nào được chọn, bỏ qua
    if (files.length === 0) return;

    const file = files[0];

    // Kiểm tra định dạng
    if (!file.type.startsWith("video/mp4")) {
      alert("Only MP4 videos are allowed.");
      return;
    }

    // Kiểm tra kích thước
    if (file.size > 30 * 1024 * 1024) {
      // 30 MB
      alert("File size should not exceed 30 MB.");
      return;
    }

    // Tạo video element để kiểm tra độ phân giải và thời gian
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(file);

    videoElement.onloadedmetadata = () => {
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      const duration = videoElement.duration;

      // Kiểm tra độ phân giải
      if (width > 1280 || height > 1280) {
        alert("Resolution should not exceed 1280x1280px.");
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      // Kiểm tra thời gian video
      if (duration < 10 || duration > 60) {
        alert("Video duration should be between 10s and 60s.");
        URL.revokeObjectURL(videoElement.src);
        return;
      }

      // Nếu video hợp lệ, cập nhật video và hiển thị preview
      setVideoPreview(URL.createObjectURL(file));
      setVideo(file);
      setDuration(Math.round(duration));

      // Giải phóng URL
      URL.revokeObjectURL(videoElement.src);
    };

    videoElement.onerror = () => {
      alert("Error loading video.");
    };
  };

  const handleDeleteVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview("");
    setVideo("");
    setDuration(null);
  };

  const handleImageCrop = useCallback((index) => {
    setImageCurrentIndex(index);
    setDisplayCropImage(true);
  }, []);
  useEffect(() => {
    if (!displayCropImage) {
      setImageCurrentIndex(null);
      setIsPromotionCrop(false);
    }
  }, [displayCropImage]);
  const getAspectRatioValue = (aspectRatio) => {
    switch (aspectRatio) {
      case "1:1":
        return 1;
      case "3:4":
        return 3 / 4;
      default:
        return 1;
    }
  };
  const handlePromotionCropButton = () => {
    setDisplayCropImage(true);
    setIsPromotionCrop(true);
  };
  const handleEnableVariations = () => {
    setIsVariations((prev) => !prev);
  };
  const handleAddVariation2 = () => {
    setIsVariation2((prev) => !prev);
  };
  const handleChangeVariations2 = (index, e) => {
    const newValue = e.target.value.trim();
    let newVariations = [...variations2];

    // Update the specific input value
    newVariations[index].value = newValue;

    // If the input is not empty and it's the last item, add a new empty item
    if (newValue !== "" && index === variations2.length - 1) {
      newVariations.push({ value: "" });
    }

    // Update the state
    setVariations2(newVariations);
  };
  const handleChangeVariations1 = (index, e) => {
    const newValue = e.target.value.trim();
    let newVariations = [...variations1];

    // Update the specific input value
    newVariations[index].value = newValue;

    // If the input is not empty and it's the last item, add a new empty item
    if (newValue !== "" && index === variations1.length - 1) {
      newVariations.push({ value: "" });
    }

    // Update the state
    setVariations1(newVariations);
  };

  const handleBlurVariations2 = (index, e) => {
    // Optional: handle additional logic when input loses focus
  };

  const handleDeleteVariations2 = (index) => {
    if (variations2.length > 1) {
      const newVariations = variations2.filter((_, i) => i !== index);

      // Ensure at least one empty value is present
      if (
        newVariations.length === 0 ||
        newVariations.every((v) => v.value !== "")
      ) {
        newVariations.push({ value: "" });
      }

      setVariations2(newVariations);
    }
  };
  const handleDeleteVariations1 = (index) => {
    if (variations1.length > 1) {
      // Giải phóng URL blob của ảnh cần xóa trước khi xóa nó khỏi mảng
      const imageToDelete = variations1[index];
      if (imageToDelete.preview) {
        URL.revokeObjectURL(imageToDelete.preview);
      }

      // Tạo một mảng mới bằng cách loại bỏ phần tử tại chỉ số 'index'
      const newVariations = variations1.filter((_, i) => i !== index);

      // Kiểm tra nếu mảng mới rỗng hoặc nếu tất cả các phần tử còn lại đều có `value` rỗng
      if (
        newVariations.length === 0 ||
        newVariations.every((v) => v.value === "")
      ) {
        // Nếu điều kiện trên đúng, thêm một phần tử mới với `value` rỗng vào mảng
        newVariations.push({ value: "" });
      }

      // Cập nhật trạng thái `variations1` với mảng mới
      setVariations1(newVariations);
    }
  };

  const handleImageOptionsChange = (index, e) => {
    const file = e.target.files[0];

    if (file) {
      // Tạo URL blob cho ảnh
      const previewUrl = URL.createObjectURL(file);
      // Cập nhật mảng variations1 với ảnh và preview mới
      setVariations1((prevVariations) =>
        prevVariations.map((item, i) =>
          i === index ? { ...item, image: file, preview: previewUrl } : item
        )
      );

      // Giải phóng URL blob khi không còn cần thiết
      return () => URL.revokeObjectURL(previewUrl);
    }

    // Đặt lại giá trị của input sau khi xử lý
    e.target.value = null;
  };

  useEffect(() => {
    console.log("variations1:", variations1);
    console.log("variations2:", variations2);
    console.log("options", options);
  }, [variations1, variations2, options]);

  const deleteImageAtVariations1 = (index) => {
    setVariations1((prevVariations) => {
      // Tạo một bản sao mới của mảng
      const newVariations = [...prevVariations];

      // Xóa ảnh và bản xem trước tại chỉ số được chỉ định
      newVariations[index].image = null;
      newVariations[index].preview = "";

      return newVariations;
    });
  };

  return (
    <>
      {displayCropImage && imageCurrentIndex !== null && (
        <CropImage
          setDisplayCropImage={setDisplayCropImage}
          aspectRatio={getAspectRatioValue(imageRatio)}
          image={URL.createObjectURL(images[imageCurrentIndex])}
        />
      )}
      {displayCropImage && isPromotionCrop && (
        <CropImage
          setDisplayCropImage={setDisplayCropImage}
          setIsPromotionCrop={setIsPromotionCrop}
          aspectRatio={1}
          image={promotionImagePreview}
        />
      )}
      {displayVideo && videoPreview && (
        <ViewVideo setDisplayVideo={setDisplayVideo} source={videoPreview} />
      )}

      <div className={cx("container")}>
        <div className={cx("heading")}>
          <h1 className={cx("title")}>New Product</h1>
          <button
            className={cx("exitButton")}
            onClick={() => setShowAddNewProduct(false)}
          >
            X
          </button>
        </div>
        <h1>Basic Information</h1>
        <div className={cx("main-contents")}>
          <div className={cx("basic-info")}>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Product Name</label>
              </div>
              <div className={cx("input-container")}>
                <input
                  placeholder="Brand Name + Product Name + Key Features (Materials, Colors, Size, Model)"
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            </div>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Category</label>
              </div>
              <div className={cx("input-container")}>
                <input onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Description</label>
              </div>
              <div className={cx("input-container")}>
                <textarea
                  ref={textareaRef}
                  maxLength={3000}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className={cx("text-area-control")}>
                  {description.length > 0 && description.length < 100 ? (
                    <p>
                      Your product description is too short. Please input at
                      least 100 characters.
                    </p>
                  ) : (
                    <p></p>
                  )}
                  {description.length > 0 ? (
                    <span
                      className={cx({
                        inValid: description.length < 100,
                      })}
                    >
                      {description.length}/3000
                    </span>
                  ) : (
                    <span>0/3000</span>
                  )}
                </div>
              </div>
            </div>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Product Image</label>
              </div>
              <div className={cx("ratio-container")}>
                <label>
                  <input
                    type="radio"
                    name="image-ratio"
                    value="1:1"
                    checked={imageRatio === "1:1"}
                    onChange={(e) => setImageRatio(e.target.value)}
                  />
                  1:1 Image
                </label>
                <label>
                  <input
                    type="radio"
                    name="image-ratio"
                    value="3:4"
                    checked={imageRatio === "3:4"}
                    onChange={(e) => setImageRatio(e.target.value)}
                  />
                  3:4 Image
                </label>
              </div>
            </div>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label></label>
              </div>
              <div className={cx("images-container")}>
                {imagePreviews.length < 9 && (
                  <div className={cx("upload-container")}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={handleUploadImageButton}
                      className={cx({
                        "button-1-1": imageRatio === "1:1",
                        "button-3-4": imageRatio === "3:4",
                      })}
                    >
                      <img src={uploadImageIcon} alt="upload icon" />
                      <h4>Add Image</h4>
                      {imagePreviews.length > 0 ? (
                        <span>({imagePreviews.length}/9)</span>
                      ) : (
                        <span>(0/9)</span>
                      )}
                    </button>
                  </div>
                )}
                <div className={cx("image-previews")}>
                  {imagePreviews.map((preview, index) => (
                    <div
                      className={cx({
                        "single-image-container": imageRatio === "1:1",
                        "single-image-container-3-4": imageRatio === "3:4",
                      })}
                      key={index}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className={cx("image-preview")}
                      />
                      <div>
                        <button onClick={() => handleImageCrop(index)}>
                          <img src={cropIcon} alt="crop icon" />
                        </button>
                        <hr />
                        <button onClick={() => handleDeleteImage(index)}>
                          <img src={deleteIcon} alt="delete icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Promotion Image</label>
              </div>
              <div className={cx("images-container")}>
                {!promotionImagePreview && (
                  <div className={cx("upload-container")}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      ref={promotionInputRef}
                      onChange={handlePromotionImageChange}
                    />
                    <button
                      onClick={handleUploadPromotionImageButton}
                      className={cx("button-1-1")}
                    >
                      <img src={uploadImageIcon} alt="upload icon" />
                      <h4> </h4>
                      <span>(0/1)</span>
                    </button>
                  </div>
                )}
                <div className={cx("image-previews")}>
                  {promotionImage && promotionImagePreview && (
                    <div className={cx("single-image-container")}>
                      <img
                        src={promotionImagePreview}
                        alt="promotion"
                        className={cx("image-preview")}
                      />
                      <div>
                        <button onClick={handlePromotionCropButton}>
                          <img src={cropIcon} alt="crop icon" />
                        </button>
                        <hr />
                        <button onClick={handleDeletePromotionImage}>
                          <img src={deleteIcon} alt="delete icon" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label>Product Video</label>
              </div>
              <div className={cx("video-input")}>
                {!videoPreview && (
                  <div className={cx("upload-container")}>
                    <input
                      type="file"
                      accept="video/mp4"
                      style={{ display: "none" }}
                      ref={videoInputRef}
                      onChange={handleVideoChange}
                    />
                    <button
                      onClick={handleUploadVideoButton}
                      className={cx("button-1-1")}
                    >
                      <img src={uploadVideoIcon} alt="upload icon" />
                      <h4> </h4>
                      <span>(0/1)</span>
                    </button>
                  </div>
                )}
                <div className={cx("video-previews")}>
                  {videoPreview && (
                    <div className={cx("video-wrapper")}>
                      <video src={videoPreview} />
                      <h4>00:{duration}</h4>
                      <div>
                        <button onClick={() => setDisplayVideo(true)}>
                          <img src={viewIcon} alt="crop icon" />
                        </button>
                        <hr />
                        <button>
                          <img
                            src={deleteIcon}
                            alt="delete icon"
                            onClick={handleDeleteVideo}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div> */}
            {/* <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Condition</label>
              </div>
              <div className={cx("input-container")}>
                <input />
              </div>
            </div> */}
            {/* <div className={cx("row-container")}>
              <div className={cx("label-container")}>
                <label className={cx("add-star")}>Pre-Order?</label>
              </div>
              <div className={cx("input-container")}>
                <input />
              </div>
            </div> */}
            {/* Phân loại hàng */}
            {!isVariations ? (
              <>
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>Variations</label>
                  </div>
                  <div className={cx("variations-button-container")}>
                    <button onClick={handleEnableVariations}>
                      Enable Variations
                    </button>
                  </div>
                </div>
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>Price(VND)</label>
                  </div>
                  <div className={cx("input-container")}>
                    <input
                      onChange={(e) =>
                        handleOptionsChange(0, "price", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>In Stocks</label>
                  </div>
                  <div className={cx("input-container")}>
                    <input
                      onChange={(e) =>
                        handleOptionsChange(0, "inStock", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>SKU</label>
                  </div>
                  <div className={cx("input-container")}>
                    <input
                      onChange={(e) =>
                        handleOptionsChange(0, "SKU", e.target.value)
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Enable Variations */}
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>Variations</label>
                  </div>
                  <div className={cx("variations-container")}>
                    <div className={cx("variations-heading")}>
                      <div className={cx("left")}>
                        <input
                          type="text"
                          placeholder="Ex:Color"
                          required
                          onChange={(e) => setVariation1(e.target.value)}
                        />
                      </div>
                      <div className={cx("right")}>
                        <button
                          onClick={() => {
                            handleEnableVariations();
                            setVariation1("");
                            setVariation2("");
                            setVariations1([{ value: "" }]);
                            setVariations2([{ value: "" }]);
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                    <hr />
                    <div className={cx("variations-contents")}>
                      {variations1.map((variation, index) => (
                        <div
                          key={index}
                          className={cx("variations-input-value")}
                        >
                          <input
                            type="file"
                            style={{ display: "none" }}
                            ref={(el) => (fileInputRefs.current[index] = el)}
                            accept="image/*"
                            onChange={(e) => handleImageOptionsChange(index, e)}
                            onClick={(e) => {
                              e.target.value = ""; //upload same image mutiples time
                            }}
                          />
                          {!variation.preview ? (
                            <button
                              className={cx("add-image-variations-button")}
                              onClick={() =>
                                fileInputRefs.current[index]?.click()
                              }
                            >
                              <img
                                src={uploadImageIcon}
                                alt="add variation button"
                              />
                            </button>
                          ) : (
                            <ImageToolTip
                              image={variation.preview}
                              ratio={imageRatio}
                              index={index}
                              deleteImageAtVariations1={
                                deleteImageAtVariations1
                              }
                            />
                          )}
                          <input
                            type="text"
                            value={variation.value}
                            onChange={(e) => handleChangeVariations1(index, e)}
                            placeholder="Red,Blue,Green,etc"
                          />
                          <button
                            className={cx("delete-variations-button")}
                            onClick={() => handleDeleteVariations1(index)}
                          >
                            <img src={deleteIcon} alt="delete button" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {!isVariation2 ? (
                  <div className={cx("row-container")}>
                    <div className={cx("label-container")}>
                      <label></label>
                    </div>
                    <div className={cx("variations-container")}>
                      <button
                        className={cx("add-variations-2-button")}
                        onClick={handleAddVariation2}
                      >
                        <img src={plusIcon} alt="plusIcon" />
                        <span>Add Variation 2</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={cx("row-container")}>
                    <div className={cx("label-container")}>
                      <label></label>
                    </div>
                    <div className={cx("variations-container")}>
                      <div className={cx("variations-heading")}>
                        <div className={cx("left")}>
                          <input
                            type="text"
                            placeholder="Ex:Size"
                            required
                            onChange={(e) => setVariation2(e.target.value)}
                          />
                        </div>
                        <div className={cx("right")}>
                          <button
                            onClick={() => {
                              handleAddVariation2();
                              setVariation2("");
                              setVariations2([{ value: "" }]);
                            }}
                          >
                            X
                          </button>
                        </div>
                      </div>
                      <hr />
                      <div className={cx("variations-contents")}>
                        {variations2.map((variation, index) => (
                          <div
                            key={index}
                            className={cx("variations-input-value")}
                          >
                            <input
                              type="text"
                              value={variation.value}
                              onChange={(e) =>
                                handleChangeVariations2(index, e)
                              }
                              onBlur={(e) => handleBlurVariations2(index, e)}
                              placeholder="Size S, Size M, etc"
                            />
                            <button
                              className={cx("delete-variations-button")}
                              onClick={() => handleDeleteVariations2(index)}
                            >
                              <img src={deleteIcon} alt="delete button" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className={cx("row-container")}>
                  <div className={cx("label-container")}>
                    <label className={cx("add-star")}>Variation List</label>
                  </div>
                  <div className={cx("variation-list-container")}>
                    <table className={cx("table")}>
                      <thead>
                        <tr>
                          <th>{variation1}</th>
                          {variation2 && <th>{variation2}</th>}
                          <th>In Stock</th>
                          <th>Price</th>
                          <th>SKU</th>
                        </tr>
                        <tr>
                          <td colSpan={variation2 ? "2" : "1"}>
                            <button onClick={handleApplyToAll}>
                              Apply To All
                            </button>
                          </td>
                          <th>
                            <input
                              type="number"
                              name="inStock"
                              placeholder="In Stock"
                              value={applyToAllValues.inStock}
                              onChange={handleApplyToAllChange}
                            />
                          </th>
                          <th>
                            <input
                              type="number"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              name="price"
                              placeholder="Price"
                              value={applyToAllValues.price}
                              onChange={handleApplyToAllChange}
                            />
                          </th>
                          <th>
                            <input
                              type="text"
                              name="SKU"
                              placeholder="SKU"
                              value={applyToAllValues.SKU}
                              onChange={handleApplyToAllChange}
                            />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {options.reduce((acc, option, index, array) => {
                          if (
                            index === 0 ||
                            option.value1 !== array[index - 1].value1
                          ) {
                            const rowSpan = array
                              .slice(index)
                              .findIndex(
                                (item) => item.value1 !== option.value1
                              );
                            const span =
                              rowSpan === -1 ? array.length - index : rowSpan;

                            acc.push(
                              <tr key={index}>
                                <td rowSpan={span}>{option.value1}</td>
                                {variation2 && <td>{option.value2}</td>}
                                <td>
                                  <input
                                    type="number"
                                    placeholder="In Stock"
                                    value={option.inStock}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "inStock",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder="Price"
                                    value={option.price}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    placeholder="SKU"
                                    value={option.SKU || ""}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "SKU",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          } else {
                            acc.push(
                              <tr key={index}>
                                {variation2 && <td>{option.value2}</td>}
                                <td>
                                  <input
                                    type="number"
                                    placeholder="In Stock"
                                    value={option.inStock}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "inStock",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder="Price"
                                    value={option.price}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    placeholder="SKU"
                                    value={option.SKU || ""}
                                    onChange={(e) =>
                                      handleOptionsChange(
                                        index,
                                        "SKU",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          }
                          return acc;
                        }, [])}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            <button className={cx("create-button")} onClick={handleSubmit}>
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewProduct;
