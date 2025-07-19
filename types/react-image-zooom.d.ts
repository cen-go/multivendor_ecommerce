declare module "react-image-zooom" {
  import { FC } from "react";

  interface ImageZoomProps {
    className?: string; // className for styling
    id?: string; // optional id for image element
    src: string; // image URL required
    zoom?: number; // optional zoom factor. Default is 200
    alt?: string; // optional alt text. Default is "This is an imageZoom image"
    width?: string | number; // default "100%"
    height?: string | number; //default "auto"
  }

  // Component declaration
  const ImageZoom: FC<ImageZoomProps>;

  export default ImageZoom;
}
