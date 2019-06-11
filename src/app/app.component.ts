import { Component, OnInit } from '@angular/core';
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import { text } from '@angular/core/src/render3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'objectDetection';
  private video: HTMLVideoElement;


  ngOnInit() {
    this.webcamInit();
    this.MakePredictionWithCocoSSDModel();
  }
  webcamInit() {
    this.video = document.getElementById('vid') as HTMLVideoElement;
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user'
      }
    }).then(stream => {
      this.video.srcObject = stream;
      this.video.onloadedmetadata = () => {
        this.video.play();
      };
    });
  }

  // Finally Make Prediction from input
  public async MakePredictionWithCocoSSDModel() {
    const model = await cocoSSD.load('lite_mobilenet_v2');
    this.detectFrame(this.video, model);
    console.log('Model loaded');
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  }
  renderPredictions = predictions => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Fonts
    const font = '16px sans-serif';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.drawImage(this.video, 0, 0, 500, 500);

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      // Drawing the bounding box
      ctx.strokeStyle = '#FFF000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = '#FFF000';
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
       // Draw the text last to ensure it's on top.
      ctx.fillStyle = '#000000';
      ctx.fillText(prediction.class, x, y);
    });

  }
}
