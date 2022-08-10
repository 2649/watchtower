import detectionObject from "./detectionType";

export default interface imageObject {
  src: string;
  highlight: boolean;
  id: number;
  camera_name: string;
  time: string;
  detections: detectionObject[];
}

export interface mageObjectOptional {
  src?: string;
  highlight?: boolean;
  id?: number;
  camera_name?: string;
  time?: string;
  detections?: detectionObject[];
}
