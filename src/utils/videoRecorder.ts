/**
 * Canvas Video Recorder using MediaRecorder API.
 * Captures 60fps/30fps animation streams directly from WebGL canvas into downloadable video files.
 */

export interface VideoRecordOptions {
  durationSeconds?: number; // Optional auto-stop timer, or 0 for manual
  fps?: number;             // 30 or 60
  onProgress?: (elapsedSec: number, percent: number) => void;
  onFinish?: (videoBlob: Blob, videoUrl: string) => void;
  onError?: (err: Error) => void;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private timerInterval: number | null = null;
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined';
  }

  public getSupportedMimeType(): string {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return '';
  }

  public startRecording(canvas: HTMLCanvasElement, options: VideoRecordOptions = {}): boolean {
    if (this.isRecording) return false;
    if (!VideoRecorder.isSupported()) {
      options.onError?.(new Error('MediaRecorder is not supported in this browser environment.'));
      return false;
    }

    try {
      const fps = options.fps || 60;
      // Capture stream from WebGL canvas
      this.stream = canvas.captureStream(fps);

      const mimeType = this.getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 12000000, // 12 Mbps high fidelity bitrate
      };

      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      this.recordedChunks = [];
      this.isRecording = true;
      this.startTime = performance.now();

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }

        const blobType = mimeType || 'video/webm';
        const finalBlob = new Blob(this.recordedChunks, { type: blobType });
        const videoUrl = URL.createObjectURL(finalBlob);

        options.onFinish?.(finalBlob, videoUrl);
      };

      this.mediaRecorder.start(200); // 200ms chunk slices

      // Track progress timer
      const duration = options.durationSeconds || 0;
      this.timerInterval = window.setInterval(() => {
        if (!this.isRecording) return;
        const elapsed = (performance.now() - this.startTime) / 1000;
        const percent = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
        options.onProgress?.(elapsed, percent);

        if (duration > 0 && elapsed >= duration) {
          this.stopRecording();
        }
      }, 100);

      return true;
    } catch (err) {
      this.isRecording = false;
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  public stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}
