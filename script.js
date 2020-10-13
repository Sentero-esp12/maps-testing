var takeMouseSpeedIntoAccount = false; /* Not fully implemented yet. If set to true, slower mouse speed would mean
 higher accuracy in determining the dimensions of the popup window */
let height = 500;
let width = 356;
var detectedWindowConfidence = 0;

//GBChess window dimensions

/* 
 1. If the mousemove event moves with a certain speed and then stops aprubtly at 500,
 it means that the popup's height is 500 and is possibly GBChess's. Then it's possible 
 to check for the width by creating a mousemove map of the gap between the left and the 
 right sides.

 2. Another (probably unreliable) step is to check how long a certain loop takes to execute. Since 
 GBChess will use CPU intencely, the loop should take longer to execute (but
 that could also mean other CPU intencive tasks). I've tested this and found yet no 
 reliable/consistent way to do this. 
*/

let topBarHeight = window.outerHeight - window.innerHeight * window.devicePixelRatio;
//Top bar (address/tab bars) height


//is the window focused? 'blur' also fires when an extension's icon is clicked 
var focused = true;
window.onfocus = function () {
   console.log('focused')
   focused = true;
};
window.onblur = function () {
   console.log('unfocused')
   focused = false;
};

//is the tab visible? or minimized/switched to another tab
var visible = true;
const visibilitychange = () => {
   if (document.visibilityState === 'visible') {
      visible = true;
   } else {
      visible = false;
   }
}
document.addEventListener("visibilitychange", visibilitychange);


//Measuring mouse speed (optional). The slower it is before the mouseover/out, the more accurate the result of the mouseout/over will be, which increases the confidence level.
let speed = 1.3 //default average speed
let pointsArray = []
document.addEventListener('mousemove', function (e) {
   if (focused === false && visible === true) {
      if (pointsArray.length >= 3) {
         pointsArray = pointsArray.slice(pointsArray.length - 2)
      }
      pointsArray.push({ point: [e.clientX * window.devicePixelRatio, e.clientY * window.devicePixelRatio], now: performance.now() })
      if (pointsArray.length <= 1) return;
      let arrayOfSpeedMeasurements = [];
      for (let i = 0; i < pointsArray.length - 1; i++) {
         const point1 = pointsArray[i];
         const point2 = pointsArray[i + 1];
         const timeDifference = point2.now - point1.now
         const distance = findDistance(point1.point, point2.point)
         const pointsSpeed = distance / timeDifference
         arrayOfSpeedMeasurements.push(pointsSpeed)
      }
      if (arrayOfSpeedMeasurements.length > 1) {
         speed = (arrayOfSpeedMeasurements[0] + arrayOfSpeedMeasurements[1]) / 2
      } else {
         speed = arrayOfSpeedMeasurements[0]
      }
      // console.log(speed)
   }
});

const findDistance = (a, b) => {
   var A = a[0] - b[0];
   var B = a[1] - b[1];
   return Math.sqrt(A * A + B * B);
}


let sides = [];
const calculateApproximateSidesFromTopMeasurements = () => {
   arrayOfXWhenTopIsMeasured.sort(function (a, b) {
      return a - b;
   });
   let average = (arrayOfXWhenTopIsMeasured.reduce((a, b) => a + b, 0)) / arrayOfXWhenTopIsMeasured.length;
   let difference = arrayOfXWhenTopIsMeasured[arrayOfXWhenTopIsMeasured.length - 1] - arrayOfXWhenTopIsMeasured[0]
   let variance = width - difference
   sides.length = 0;
   sides.push(arrayOfXWhenTopIsMeasured[arrayOfXWhenTopIsMeasured.length - 1] - variance, arrayOfXWhenTopIsMeasured[0] + variance);
   console.log(sides)
}

const detectGBChessUse = (axis, YMeasurementPresision = undefined) => {
   if (axis === 'y') {
      if (arrayOfPossibleWidthDetections.length < 1) return;
      console.log('detected')
   } else {
      if (YMeasurementPresision === undefined) return;
      // console.log('detected')
   }
}
let YMeasurementPresision = undefined;
let arrayOfPossibleWidthDetections = [];
const runComparisonAndChecks = (axis) => {
   if (axis === 'y') {
      let sum = arrayOfYValues.reduce((a, b) => a + b, 0)
      YMeasurementPresision = Math.abs(sum / arrayOfYValues.length - 500);
      console.log(YMeasurementPresision)
      detectGBChessUse(axis, YMeasurementPresision)
   } else {
      let lastXMeasurement = arrayOfXMeasurements[arrayOfXMeasurements.length - 1];
      let arrayOfTemporaryMeasurements = []
      for (let i = 0; i < arrayOfXMeasurements.length; i++) {
         const m = arrayOfXMeasurements[i];
         let difference = Math.abs(m - lastXMeasurement)
         if (difference > 348 && difference < 362) {
            arrayOfTemporaryMeasurements.push(difference)
         }
      }
      if (arrayOfTemporaryMeasurements.length === 0) return;
      let sum = undefined;
      for (let i = 0; i < arrayOfTemporaryMeasurements.length; i++) {
         const item = arrayOfTemporaryMeasurements[i];
         if (sum === undefined) { sum = 0 + item } else {
            sum = sum + item;
         }
      }
      if (sum === undefined) return;
      let XMeasurementPresision = sum / arrayOfTemporaryMeasurements.length
      arrayOfPossibleWidthDetections.push(XMeasurementPresision)
      console.log(XMeasurementPresision)
      detectGBChessUse(axis, XMeasurementPresision)
   }
}


//determining when the pointer leaves the page and where
let overHTML = true;
let arrayOfYValues = [];
let arrayOfXWhenTopIsMeasured = [];
let arrayOfXMeasurements = [];
const checkMouseOutOver = (e, overHTML) => {
   if (!(focused === false && visible === true)) { return; }
   let yValue = e.clientY * window.devicePixelRatio + 3.3;
   let xValue = e.clientX * window.devicePixelRatio;
   //console.log(yValue, xValue, overHTML ? 'over' : 'out')
   //the lowest point of the extension popup is it's height - 3.4px, because it's top is 3.4px higher than the bottom of the top bar.
   //its width can be 6px higher than its reported innerWidth, probably due to the UI border, also some extensions have an additional width of the scrollbar, but the GBChess extension doesn't have a scrollbar.
   if (yValue > 496 && yValue < 504 && (sides.length === 0 || (xValue < sides[1] - 10 && xValue > sides[0] + 10))) {
      arrayOfYValues.push(yValue);
      arrayOfXWhenTopIsMeasured.push(xValue);
      if (arrayOfXWhenTopIsMeasured.length >= 2) { calculateApproximateSidesFromTopMeasurements() }
      runComparisonAndChecks('y');
   } else if (yValue < 496 && yValue > 15 && (sides.length === 0 || (xValue <= sides[1] && xValue >= sides[0]))) {
      arrayOfXMeasurements.push(xValue)
      if (arrayOfXMeasurements.length >= 2) runComparisonAndChecks('x')
   }
}

document.addEventListener('mouseover', (e) => {
   if (overHTML === false) {
      overHTML = true;
      checkMouseOutOver(e, overHTML)
   }
})
document.addEventListener('mouseout', (e) => {
   if (overHTML === true && e.toElement === null && e.relatedTarget === null) {
      overHTML = false;
      checkMouseOutOver(e, overHTML)
   }
})

