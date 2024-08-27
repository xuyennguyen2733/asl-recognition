// mediapipe-demo.component.ts
import { Component, OnInit } from '@angular/core';
import {
  GestureRecognizer,
  DrawingUtils,
  GestureRecognizerResult
} from "@mediapipe/tasks-vision";
import { FilesetResolver } from "@mediapipe/tasks-text";

@Component({
  selector: 'app-mediapipe-demo',
  templateUrl: './mediapipe-demo.component.html',
  styleUrls: ['./mediapipe-demo.component.css']
})
export class MediapipeDemoComponent implements OnInit {
  
  ngOnInit(): void {
    const demosSection = document.getElementById("demos");
    let gestureRecognizer: GestureRecognizer;
    let runningMode: "IMAGE" | "VIDEO" = "IMAGE";
    let enableWebcamButton: HTMLButtonElement;
    let webcamRunning: Boolean = false;
    const videoHeight = "360px";
    const videoWidth = "480px";
    
    // Before we can use HandLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    const createGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: runningMode
      });
      demosSection?.classList.remove("invisible");
    };
    createGestureRecognizer();

    
    const video = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
    const canvasCtx = canvasElement?.getContext("2d");
    const gestureOutput = document.getElementById("gesture_output");
    
    // Check if webcam access is supported.
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
    
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
    
    // Enable the live webcam view and start detection.
    function enableCam(event: any) {
      if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
      }
    
      if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
      } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
      }
    
      // getUsermedia parameters.
      const constraints = {
        video: true
      };
    
      if (video) {
        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
          video.srcObject = stream;
          video.addEventListener("loadeddata", predictWebcam);
        });
      }
    }
    
    let lastVideoTime = -1;
    let results: GestureRecognizerResult;
    async function predictWebcam() {
      const webcamElement = document.getElementById("webcam") as HTMLVideoElement;
      // Now let's start detecting the stream.
      if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
      }
      let nowInMs = Date.now();
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
      }
    
      canvasCtx?.save();
      canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
      const drawingUtils = new DrawingUtils(canvasCtx as CanvasRenderingContext2D);
    
      canvasElement.style.height = videoHeight;
      webcamElement.style.height = videoHeight;
      canvasElement.style.width = videoWidth;
      webcamElement.style.width = videoWidth;
    
      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            GestureRecognizer.HAND_CONNECTIONS,
            {
              color: "#00FF00",
              lineWidth: 5
            }
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2
          });
        }
      }
      canvasCtx?.restore();
      if (gestureOutput) {
        if (results.gestures.length > 0 ) {
          gestureOutput.style.display = "block";
          gestureOutput.style.width = videoWidth;
          const categoryName = results.gestures[0][0].categoryName;
          const categoryScore = parseFloat(
            String(results.gestures[0][0].score * 100)
          ).toFixed(2);
          const handedness = results.handedness[0][0].displayName;
          gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
        } else {
          gestureOutput.style.display = "none";
        }
      }
      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    }
    
  }
  
  // gestureRecognizer!: GestureRecognizer;
  // runningMode: "IMAGE" | "VIDEO" = "IMAGE";
  // webcamRunning = false;
  // videoHeight = "360px";
  // videoWidth = "480px";
  // imageSources = [
  //   "https://assets.codepen.io/9177687/idea-gcbe74dc69_1920.jpg",
  //   "https://assets.codepen.io/9177687/thumbs-up-ga409ddbd6_1.png"
  // ];
  // lastVideoTime = -1;
  // results!: GestureRecognizerResult;
  // video!: HTMLVideoElement;
  // canvasElement!: HTMLCanvasElement;
  // webcamElement!: HTMLVideoElement;
  // canvasCtx!: CanvasRenderingContext2D;
  // gestureOutput!: HTMLParagraphElement;
  // enableWebcamButton!: HTMLButtonElement;
  
  // ngOnInit(): void{
  //   this.canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
  //   this.video = document.getElementById("webcam") as HTMLVideoElement;
  //   this.webcamElement = document.getElementById("webcam") as HTMLVideoElement;
  //   this.canvasCtx = this.canvasElement?.getContext("2d") as CanvasRenderingContext2D;
  //   this.gestureOutput = document.getElementById("gesture_output") as HTMLParagraphElement;
  //   this.enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
  //   this.createGestureRecognizer().then(
  //     () => {
  //       console.log("in init", this.gestureRecognizer);
        
  //       const handleClick = async (event: any) => {
  //         console.log("gesture recognizer", this.gestureRecognizer);
  //         if (!this.gestureRecognizer) {
  //           alert("Please wait for gestureRecognizer to load");
  //           return;
  //         }
        
  //         if (this.runningMode === "VIDEO") {
  //           this.runningMode = "IMAGE";
  //           await this.gestureRecognizer.setOptions({ runningMode: "IMAGE" });
  //         }
  //         // Remove all previous landmarks
  //         const allCanvas
  //         = event.target.parentNode.getElementsByClassName("canvas");
  //         for (var i = allCanvas.length - 1; i >= 0; i--) {
  //           const n = allCanvas[i];
  //           n.parentNode.removeChild(n);
  //         }
        
  //         const results = this.gestureRecognizer.recognize(event.target);
        
  //         // View results in the console to see their format
  //         console.log(results);
  //         if (results.gestures.length > 0) {
  //           const p = event.target.parentNode.childNodes[1];
  //           p.setAttribute("class", "info");
        
  //           const categoryName = results.gestures[0][0].categoryName;
  //           const categoryScore = parseFloat(
  //             String(results.gestures[0][0].score * 100)
  //           ).toFixed(2);
  //           const handedness = results.handedness[0][0].displayName;
        
  //           p.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore}%\n Handedness: ${handedness}`;
  //           p.style =
  //             "left: 0px;" +
  //             "top: " +
  //             event.target.height +
  //             "px; " +
  //             "width: " +
  //             (event.target.width - 10) +
  //             "px;";
        
  //           const canvas = document.createElement("canvas");
  //           canvas.setAttribute("class", "canvas");
  //           canvas.setAttribute("width", event.target.naturalWidth + "px");
  //           canvas.setAttribute("height", event.target.naturalHeight + "px");
  //           canvas.style.setProperty('left', '0px');
  //           canvas.style.setProperty('top', '0px');
  //           canvas.style.setProperty('width', `${event.target.width}px`);
  //           canvas.style.setProperty('height', `${event.target.height}px`);
        
  //           event.target.parentNode.appendChild(canvas);
  //           const canvasCtx = canvas.getContext("2d");
  //           if (canvasCtx) {
  //             const drawingUtils = new DrawingUtils(canvasCtx);
  //             for (const landmarks of results.landmarks) {
  //               drawingUtils.drawConnectors(
  //                 landmarks,
  //                 GestureRecognizer.HAND_CONNECTIONS,
  //                 {
  //                   color: "#00FF00",
  //                   lineWidth: 5
  //                 }
  //               );
  //               drawingUtils.drawLandmarks(landmarks, {
  //                 color: "#FF0000",
  //                 lineWidth: 1
  //               });
  //             }
  //           }
  //         }
  //       }
        
  //       const enableCam = (event: any) => {
  //         if (!this.gestureRecognizer) {
  //           alert("Please wait for gestureRecognizer to load");
  //           return;
  //         }
  //         if (this.enableWebcamButton) {
  //           if (this.webcamRunning === true) {
  //             this.webcamRunning = false;
  //             this.enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  //           } else {
  //             this.webcamRunning = true;
  //             this.enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  //           }
  //         }
        
  //         // getUsermedia parameters.
  //         const constraints = {
  //           video: true
  //         };
          
  //         const video = this.video;
  //         const predictWebcam = this.predictWebcam;
        
  //         // Activate the webcam stream.
  //         navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
  //           video.srcObject = stream;
  //           video.addEventListener("loadeddata", predictWebcam);
  //         });
        
  //       }
        
  //       const imageContainers = document.getElementsByClassName("detectOnClick");

  //       for (let i = 0; i < imageContainers.length; i++) {
  //         imageContainers[i].children[0].addEventListener("click", handleClick);
  //         console.log("image container",imageContainers[i].children[0])
  //       }
        
  //       if (this.hasGetUserMedia()) {
  //         const enableWebcamButton = document.getElementById("webcamButton");
  //         enableWebcamButton?.addEventListener("click", enableCam);
  //       } else {
  //         console.warn("getUserMedia() is not supported by your browser");
  //       }
  //     }
  //   );
    
  // }

  // async createGestureRecognizer() {
  //   const demosSection = document.getElementById("demos");
  //   const vision = await FilesetResolver.forVisionTasks(
  //     "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  //   );
  //   this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
  //     baseOptions: {
  //       modelAssetPath:
  //         "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
  //       delegate: "GPU"
  //     },
  //     runningMode: this.runningMode
  //   });
  //   console.log("in create", this.gestureRecognizer);
  //   demosSection?.classList.remove("invisible");
  // };

  // hasGetUserMedia() {
  //   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  // }
  
  // async predictWebcam() {
  //   // Now let's start detecting the stream.
  //   if (this.runningMode === "IMAGE") {
  //     this.runningMode = "VIDEO";
  //     await this.gestureRecognizer.setOptions({ runningMode: "VIDEO" }).then(() => {this.predictWebcam()});
  //     return;
  //   }
    
  //   if (!this.canvasCtx || this.webcamElement || this.canvasElement) return;
    
  //   let nowInMs = Date.now();
  //   if (this.video.currentTime !== this.lastVideoTime) {
  //     this.lastVideoTime = this.video.currentTime;
  //     this.results = this.gestureRecognizer.recognizeForVideo(this.video, nowInMs);
  //   }
  
  //   this.canvasCtx.save();
  //   this.canvasCtx.clearRect(0, 0, (this.canvasElement as HTMLCanvasElement).width, (this.canvasElement as HTMLCanvasElement).height);
  //   const drawingUtils = new DrawingUtils(this.canvasCtx);
  
  //   (this.canvasElement as HTMLCanvasElement).style.height = this.videoHeight;
  //   (this.webcamElement as HTMLVideoElement).style.height = this.videoHeight;
  //   (this.canvasElement as HTMLCanvasElement).style.width = this.videoWidth;
  //   (this.webcamElement as HTMLVideoElement).style.width = this.videoWidth;
  
  //   if (this.results.landmarks) {
  //     for (const landmarks of this.results.landmarks) {
  //       drawingUtils.drawConnectors(
  //         landmarks,
  //         GestureRecognizer.HAND_CONNECTIONS,
  //         {
  //           color: "#00FF00",
  //           lineWidth: 5
  //         }
  //       );
  //       drawingUtils.drawLandmarks(landmarks, {
  //         color: "#FF0000",
  //         lineWidth: 2
  //       });
  //     }
  //   }
  //   this.canvasCtx.restore();
  //   if (this.results.gestures.length > 0) {
  //     this.gestureOutput!.style.display = "block";
  //     this.gestureOutput!.style.width = this.videoWidth;
  //     const categoryName = this.results.gestures[0][0].categoryName;
  //     const categoryScore = parseFloat(
  //       String(this.results.gestures[0][0].score * 100)
  //     ).toFixed(2);
  //     const handedness = this.results.handedness[0][0].displayName;
  //     this.gestureOutput!.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
  //   } else {
  //     this.gestureOutput!.style.display = "none";
  //   }
  //   // Call this function again to keep predicting when the browser is ready.
  //   if (this.webcamRunning === true) {
  //     window.requestAnimationFrame(this.predictWebcam);
  //   }
  // }
  
}
