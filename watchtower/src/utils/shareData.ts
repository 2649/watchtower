interface shareImageInterface {
  file: any;
  title: string;
  text: string;
}

export const shareData = (shareData: shareImageInterface) => {
  console.log("Begin to share data");
  if (navigator.canShare(shareData)) {
    console.log("Data are shareable");
    return navigator.share(shareData);
  } else {
    console.log("Data are not shareable");
    return;
  }
};
