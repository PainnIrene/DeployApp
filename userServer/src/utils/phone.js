const normalizedPhoneNumbers = (phoneNumbers) => {
  if (phoneNumbers.startsWith("+")) {
    return phoneNumbers.slice(1); // Bỏ dấu '+' (vd: '+84343352928' -> '84343352928')
  } else if (phoneNumbers.startsWith("0")) {
    return "84" + phoneNumbers.slice(1); // Thay '0' bằng '84' (vd: '0343352928' -> '84343352928')
  } else {
    return phoneNumbers; // Không thay đổi nếu đã ở dạng chuẩn
  }
};

export { normalizedPhoneNumbers };
