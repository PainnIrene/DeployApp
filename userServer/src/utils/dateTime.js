const validDateString = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateString.match(regex) === null) {
    return false;
  }

  const date = new Date(dateString);

  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    return false;
  }

  if (
    date.getFullYear() !== parseInt(dateString.substr(0, 4)) ||
    date.getMonth() + 1 !== parseInt(dateString.substr(5, 2)) ||
    date.getDate() !== parseInt(dateString.substr(8, 2))
  ) {
    return false;
  }

  return true;
};
export { validDateString };
