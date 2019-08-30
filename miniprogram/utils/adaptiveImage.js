export const adapterImage = (outViewSize, imageSize) => {
  let { width: imageWidth, height: imageHeight } = imageSize;
  let { width: outerWidth, height: outerHeight } = outViewSize;
  let res = 1;
  if (outerHeight > imageHeight && outerWidth > imageWidth) {
    return res
  } else {
    let heightRatio = outerHeight / imageHeight;
    let widthRatio = outerWidth / imageWidth;
    return Math.min(heightRatio, widthRatio)
  }
}