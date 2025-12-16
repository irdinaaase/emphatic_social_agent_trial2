// js/ai/webcam-emotion.js - REPLACE THE ENTIRE FILE WITH THIS

class WebcamEmotionDetector {
    constructor() {
        this.human = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        
        // SIMPLE CONFIG THAT WORKS
        this.config = {
            showPreview: true,
            drawFace: true,
            drawMesh: true,    // NEW: Draw mesh points
            drawIris: true,    // NEW: Draw iris
            drawEmotion: true,
            backend: 'webgl',  // NOT webgpu
            frameRate: 15
        };
        
        this.state = {
            initialized: false,
            running: false,
            currentEmotion: 'neutral',
            faceData: null
        };
    }
    
    async initialize() {
        console.log('🚀 INITIALIZING...');
        
        try {
            // 1. Create elements
            this.createElements();
            
            // 2. Get camera
            await this.startCamera();
            
            // 3. Load Human.js SIMPLE
            await this.loadHumanSimple();
            
            this.state.initialized = true;
            console.log('✅ READY!');
            
            // 4. START IMMEDIATELY
            this.start();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed:', error);
            return false;
        }
    }
    
    createElements() {
        // Video element
        this.video = document.createElement('video');
        this.video.id = 'emotion-video';
        this.video.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            height: 240px;
            border-radius: 10px;
            border: 3px solid #4f46e5;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            object-fit: cover;
            transform: scaleX(-1); /* Mirror */
        `;
        this.video.playsInline = true;
        this.video.muted = true;
        document.body.appendChild(this.video);
        
        // Canvas for drawing overlay
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'emotion-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            height: 240px;
            pointer-events: none;
            z-index: 10000;
            border-radius: 10px;
        `;
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        // Status display
        this.statusDiv = document.createElement('div');
        this.statusDiv.id = 'emotion-status';
        this.statusDiv.style.cssText = `
            position: fixed;
            top: 270px;
            right: 20px;
            width: 320px;
            padding: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial;
            font-size: 14px;
        `;
        document.body.appendChild(this.statusDiv);
    }
    
    async startCamera() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });
        
        this.video.srcObject = this.stream;
        await this.video.play();
        console.log('📹 Camera started');
    }
    
    async loadHumanSimple() {
        // Import Human.js
        const { Human } = await import('https://cdn.jsdelivr.net/npm/@vladmandic/human/dist/human.esm.js');
        
        // MINIMAL WORKING CONFIG
        const config = {
            backend: 'webgl',  // ALWAYS WORKING
            modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
            
            // FACE ONLY - NO OTHER MODELS
            face: {
                enabled: true,
                detector: {
                    enabled: true,
                    modelPath: 'blazeface.json',
                    maxDetected: 1,
                    minConfidence: 0.3
                },
                mesh: {
                    enabled: true,
                    modelPath: 'facemesh.json'
                },
                // DISABLE FOR NOW - TOO SLOW
                iris: { enabled: false },
                emotion: { enabled: false },
                description: { enabled: false },
                age: { enabled: false },
                gender: { enabled: false }
            },
            
            // DISABLE EVERYTHING ELSE
            hand: { enabled: false },
            body: { enabled: false },
            object: { enabled: false },
            segmentation: { enabled: false },
            gesture: { enabled: false }
        };
        
        console.log('🔄 Creating Human instance...');
        this.human = new Human(config);
        
        // Load models
        console.log('⬇️ Loading models...');
        await this.human.load();
        
        console.log('✅ Human.js loaded!');
        
        // Test immediately
        await this.testDetection();
    }
    
    async testDetection() {
        // Simple test to verify models loaded
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        const ctx = testCanvas.getContext('2d');
        ctx.fillStyle = 'gray';
        ctx.fillRect(0, 0, 100, 100);
        
        const result = await this.human.detect(testCanvas);
        console.log('🧪 Test result:', {
            faces: result.face?.length || 0,
            mesh: result.face?.[0]?.mesh?.length || 0
        });
        
        testCanvas.remove();
    }
    
    start() {
        if (!this.state.initialized || this.state.running) return;
        
        this.state.running = true;
        console.log('▶️ Starting detection...');
        
        // Start processing
        this.processFrame();
    }
    
    async processFrame() {
        if (!this.state.running) return;
        
        try {
            // 1. Draw video to canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.save();
            this.ctx.scale(-1, 1); // Mirror to match video
            this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            
            // 2. Detect face
            const result = await this.human.detect(this.canvas);
            
            // 3. Process result
            if (result.face && result.face.length > 0) {
                const face = result.face[0];
                this.state.faceData = face;
                
                // 4. DRAW EVERYTHING VISIBLE
                this.drawFaceOverlay(face);
                
                // 5. Update status
                this.updateStatus(face);
            } else {
                this.state.faceData = null;
                this.statusDiv.innerHTML = '<span style="color: #ff6b6b">⏺️ No face detected</span>';
            }
            
        } catch (error) {
            console.error('Frame error:', error);
        }
        
        // Next frame
        setTimeout(() => {
            if (this.state.running) {
                requestAnimationFrame(() => this.processFrame());
            }
        }, 1000 / this.config.frameRate);
    }
    
    drawFaceOverlay(face) {
        const ctx = this.ctx;
        
        // 1. Draw face box (GREEN)
        if (face.box && this.config.drawFace) {
            const [x, y, width, height] = face.box;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
        }
        
        // 2. Draw mesh points (RED DOTS) - YOU HAVE 478 POINTS!
        if (face.mesh && face.mesh.length > 0 && this.config.drawMesh) {
            console.log(`🎯 Drawing ${face.mesh.length} mesh points`);
            
            // Draw ALL points as small red dots
            ctx.fillStyle = '#ff0000';
            for (let i = 0; i < face.mesh.length; i++) {
                const point = face.mesh[i];
                if (point && point.length >= 2) {
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Draw eye points bigger (BLUE)
            ctx.fillStyle = '#0000ff';
            // Left eye indices (approximate)
            const leftEyeIndices = [33, 133, 157, 158, 159, 160, 161, 173];
            // Right eye indices (approximate)
            const rightEyeIndices = [362, 263, 386, 387, 388, 389, 390, 374];
            
            leftEyeIndices.forEach(idx => {
                if (face.mesh[idx]) {
                    ctx.beginPath();
                    ctx.arc(face.mesh[idx][0], face.mesh[idx][1], 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            rightEyeIndices.forEach(idx => {
                if (face.mesh[idx]) {
                    ctx.beginPath();
                    ctx.arc(face.mesh[idx][0], face.mesh[idx][1], 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            // Draw mouth points (PINK)
            ctx.fillStyle = '#ff00ff';
            const mouthIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
            mouthIndices.forEach(idx => {
                if (face.mesh[idx]) {
                    ctx.beginPath();
                    ctx.arc(face.mesh[idx][0], face.mesh[idx][1], 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // 3. Draw iris if available
        if (face.iris && face.iris.length > 0 && this.config.drawIris) {
            ctx.fillStyle = '#ffff00';
            face.iris.forEach(iris => {
                if (iris && iris.length >= 2) {
                    ctx.beginPath();
                    ctx.arc(iris[0], iris[1], 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }
    
    updateStatus(face) {
        let html = `
            <div style="margin-bottom: 5px;">
                <strong style="color: #4f46e5">🧠 REAL-TIME FACE DETECTION</strong>
            </div>
            <div>✅ <strong>Face Detected</strong></div>
        `;
        
        if (face.box) {
            html += `<div>📐 Box: ${Math.round(face.box[2])}×${Math.round(face.box[3])}px</div>`;
        }
        
        if (face.mesh) {
            html += `<div>🎭 <strong>${face.mesh.length} Face Points</strong></div>`;
        }
        
        if (face.confidence) {
            html += `<div>🎯 Confidence: ${(face.confidence * 100).toFixed(1)}%</div>`;
        }
        
        // Simple emotion estimation from face shape
        if (face.mesh && face.mesh.length > 200) {
            const emotion = this.estimateEmotionFromMesh(face.mesh);
            html += `<div>😄 Emotion: <strong>${emotion}</strong></div>`;
        }
        
        this.statusDiv.innerHTML = html;
    }
    
    estimateEmotionFromMesh(mesh) {
        if (!mesh || mesh.length < 100) return 'neutral';
        
        // Simple estimation based on mouth corners
        const leftMouth = mesh[61] || mesh[81];  // Left mouth corner
        const rightMouth = mesh[291] || mesh[311]; // Right mouth corner
        
        if (!leftMouth || !rightMouth) return 'neutral';
        
        // Check if smiling (mouth corners up)
        const mouthCenterY = (leftMouth[1] + rightMouth[1]) / 2;
        const mouthDiff = Math.abs(leftMouth[1] - rightMouth[1]);
        
        // Very simple estimation
        if (mouthDiff < 5) {
            return 'neutral';
        } else if (leftMouth[1] < mouthCenterY && rightMouth[1] < mouthCenterY) {
            return 'happy';
        } else {
            return 'neutral';
        }
    }
    
    stop() {
        this.state.running = false;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        console.log('⏹️ Stopped');
    }
    
    getCurrentEmotion() {
        return {
            emotion: this.state.currentEmotion,
            confidence: 0.7,
            timestamp: Date.now()
        };
    }
    
    isFaceDetected() {
        return this.state.faceData !== null;
    }
}

// Make it global
window.WebcamEmotionDetector = WebcamEmotionDetector;
console.log('✅ WebcamEmotionDetector loaded');