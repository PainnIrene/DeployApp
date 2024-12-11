import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CreditCardForm.module.scss";
import chip from "../../../assets/images/CreditCardForm/chip.png";
import visaIcon from "../../../assets/images/CreditCardForm/cardType/visa.png";
import amexIcon from "../../../assets/images/CreditCardForm/cardType/amex.png";
import mastercardIcon from "../../../assets/images/CreditCardForm/cardType/mastercard.png";
import discoverIcon from "../../../assets/images/CreditCardForm/cardType/discover.png";
import troyIcon from "../../../assets/images/CreditCardForm/cardType/troy.png";
const importAll = (r) => r.keys().map(r);

const images = importAll(
  require.context(
    "../../../assets/images/CreditCardForm/background/",
    false,
    /\.(png|jpe?g|svg)$/
  )
);

const cx = classNames.bind(styles);

const CreditCardForm = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [cvvMask, setCVVMask] = useState("");
  const [cvvMaxLength, setCvvMaxLength] = useState(4);
  const [monthExpire, setMonthExpire] = useState("");
  const [yearExpire, setYearExpire] = useState("");
  const [minCardMonth, setMinCardMonth] = useState(1);
  const [minCardYear, setMinCardYear] = useState(new Date().getFullYear());
  const amexCardMask = "#### ###### #####";
  const otherCardMask = "#### #### #### ####";

  const [focusedInput, setFocusedInput] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const nameRef = useRef(null);
  const cvvRef = useRef(null);
  const numberRef = useRef(null);
  const cardExpireRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const [isInside, setIsInside] = useState(false);
  const [icon, setIcon] = useState(null);
  const [randomBackground, setRandomBackground] = useState(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomBackground(images[randomIndex]);
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    setMinCardMonth(currentDate.getMonth() + 1);
    setMinCardYear(currentDate.getFullYear());
  }, []);

  const handleMonthChange = (e) => {
    setMonthExpire(e.target.value);
  };

  const handleYearChange = (e) => {
    setYearExpire(e.target.value);
    // Reset month if year changes to current year
    if (parseInt(e.target.value) === minCardYear) {
      setMonthExpire("");
    }
  };

  const formatExpiration = () => {
    if (!monthExpire && !yearExpire) return "MM/YY";
    const formattedMonth = monthExpire.padStart(2, "0");
    const formattedYear = yearExpire.slice(-2);
    return `${formattedMonth}/${formattedYear}`;
  };

  const getCardType = (number) => {
    const reVisa = new RegExp("^4");
    const reAmex = new RegExp("^(34|37)");
    const reMastercard = new RegExp("^5[1-5]");
    const reDiscover = new RegExp("^6011");
    const reTroy = new RegExp("^9792");

    if (number.match(reVisa)) return "visa";
    if (number.match(reAmex)) return "amex";
    if (number.match(reMastercard)) return "mastercard";
    if (number.match(reDiscover)) return "discover";
    if (number.match(reTroy)) return "troy";

    return "visa";
  };
  const getCardTypeIcon = (cardType) => {
    switch (cardType) {
      case "visa":
        return visaIcon;
      case "amex":
        return amexIcon;
      case "mastercard":
        return mastercardIcon;
      case "discover":
        return discoverIcon;
      case "troy":
        return troyIcon;
      default:
        return visaIcon;
    }
  };

  const generateCardNumberMask = () => {
    return getCardType(cardNumber) === "amex" ? amexCardMask : otherCardMask;
  };
  const formatCardNumber = (value) => {
    const cardType = getCardType(value);
    const mask = generateCardNumberMask();
    let formatted = "";
    let cardIndex = 0;

    const cleanValue = value.replace(/\s/g, "");

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === "#") {
        if (cleanValue[cardIndex]) {
          if (cardType === "amex") {
            if (cardIndex >= 4 && cardIndex < 13) {
              formatted += "∗";
            } else {
              formatted += cleanValue[cardIndex];
            }
          } else {
            if (cardIndex >= 4 && cardIndex < 12) {
              formatted += "∗";
            } else {
              formatted += cleanValue[cardIndex];
            }
          }
        } else {
          formatted += "#";
        }
        cardIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");

    const cardType = getCardType(input);
    if (cardType === "amex") {
      setCvvMaxLength(4);
    } else {
      setCvvMaxLength(3);
    }
    //set Icon based on card Type
    setIcon(getCardTypeIcon(cardType));

    let formatted = "";
    if (cardType === "amex") {
      for (let i = 0; i < input.length; i++) {
        if (i === 4 || i === 10) {
          formatted += " ";
        }
        formatted += input[i];
      }
      setCardNumber(formatted.slice(0, 17));
    } else {
      for (let i = 0; i < input.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += " ";
        }
        formatted += input[i];
      }
      setCardNumber(formatted.slice(0, 19));
    }
  };

  const handleFullNameChange = (e) => {
    const name = e.target.value;
    setCardName(name.toUpperCase());
  };

  useEffect(() => {
    const card = cardRef.current;

    if (focusedInput && card) {
      let targetRef;
      switch (focusedInput) {
        case "name":
          targetRef = nameRef;
          break;
        case "number":
          targetRef = numberRef;
          break;
        case "cardExpire":
          targetRef = cardExpireRef;
          break;
        default:
          targetRef = null;
      }

      if (targetRef) {
        const element = targetRef.current;
        const rect = element.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        // Set CSS variables for animation
        card.style.setProperty("--left", `${rect.left - cardRect.left}px`);
        card.style.setProperty("--top", `${rect.top - cardRect.top}px`);
        card.style.setProperty("--width", `${rect.width}px`);
        card.style.setProperty("--height", `${rect.height}px`);

        if (card.classList) {
          card.classList.add(styles.focusIn);
          card.classList.remove(styles.focusOut);
        }
      }
    } else {
      if (card && card.classList) {
        card.classList.remove(styles.focusIn);
        card.classList.add(styles.focusOut);
      }
    }
  }, [focusedInput, isFlipped]);

  const handleFocus = (inputName) => {
    if (inputName === "cvv") {
      setIsFlipped(true);
      setFocusedInput(null);
    } else {
      setIsFlipped(false);
      setFocusedInput(inputName);
    }
    clearTimeout(blurTimeoutRef.current);
  };
  const handleBlur = (inputName) => {
    blurTimeoutRef.current = setTimeout(() => {
      if (!isInside) {
        if (inputName === "cvv") {
          setIsFlipped(false);
        } else {
          const card = cardRef.current;
          if (card && card.classList) {
            card.classList.remove(styles.focusIn);
            card.classList.add(styles.focusOut);
          }
        }

        setFocusedInput(null);
      }
    }, 100);
  };

  const handleCVVChange = (e) => {
    const value = e.target.value;
    setCvv(value);
    setCVVMask("*".repeat(value.length));
  };

  return (
    <div className={cx("credit-card-form")}>
      <div className={cx("card", { "is-flipped": isFlipped })} ref={cardRef}>
        <div className={cx("card-inner")}>
          <div className={cx("card-front")}>
            <div className={cx("card-front-background")}>
              <img src={randomBackground} alt="background" />
            </div>
            <div className={cx("card-front-content")}>
              <div className={cx("content-front-top")}>
                <img src={chip} alt="chip card" />
                <img src={icon ? icon : visaIcon} alt="card type" />
              </div>
              <div className={cx("content-front-middle")}>
                <label
                  ref={numberRef}
                  className={cx("card-label")}
                  htmlFor="cardNumber"
                >
                  {formatCardNumber(cardNumber)}
                </label>
              </div>
              <div className={cx("content-front-bottom")}>
                <div className={cx("front-bottom-left")}>
                  <label
                    ref={nameRef}
                    className={cx("card-label")}
                    htmlFor="cardName"
                  >
                    <h4 className={cx("content-title")}>Card Holder</h4>
                    {cardName ? cardName : "FULL NAME"}
                  </label>
                </div>
                <div className={cx("front-bottom-right")}>
                  <label
                    ref={cardExpireRef}
                    className={cx("card-label")}
                    htmlFor="cardExpire"
                  >
                    <h4 className={cx("content-title")}>Expires</h4>
                    {formatExpiration()}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className={cx("card-back")}>
            <div className={cx("card-back-background")}>
              <img src={randomBackground} alt="background" />
            </div>
            <div className={cx("card-back-content")}>
              <div className={cx("card-magnetic-stripe")}></div>
              <div className={cx("card-cvv-label-container")}>
                <h4>CVV</h4>
                <div className={cx("cvv-band")}>
                  <label
                    ref={cvvRef}
                    className={cx("card-label", "cvv-label")}
                    htmlFor="cardCVV"
                  >
                    {cvvMask}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx("inputs")}>
        <h4 className={cx("credit-card-input-label")}>Card Number</h4>
        <input
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          onFocus={() => handleFocus("number")}
          onBlur={() => handleBlur("number")}
          id="cardNumber"
          inputMode="numeric"
          pattern="[0-9]*"
          className={cx("card-input")}
          autoFocus
          autofill="false"
        />
        <h4 className={cx("credit-card-input-label")}>Card Holders</h4>
        <input
          type="text"
          value={cardName}
          onFocus={() => handleFocus("name")}
          onBlur={() => handleBlur("name")}
          id="cardName"
          onChange={handleFullNameChange}
          className={cx("card-input")}
          autofill="false"
        />

        <div className={cx("credit-card-inputs-bottom")}>
          <div
            tabIndex="0"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsInside(false);
                handleBlur("cardExpire");
              }
            }}
            onFocus={() => handleFocus("cardExpire")}
            className={cx("credit-card-inputs-bottom-left")}
          >
            <h4 className={cx("credit-card-input-label")}>Expiration Date</h4>
            <select
              value={monthExpire}
              onChange={handleMonthChange}
              onMouseDown={() => setIsInside(true)}
              onBlur={() => setIsInside(false)}
              id="cardExpire"
              className={cx("credit-card-month-select")}
            >
              <option value="" disabled>
                Month
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option
                  key={n}
                  value={n < 10 ? `0${n}` : `${n}`}
                  disabled={yearExpire === minCardYear && n < minCardMonth}
                >
                  {n < 10 ? `0${n}` : n}
                </option>
              ))}
            </select>
            <select
              value={yearExpire}
              onChange={handleYearChange}
              onMouseDown={() => setIsInside(true)}
              onBlur={() => setIsInside(false)}
            >
              <option value="" disabled>
                Year
              </option>
              {Array.from({ length: 12 }, (_, i) => minCardYear + i).map(
                (n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={cx("credit-card-inputs-bottom-right")}>
            <h4 className={cx("credit-card-input-label")}>CVV</h4>
            <input
              type="text"
              value={cvv}
              onChange={handleCVVChange}
              onFocus={() => handleFocus("cvv")}
              onBlur={() => handleBlur("cvv")}
              id="cardCVV"
              className={cx("card-input", "cvv-input")}
              maxLength={cvvMaxLength}
            />
          </div>
        </div>
      </div>
      <div className={cx("button-container")}>
        <button className={cx("cancel-button")}>Cancel</button>
        <button className={cx("submit-button")}>Submit </button>
      </div>
    </div>
  );
};

export default CreditCardForm;
