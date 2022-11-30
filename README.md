# tilt-to-steer.js
#### Turn your tablet or phone into a steering wheel!
This library converts raw `deviceorientation` data (mobile device tilt in degrees) into usable good numbers.

- NOTE: This library does not feature a *perfect* solution to the gimbal lock problem. But the current version is **almost good enough**, for example, for steering a car in a racing game that would run in any screen orientation (landscape or portrait).

## **Try it live** (you will need an Android tablet or phone)

https://topraksoyearthmantsuchimoto.github.io/tilt-to-steer.js/
  
## Usage
Call `startReadingTilt()` and then use `smoothSteerDeg` variable inside a `requestAnimationFrame()` loop to rotate things, make things turn or go creative with it.  
  
You may want to use a device detector [like this](https://github.com/PoeHaH/devicedetector) or a ua-parser [like this](https://github.com/faisalman/ua-parser-js) to make sure that the user is on a mobile device before running the code.
In addition to linking it like

    <script defer src="tilt-to-steer.js"></script>
    
you can also inject tilt-to-steer.js only when needed in your app like this,

    const url = 'tilt-to-steer.js'; // Or /whateverfoldername/tilt-to-steer.js
    const script = document.createElement('script');
    script.async = true;
    script.onload = () => startTheApp(); // Create your own startTheApp() function or smth like that.
    script.src = url;
    document.body.appendChild(script);
    
As of 2021 **iOS** devices won't let your app access `deviceorientation` by default.
You will have to prompt the user for permission.
See,
https://dev.to/li/how-to-requestpermission-for-devicemotion-and-deviceorientation-events-in-ios-13-46g2
and be careful about `touchstart-not-working`
https://developer.apple.com/forums/thread/128376

## Logic
We just try to divide the `gamma` value by a number to tame its craziness as gimbal lock happens. The denominator is calculated dynamically by watching `beta`.

## How to improve
  - Challenge yourself and see if you can come up with a more precise equation for the __`gamma` suppression denominator__ 
  - See the [beta-jump issue](https://github.com/TopraksoyEarthmanTsuchimoto/tilt-to-steer.js/issues/2)
___
##### This library was created during the development of the [speakworldlanguages app](https://github.com/speakworldlanguages).
##### [See the app](https://speakworldlanguages.app) if you are interested in learning languages or trying voice controlled games.
https://speakworldlanguages.app
