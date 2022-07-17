import detectionObject from "./detectionType";

export default interface ImageObject {
  src: string;
  highlight: boolean;
  id: number;
  cameraName: string;
  time: string;
  detections: detectionObject[];
}

export interface ImageObjectOptional {
  src?: string;
  highlight?: boolean;
  id?: number;
  cameraName?: string;
  time?: string;
  detections?: detectionObject[];
}
