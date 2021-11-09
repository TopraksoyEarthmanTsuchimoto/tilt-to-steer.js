/* tilt-to-steer.js */
/* v0.1 */
/* Released to the public domain (do whatever you want with it) by Manheart Earthman aka Topraksoy aka 土本 aka الترابي */
/* NOTE: This library does not feature a perfect solution to the gimbal lock problem. */
/* It only gives you numbers that will hopefully be good enough to steer a car in a racing game etc that would run in any screen orientation. */
/* USAGE */
/* Call startReadingTilt() and then */
/* Use the smoothSteerDeg variable to rotate or turn things */
/* NOTE: It would be a good idea to implement a max-rotation limit and adjust that to match the design of your app */
/* iOS: As of 2021 iOS devices won't let your app access deviceorientation by default. You will have to prompt the user for permission. */
/* See the readme on https://github.com/TopraksoyEarthmanTsuchimoto/tilt-to-steer-js to learn more about that */
/* ___ */
/* This js library has been created during the development of » https://speakworldlanguages.app */
/* ___ */

let theDeviceIsRotated;
function handlePortraitOrLandscape() {
  setTimeout(afterAnUnnoticableDelay,100); // This solves the wrong-firing-order issue on Samsung Browser.
  function afterAnUnnoticableDelay() {
    if (screen.orientation) { // Mainly for Android (as of 2021)
      // screen.orientation.angle returns 0 or 90 or 270 or 180
      if (screen.orientation.angle == 0)   {    theDeviceIsRotated="no";     }
      if (screen.orientation.angle == 90)  {    theDeviceIsRotated="toTheLeft";     }
      if (screen.orientation.angle == 270) {    theDeviceIsRotated="toTheRight";     }
      if (screen.orientation.angle == 180) {    theDeviceIsRotated="upsideDown";     }
    } else { // Mainly for iOS (as of 2021)
      // window.orientation returns 0 or 90 or -90 or 180
      if (window.orientation == 0)   {    theDeviceIsRotated="no";     }
      if (window.orientation == 90)  {    theDeviceIsRotated="toTheLeft";     }
      if (window.orientation == -90) {    theDeviceIsRotated="toTheRight";     }
      if (window.orientation == 180) {    theDeviceIsRotated="upsideDown";     }
    }
  }
}
handlePortraitOrLandscape(); // Set for the first time
window.addEventListener("resize",handlePortraitOrLandscape); // Update when change happens

let b; // Adjust and use beta for steering when in landscape mode
let g; // Adjust and use gamma for steering when in portrait mode after dealing with the gimbal lock problem using beta
let betaCalculation1, betaCalculation2, betaCalculation3;
let gammaCalculation1, gammaCalculation2, gammaCalculation3;
let suppressionFromBeta=0, suppressionFromGamma=0;
var steerDeg=0, smoothSteerDeg=0; // var instead of let because in case it needs to be accessed from elsewhere
let steerDegDelayed20ms = 0, steerDegDelayed40ms = 0;

function fixGimbalLock() { // NOTE THAT THIS IS NOT A PERFECT SOLUTION!
  // According to tests gimbal lock floor is about beta:45 degrees but the ceiling is not always beta:90
  // Beta-ceiling (where max-gimbal-lock happens) varies between beta:45~135 degrees depending on gamma.
  // As abs(gamma) approaches 90, beta-ceiling drops from 90 to 45-135 with a weird curve like y=ax^{20}+bx ___ a=0.0000000000000000002 b=0.4
  // In this case we will use a manual approximation to real angles through trial&error
  // If you can tweak this and get better results please fork it and send a pull request
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
  g = event.gamma; // Cannot use raw data from deviceorientation becuse it jumps from plus to minus at certain points and there is the gimbal-lock issue

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

// window.addEventListener("load",startReadingTilt,{once:true}); // Uncomment if you want it to start immediately...
// ...or call startReadingTilt() when necessary
function startReadingTilt() {
  window.addEventListener("deviceorientation",handleTilt);
}
