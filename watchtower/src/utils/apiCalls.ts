import axios from "axios";
import imageObject from "../types/imageType";
import { queryOjectOptional } from "../types/queryType";

console.log(`Using this process.env.PUBLIC_URL: ${process.env.PUBLIC_URL}`);

export const getQueryParams = () => {
  return axios.get(`/qparams`);
};

export const getImages = (query: queryOjectOptional) => {
  // Build url
  let parameterString = "?";
  query.cameraNames?.forEach(
    (cam: string) => (parameterString += `camera=${cam}&`)
  );
  query.objects?.forEach(
    (obj: string) => (parameterString += `object=${obj}&`)
  );
  parameterString += `start=${query.start}&`;
  parameterString += `end=${query.end}&`;
  if (query.highlighted) {
    parameterString += "highlighted=true";
  }

  return axios.get(`${process.env.PUBLIC_URL}/images${parameterString}`);
};

export const putHighlight = (image: imageObject) => {
  return axios.put(
    `${process.env.PUBLIC_URL}/highlight/${image.id}?highlight=${
      image.highlight ? "false" : "true"
    }`
  );
};
