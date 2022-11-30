/* tilt-to-steer.js */
/* December 2022 */
// Code written by Manheart Earthman=B. A. Bilgekılınç Topraksoy=土本 智一勇夫剛志
/* tilt-to-steer.js is released to the public domain (you can do whatever you want with it) */

/* NOTE: This version does not feature a perfect solution to the gimbal lock problem. */
/* It only gives you numbers that will hopefully be good enough to steer a car in a racing game etc that would run in any screen orientation. */

/* NOTE: This js library has been created during the development of https://speakworldlanguages.app */

// USAGE
/* Call startReadingTilt() and then */
/* Use the smoothSteerDeg variable to rotate or turn things */
/* NOTE: It would be a good idea to implement a max-rotation limit and adjust that to match the design of your app */

// According to MDN web docs "window.orientation" is deprecated, but is expected to work on iOS and WebView
let theDeviceIsRotated;
function screenOrientationHasCertainlyChanged() {
  setTimeout(afterAnUnnoticableDelay,100); // This solves the wrong-firing-order issue on Samsung Browser.
  function afterAnUnnoticableDelay() {
    if (screen.orientation) { // Mainly for Android (as of 2022)
      // screen.orientation.angle returns 0 or 90 or 270 or 180
      if (screen.orientation.angle == 0)   {    theDeviceIsRotated="no";     }
      if (screen.orientation.angle == 90)  {    theDeviceIsRotated="toTheLeft";     }
      if (screen.orientation.angle == 270) {    theDeviceIsRotated="toTheRight";     }
      if (screen.orientation.angle == 180) {    theDeviceIsRotated="upsideDown";     }
    } else { // Mainly for iOS (as of 2022)
      // window.orientation returns 0 or 90 or -90 or 180
      if (window.orientation == 0)   {    theDeviceIsRotated="no";     }
      if (window.orientation == 90)  {    theDeviceIsRotated="toTheLeft";     }
      if (window.orientation == -90) {    theDeviceIsRotated="toTheRight";     }
      if (window.orientation == 180) {    theDeviceIsRotated="upsideDown";     }
    }
  }
}
screenOrientationHasCertainlyChanged(); // Maybe it hasn't changed yet but we just have to do a first run to set the value of theDeviceIsRotated
// CAUTION: RESIZE does not fire when switching from 90 to 270 directly (without triggering a portrait view in between)
// THEREFORE WE CANNOT RELY ON window.addEventListener("resize",screenOrientationHasChanged);
// AND THERE IS THE EXACT SAME PROBLEM WITH
// window.screen.orientation.addEventListener('change',screenOrientationHasChanged); // https://whatwebcando.today/screen-orientation.html
// ALSO WITH
// window.addEventListener("orientationchange",screenOrientationHasChanged); // https://developer.mozilla.org/en-US/docs/Web/API/Window/orientationchange_event

// AS OF 2022 THE ONLY RELIABLE WAY TO DETECT SCREEN ORIENTATION CHANGE is by using setInterval
let lastTimeWeCheckedTheOrientationWas;
function saveLastDetectedScreenOrientation() {
  if (screen.orientation) { // Mainly for Android (as of 2022)
    lastTimeWeCheckedTheOrientationWas = screen.orientation.angle;
  } else { // Mainly for iOS (as of 2022)
    lastTimeWeCheckedTheOrientationWas = window.orientation;
  }
}
saveLastDetectedScreenOrientation();

setInterval(checkIfOrientationHasChanged, 200); // Keep checking
function checkIfOrientationHasChanged() {
  if (screen.orientation) { // Mainly for Android (as of 2022)
    // screen.orientation.angle returns 0 or 90 or 270 or 180
    if (lastTimeWeCheckedTheOrientationWas != screen.orientation.angle) {
      screenOrientationHasCertainlyChanged();
    }
  } else { // Mainly for iOS (as of 2022)
    // window.orientation returns 0 or 90 or -90 or 180
    if (lastTimeWeCheckedTheOrientationWas != window.orientation) {
      screenOrientationHasCertainlyChanged();
    }
  }
  // Update
  saveLastDetectedScreenOrientation();
}

// Use var instead of let for things that could be accessed from elsewhere
var b; // Adjust and use beta for steering when in landscape mode
var g; // Adjust and use gamma for steering when in portrait mode after dealing with the gimbal lock problem using beta
let betaCalculation1, betaCalculation2, betaCalculation3;
let gammaCalculation1, gammaCalculation2, gammaCalculation3;
let suppressionFromBeta=0, suppressionFromGamma=0;
var steerDeg=0, smoothSteerDeg=0;
let steerDegDelayed20ms = 0, steerDegDelayed40ms = 0;

function fixGimbalLock() { // NOTE THAT THIS IS NOT A PERFECT SOLUTION!
  // According to tests, gimbal lock floor is about beta:45 degrees but the ceiling is not always beta:90
  // As gamma approaches 0 deg, beta ceiling approaches 90 deg
  // As gamma approaches plus or minus 90 deg, beta ceiling changes and beta JUMP starts happening. For example it jumps from 85 to 95 or from 80 to 100 etc.
  // Beta-ceiling (where max-gimbal-lock happens) varies between beta:45~135 degrees depending on gamma.
  // The change in beta-ceiling has a weird curve like y=ax^{20}+bx ___ a=0.0000000000000000002 b=0.4
  // In this case we will use a manual approximation to real angles through trial&error
  // If you think can tweak this please fork it and work on it. If you do get better results then send a pull request.
  if (Math.abs(g)>45) {
    gammaCalculation1 = 90-Math.abs(g); // 45 to 0 and to 45 again
    gammaCalculation2 = Math.abs(gammaCalculation1-45)/45; // 0 to 1 and to 0 again
    gammaCalculation3 = Math.pow(gammaCalculation2,1.2); // bend the line and turn it into a curve
    suppressionFromGamma = 1.5*gammaCalculation3; // Use as denominator. In this version the range is from 0 to 1.5
  }

  if (b>45 && b<135 || -135<b && b<-45) {
    betaCalculation1 = Math.abs(90-Math.abs(b)); // 45 to 0 and to 45 again
    betaCalculation2 = Math.abs(betaCalculation1-45)/45; // 0 to 1 and to 0 again
    betaCalculation3 = Math.pow(betaCalculation2,4); // bend the line and turn it into a curve
    suppressionFromBeta = 44*betaCalculation3; // Use as denominator. In this version the range is from 0 to 44
  }

  steerDeg = steerDeg/(1+suppressionFromBeta+suppressionFromGamma);
}

function handleTilt(event) {

  b = event.beta;  // Cannot use raw data from deviceorientation becuse it jumps like +180/-180 at certain points
  g = event.gamma; // Cannot use raw data from deviceorientation becuse it jumps from plus to minus at certain points and also there is the gimbal-lock issue

  /* TURN RAW DATA INTO USEFUL DATA */
  if (theDeviceIsRotated == "no") {
    if (-90<=b && b<=90) { steerDeg = g;      } // Fix plus&minus signs
    else                 { steerDeg = g*(-1); } // Fix plus&minus signs
    // REMEDY FOR GIMBAL-LOCK
    fixGimbalLock();
  } else if (theDeviceIsRotated == "toTheLeft") {
    if (-90<g && g<0 && Math.abs(b)<=90) {
      steerDeg =  b;
    }
    if (0<=g && g<=90 && Math.abs(b)>90){
      if (b<0) {     steerDeg = -180-b;     }
      else     {     steerDeg = 180-b;      }
    }
    if (0<=g && g<=90 && Math.abs(b)<=90) {
      steerDeg =  b;
    }
    if (-90<g && g<0 && Math.abs(b)>90) {
      if (b<0) {     steerDeg = -180-b;     }
      else     {     steerDeg = 180-b;      }
    }
  } else if (theDeviceIsRotated == "toTheRight") {
    if(0<=g && g<=90 && Math.abs(b)<=90) {
      steerDeg = b*(-1);
    }
    if (-90<=g && g<0 && Math.abs(b)<=90) {
      steerDeg = b*(-1);
    }
    if (-90<=g && g<0 && Math.abs(b)>90) {
      if (b>=0) {    steerDeg = -180+b;     }
      else      {    steerDeg = 180+b;      }
    }
    if (0<=g && g<=90 && Math.abs(b)>90) {
      if (b>=0) {    steerDeg = -180+b;     }
      else      {    steerDeg = 180+b;      }
    }
  } else if (theDeviceIsRotated == "upsideDown") {
    if (-90<=b && b<=90) { steerDeg = g*(-1); } // Fix plus&minus signs
    else                 { steerDeg = g;      } // Fix plus&minus signs
    // REMEDY FOR GIMBAL-LOCK
    fixGimbalLock();
  } else {
    // Impossible 5th orientation
  }

  // Can add 60ms, 80ms etc to make it even smoother, but it will introduce more latency as the reaction time will get retarded.
  setTimeout(function() { steerDegDelayed20ms = steerDeg },20);
  setTimeout(function() { steerDegDelayed40ms = steerDeg },40);
  smoothSteerDeg = (steerDeg + steerDegDelayed20ms + steerDegDelayed40ms)/3;

  // USE smoothSteerDeg to do stuff
  // ...
  // ..
  // .
}

// IT COULD BE TOO EARLY IF YOU USE window.addEventListener("load",startReadingTilt,{once:true});
// Make sure you call startReadingTilt() only after script loads
function startReadingTilt() {
  window.addEventListener("deviceorientation",handleTilt);
}
