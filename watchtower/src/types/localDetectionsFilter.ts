export interface cameraFilterObject {
  name: string;
  show: boolean;
}

export interface localDetectionsFilterObject {
  cameras: cameraFilterObject[];
}
