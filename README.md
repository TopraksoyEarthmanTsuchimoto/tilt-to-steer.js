# tilt-to-steer-js
### Turn your tablet or phone into a steering wheel!
This library converts raw `deviceorientation` data (mobile device tilt in degrees) into usable good numbers.

- NOTE: This library does not feature a *perfect* solution to the gimbal lock problem. It only gives you numbers that will hopefully be **good enough**  to steer a car in a racing game that would run in any screen orientation.

Try it live,
https://topraksoyearthmantsuchimoto.github.io/tilt-to-steer-js/
  
## Usage
Call `startReadingTilt()` and then use `smoothSteerDeg` variable to rotate things, make things turn or go creative with it.  
  
You may want to use a device detector [like this](https://github.com/PoeHaH/devicedetector) or a ua-parser [like this](https://github.com/faisalman/ua-parser-js) to make sure that the user is on a mobile device before running the code.
And then inject tilt-to-steer.js like this,

    const url = 'foldername/tilt-to-steer.js';
    const script = document.createElement('script');
    script.async = true;
    script.onload = () => startTheApp(); // Create your own startTheApp() function or smth like that.
    script.src = url;
    document.head.appendChild(script);
    
___
##### This library was created during the development of the [speakworldlanguages app](https://github.com/speakworldlanguages).
##### [See the app](https://speakworldlanguages.app) if you are interested in learning languages or trying voice controlled games.
https://speakworldlanguages.app
