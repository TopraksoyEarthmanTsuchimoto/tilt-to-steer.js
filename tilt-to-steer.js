/* tilt-to-steer.js */
/* v0.1 */
/* Released to the public domain (do whatever you want with it) by Manheart Earthman aka Beykan Alper Topraksoy */
/* NOTE: This library does not feature a perfect solution to the gimbal lock problem. */
/* It only gives you numbers that will hopefully be good enough to steer a car in a racing game etc that would run in any screen orientation. */
/* Find the smoothSteerDeg variable and use it */
/* ___ */
/* A Must-See » https://speakworldlanguages.app */
/* ___ */

let theDeviceIsRotated;
function handlePortraitOrLandscape() {
  setTimeout(afterAnUnnoticableDelay,100); // This solves the wrong-firing-order issue on Samsung Browser.
  function afterAnUnnoticableDelay() {
    if (screen.orientation) { // Mainly for Android (as of 2021)
      // document.getElementById('or7on').innerHTML = "Screen rotation:" + screen.orientation.angle; // Returns 0 or 90 or 270 or 180 // You'll need a div with ID: "or7on" to uncomment and test
      if (screen.orientation.angle == 0)   {    theDeviceIsRotated="no";     }
      if (screen.orientation.angle == 90)  {    theDeviceIsRotated="toTheLeft";     }
      if (screen.orientation.angle == 270) {    theDeviceIsRotated="toTheRight";     }
      if (screen.orientation.angle == 180) {    theDeviceIsRotated="upsideDown";     }
    } else { // Mainly for iOS (as of 2021)
      // document.getElementById('or7on').innerHTML = "Screen rotation:" + window.orientation; // Returns 0 or 90 or -90 or 180 // You'll need a div with ID: "or7on" to uncomment and test
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

function fixGimbalLock() {
  // According to tests gimbal lock floor is about beta:45 degrees but the ceiling is not always beta:90
  // Beta-ceiling (where max-gimbal-lock happens) varies between beta:45~135 degrees depending on gamma.
  // As abs(gamma) approaches 90, beta-ceiling drops from 90 to 45-135 with a weird curve like y=ax^{20}+bx ___ a=0.0000000000000000002 b=0.4
  // In this case we will use a manual approximation to real angles through trial&error
  if (Math.abs(g)>45) {
    gammaCalculation1 = 90-Math.abs(g); // 45 to 0 and to 45 again
    gammaCalculation2 = Math.abs(gammaCalculation1-45)/45; // 0 to 1 and to 0 again
    gammaCalculation3 = Math.pow(gammaCalculation2,1.2); // bend the line and turn it into a curve
    suppressionFromGamma = 1.5*gammaCalculation3; // from 0 to 1.5
  }

  if (b>45 && b<135 || -135<b && b<-45) {
    betaCalculation1 = Math.abs(90-Math.abs(b)); // 45 to 0 and to 45 again
    betaCalculation2 = Math.abs(betaCalculation1-45)/45; // 0 to 1 and to 0 again
    betaCalculation3 = Math.pow(betaCalculation2,4); // bend the line and turn it into a curve
    suppressionFromBeta = 44*betaCalculation3; // from 0 to 44
  }

  // document.getElementById('dev').innerHTML = "g-supressor:" + suppressionFromGamma.toFixed(2) + "<br>b-supressor:" + suppressionFromBeta.toFixed(2); // You'll need a div with ID: "dev" to uncomment and test
  steerDeg = steerDeg/(1+suppressionFromBeta+suppressionFromGamma);
}

function handleTilt(event) {
  //document.getElementById('rawBeta').innerHTML = "raw beta:"+event.beta.toFixed(0); // Uncomment to test // You'll need a div with ID: "rawBeta" to uncomment and test
  //document.getElementById('rawGamma').innerHTML = "raw gamma:"+event.gamma.toFixed(2); // Uncomment to test // You'll need a div with ID: "rawGamma" to uncomment and test

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

  setTimeout(function() { steerDegDelayed20ms = steerDeg },20);
  setTimeout(function() { steerDegDelayed40ms = steerDeg },40);
  smoothSteerDeg = (steerDeg + steerDegDelayed20ms + steerDegDelayed40ms)/3;
  // document.getElementById('steer').innerHTML = "steer: "+steerDeg.toFixed(1); // Uncomment to test // You'll need a div with ID: "steer" to uncomment and test
  // document.getElementById('rotate').style.transform = "rotate("+smoothSteerDeg.toFixed(1)+"deg)"; // Uncomment to test // You'll need a div with ID: "rotate" to uncomment and test

  // USE smoothSteerDeg to do stuff
  // ...
  // ..
  // .
}

window.addEventListener("load",startReadingTilt,{once:true});
function startReadingTilt() {
  window.addEventListener("deviceorientation",handleTilt);
}
