const extractPathFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch (error) {
    return null;
  }
};
export { extractPathFromUrl };
