/**
 * GOAL:
 * Fill in the function below in a way that completely satisfies the requirements.
 * 
 * Inputs:
 * - canvasWidth, canvasHeight: width and height of canvas (area to be covered)
 *    in pixels
 *  - imageAspect: aspect ratio of image (width / height)
 *
 * Output:
 *  - Array containing the following:
 *    - xpos, ypos: calculated image position offset relative to canvas in pixels
 *    - sizex, sizey: calculated image size in pixels
 *
 * Coordinate system: 0,0 is upper left
 *
 * REQUIREMENTS:
 * 1. Size the image to cover the canvas area completely.
 * 2. Covering should be minimal - image should be no larger than necessary to 
 *    cover the canvas area.
 * 3. Must maintain original aspect ratio of the image.
 * 4. Center the image on the canvas
 *
 * The function should only return the values specified under Output above.
 */

function sizeImage(canvasWidth, canvasHeight, imageAspect) {
  // TODO: fill in here

  /** jsfidd at https://jsfiddle.net/c63fxp71/4/ **/

  let xpos = 0;
  let ypos = 0;
  let sizex = imageAspect;
  let sizey = 1;
  
  let canvasAspect = canvasWidth / canvasHeight;
  
  if(canvasAspect < imageAspect) {
  	let multiplier = canvasWidth / sizex;
    sizex *= multiplier;
    sizey *= multiplier;
    ypos = (canvasHeight - sizey) / 2;
  } else {
    let multiplier = canvasHeight / sizey;
    sizex *= multiplier;
    sizey *= multiplier;
    xpos = (canvasWidth - sizex) / 2;
  }

  // final image position and size
  return [xpos, ypos, sizex, sizey];
}
