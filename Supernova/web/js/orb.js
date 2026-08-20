// ═══════════════════════════════════════════════════════════════
//  SUPERNOVA // JARVIS — Ultimate Stark Mark-LXXXV Holographic Core
//  Features:
//  • 3D Interactive Touch / Mouse Orbit Drag & Momentum Parallax
//  • Dynamic Shockwave Blast Pulses on Voice / Command Triggers
//  • 3D Floating Holographic Telemetry Rings & Orbiting Badges
//  • Multi-Harmonic Audio Frequency Waveform Deformation
//  • Concentric CAD Calibration Dials & Degree Hash Reticles
//  • Segmented Counter-Rotating Arc Fins & Orbit Chevron Trackers
//  • Quantum Multi-Axis Gyroscopic Inner Consciousness Cage
//  • Vertical Holographic Conical Laser Scanner Sweep
//  • Arc-Reactor White-Hot Core with 8-Point Diffraction Star Flare
// ═══════════════════════════════════════════════════════════════

class SupernovaOrb {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Orb container not found: ' + containerId);
            return;
        }

        // State configurations
        this.stateConfig = {
            IDLE: {
                color: new THREE.Color(0xffcc00),
                flareColor: new THREE.Color(0xfff077),
                speed: 1.0,
                intensity: 1.0,
                coreRotSpeed: 0.7,
                waveAmp: 0.35,
                flareScale: 1.0,
                pulseRate: 1.8,
                scanSpeed: 1.0
            },
            LISTENING: {
                color: new THREE.Color(0xffd233),
                flareColor: new THREE.Color(0xffffff),
                speed: 1.5,
                intensity: 1.45,
                coreRotSpeed: 1.25,
                waveAmp: 0.85,
                flareScale: 1.4,
                pulseRate: 3.2,
                scanSpeed: 1.8
            },
            THINKING: {
                color: new THREE.Color(0xff9900),
                flareColor: new THREE.Color(0xffe066),
                speed: 2.8,
                intensity: 1.8,
                coreRotSpeed: 3.0,
                waveAmp: 0.6,
                flareScale: 1.65,
                pulseRate: 5.0,
                scanSpeed: 3.2
            },
            SPEAKING: {
                color: new THREE.Color(0xffbb00),
                flareColor: new THREE.Color(0xffffff),
                speed: 1.65,
                intensity: 1.95,
                coreRotSpeed: 1.45,
                waveAmp: 1.2,
                flareScale: 1.75,
                pulseRate: 3.6,
                scanSpeed: 2.4
            },
            EXECUTING: {
                color: new THREE.Color(0x00ff88),
                flareColor: new THREE.Color(0xaaffcc),
                speed: 2.2,
                intensity: 1.65,
                coreRotSpeed: 2.2,
                waveAmp: 0.8,
                flareScale: 1.5,
                pulseRate: 4.2,
                scanSpeed: 2.6
            },
            ALERT: {
                color: new THREE.Color(0xff2222),
                flareColor: new THREE.Color(0xff8888),
                speed: 3.0,
                intensity: 2.0,
                coreRotSpeed: 3.5,
                waveAmp: 1.0,
                flareScale: 1.8,
                pulseRate: 6.0,
                scanSpeed: 4.0
            }
        };

        this.currentState = 'IDLE';
        this.currentColor = this.stateConfig.IDLE.color.clone();
        this.targetColor  = this.stateConfig.IDLE.color.clone();

        this.audioLevel   = 0;
        this.targetAudio  = 0;
        this.time         = 0;
        this.clock        = new THREE.Clock();

        // 3D Parallax & Interactive Drag Rotation
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.drag = { isDown: false, startX: 0, startY: 0, rotX: 0, rotY: 0, targetRotX: 0, targetRotY: 0 };

        // Shockwave pulse system
        this.shockwaves = [];

        this._init();
        this._bindEvents();
        this._animate();
    }

    _init() {
        const W = this.container.clientWidth  || 600;
        const H = this.container.clientHeight || 600;

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000);
        this.camera.position.set(0, 0, 16.5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(W, H);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Main Parallax & Rotation Container
        this.parallaxGroup = new THREE.Group();
        this.scene.add(this.parallaxGroup);

        this.orbGroup = new THREE.Group();
        this.parallaxGroup.add(this.orbGroup);

        // Holographic visual components
        this._buildOuterBoundaryRings();
        this._buildCalibrationTickDials();
        this._buildSegmentedReticles();
        this._buildOrbitChevronNodes();
        this._buildOuterSphericalGrid();
        this._buildEquatorialWaveMatrix();
        this._buildVerticalBeamBundle();
        this._buildHolographicLaserScanner();
        this._buildInnerRotatingCore();
        this._buildCentralAnamorphicFlare();
        this._buildShockwaveSystem();
        this._buildFloatingHoloBadges();
    }

    _bindEvents() {
        window.addEventListener('resize', () => this._onResize());

        // Mouse Move Parallax
        window.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            this.mouse.targetX = (e.clientX - cx) / cx;
            this.mouse.targetY = (e.clientY - cy) / cy;

            if (this.drag.isDown) {
                const deltaX = e.clientX - this.drag.startX;
                const deltaY = e.clientY - this.drag.startY;
                this.drag.targetRotY += deltaX * 0.006;
                this.drag.targetRotX += deltaY * 0.006;
                this.drag.startX = e.clientX;
                this.drag.startY = e.clientY;
            }
        });

        // Click & Drag to Rotate Hologram in 3D Space
        this.container.addEventListener('mousedown', (e) => {
            this.drag.isDown = true;
            this.drag.startX = e.clientX;
            this.drag.startY = e.clientY;
            if (window.jarvisSFX) window.jarvisSFX.playHover();
        });

        window.addEventListener('mouseup', () => {
            this.drag.isDown = false;
        });

        // Touch support for tablets/touchscreens
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.drag.isDown = true;
                this.drag.startX = e.touches[0].clientX;
                this.drag.startY = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.drag.isDown && e.touches.length === 1) {
                const deltaX = e.touches[0].clientX - this.drag.startX;
                const deltaY = e.touches[0].clientY - this.drag.startY;
                this.drag.targetRotY += deltaX * 0.008;
                this.drag.targetRotX += deltaY * 0.008;
                this.drag.startX = e.touches[0].clientX;
                this.drag.startY = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchend', () => {
            this.drag.isDown = false;
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. OUTER HOLOGRAPHIC RIM & BOUNDARY RINGS
    // ─────────────────────────────────────────────────────────────
    _buildOuterBoundaryRings() {
        this.outerRings = [];
        const R = 4.8;

        // Main radiant outer boundary ring
        const mainGeo = new THREE.TorusGeometry(R, 0.048, 16, 240);
        const mainMat = new THREE.MeshBasicMaterial({
            color: 0xffcc11,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        const mainRing = new THREE.Mesh(mainGeo, mainMat);
        this.orbGroup.add(mainRing);
        this.outerRings.push({ mesh: mainRing, baseOpacity: 0.95, speed: 0.05 });

        // Outer secondary soft glow halo ring
        const haloGeo = new THREE.TorusGeometry(R, 0.15, 16, 240);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0xff9900,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });
        const haloRing = new THREE.Mesh(haloGeo, haloMat);
        this.orbGroup.add(haloRing);
        this.outerRings.push({ mesh: haloRing, baseOpacity: 0.45, speed: 0.05 });

        // Precision concentric boundary rings
        const radii = [R * 0.982, R * 1.018];
        radii.forEach(r => {
            const calGeo = new THREE.TorusGeometry(r, 0.009, 8, 180);
            const calMat = new THREE.MeshBasicMaterial({
                color: 0xffbb22,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending
            });
            const calRing = new THREE.Mesh(calGeo, calMat);
            this.orbGroup.add(calRing);
            this.outerRings.push({ mesh: calRing, baseOpacity: 0.45, speed: -0.04 });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. RADIAL PRECISION DEGREE TICKS (Stark CAD Interface)
    // ─────────────────────────────────────────────────────────────
    _buildCalibrationTickDials() {
        this.tickGroup = new THREE.Group();
        this.orbGroup.add(this.tickGroup);

        const R = 4.8;
        const tickCount = 72; // Every 5 degrees
        const pts = [];

        for (let i = 0; i < tickCount; i++) {
            const angle = (i / tickCount) * Math.PI * 2;
            const isMajor = i % 6 === 0;
            const isCardinal = i % 18 === 0;

            const len = isCardinal ? 0.24 : (isMajor ? 0.15 : 0.08);
            const rInner = R + 0.06;
            const rOuter = rInner + len;

            const x1 = Math.cos(angle) * rInner;
            const y1 = Math.sin(angle) * rInner;
            const x2 = Math.cos(angle) * rOuter;
            const y2 = Math.sin(angle) * rOuter;

            pts.push(new THREE.Vector3(x1, y1, 0));
            pts.push(new THREE.Vector3(x2, y2, 0));
        }

        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        this.tickMat = new THREE.LineBasicMaterial({
            color: 0xffe066,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const ticks = new THREE.LineSegments(geo, this.tickMat);
        this.tickGroup.add(ticks);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. SEGMENTED COUNTER-ROTATING ARC RETICLES
    // ─────────────────────────────────────────────────────────────
    _buildSegmentedReticles() {
        this.reticleGroup = new THREE.Group();
        this.orbGroup.add(this.reticleGroup);

        const R = 5.25;
        const arcCount = 4;
        const arcLength = (Math.PI * 2 / arcCount) * 0.55;

        for (let i = 0; i < arcCount; i++) {
            const startAngle = (i / arcCount) * Math.PI * 2;
            const curve = new THREE.EllipseCurve(0, 0, R, R, startAngle, startAngle + arcLength, false, 0);
            const pts = curve.getPoints(30);
            const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
            const mat = new THREE.LineBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending
            });
            const arc = new THREE.Line(geo, mat);
            this.reticleGroup.add(arc);
        }

        // Inner counter-rotating thin dashed ring
        const innerR = 4.45;
        const innerArcCount = 6;
        const innerArcLength = (Math.PI * 2 / innerArcCount) * 0.4;
        this.innerReticleGroup = new THREE.Group();
        this.orbGroup.add(this.innerReticleGroup);

        for (let i = 0; i < innerArcCount; i++) {
            const startAngle = (i / innerArcCount) * Math.PI * 2;
            const curve = new THREE.EllipseCurve(0, 0, innerR, innerR, startAngle, startAngle + innerArcLength, false, 0);
            const pts = curve.getPoints(20);
            const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
            const mat = new THREE.LineBasicMaterial({
                color: 0xffd233,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const arc = new THREE.Line(geo, mat);
            this.innerReticleGroup.add(arc);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. ORBITING CHEVRON TRACKER NODES
    // ─────────────────────────────────────────────────────────────
    _buildOrbitChevronNodes() {
        this.chevronGroup = new THREE.Group();
        this.orbGroup.add(this.chevronGroup);

        this.chevrons = [];
        const R = 4.8;
        const count = 3;

        for (let i = 0; i < count; i++) {
            const chevGeo = new THREE.BufferGeometry();
            const d = 0.14;
            const verts = new Float32Array([
                -d,  d, 0,
                 0,  0, 0,
                 0,  0, 0,
                -d, -d, 0
            ]);
            chevGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
            const chevMat = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending
            });
            const chev = new THREE.LineSegments(chevGeo, chevMat);
            chev.userData = { angle: (i / count) * Math.PI * 2, radius: R, speed: 0.45 };
            this.chevrons.push(chev);
            this.chevronGroup.add(chev);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. OUTER SPHERICAL WIREFRAME GRID (Latitude & Longitude)
    // ─────────────────────────────────────────────────────────────
    _buildOuterSphericalGrid() {
        const R = 4.75;
        this.gridGroup = new THREE.Group();
        this.orbGroup.add(this.gridGroup);

        this.latLines = [];
        this.longLines = [];

        // Latitudes (Horizontal rings along Y-axis)
        const latCount = 14;
        for (let i = 1; i < latCount; i++) {
            const t = (i / latCount) * 2.0 - 1.0;
            const y = t * R * 0.96;
            const ringR = Math.sqrt(Math.max(0, R * R - y * y));

            const pts = [];
            const segs = 100;
            for (let j = 0; j <= segs; j++) {
                const angle = (j / segs) * Math.PI * 2;
                pts.push(new THREE.Vector3(Math.cos(angle) * ringR, y, Math.sin(angle) * ringR));
            }

            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.28,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(geo, mat);
            line.userData = { baseY: y, baseR: ringR, index: i };
            this.latLines.push(line);
            this.gridGroup.add(line);
        }

        // Longitudes (Meridians rotating around Y-axis)
        const longCount = 8;
        for (let i = 0; i < longCount; i++) {
            const pts = [];
            const segs = 100;
            const rotY = (i / longCount) * Math.PI;

            for (let j = 0; j <= segs; j++) {
                const phi = (j / segs) * Math.PI * 2;
                const x = Math.sin(phi) * R;
                const y = Math.cos(phi) * R;
                pts.push(new THREE.Vector3(x, y, 0));
            }

            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: 0xff9900,
                transparent: true,
                opacity: 0.24,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(geo, mat);
            line.rotation.y = rotY;
            this.longLines.push(line);
            this.gridGroup.add(line);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. EQUATORIAL SOUNDWAVE / VOICE LATTICE (Dense Horizon Slices)
    // ─────────────────────────────────────────────────────────────
    _buildEquatorialWaveMatrix() {
        this.waveGroup = new THREE.Group();
        this.orbGroup.add(this.waveGroup);

        this.waveSlices = [];
        const R = 4.75;
        const sliceCount = 44;
        const heightSpread = 1.75;

        for (let i = 0; i < sliceCount; i++) {
            const norm = (i / (sliceCount - 1)) * 2.0 - 1.0;
            const y = norm * (heightSpread / 2);
            const ringR = Math.sqrt(Math.max(0.5, R * R - y * y));

            const segs = 120;
            const pts = [];
            for (let j = 0; j <= segs; j++) {
                const a = (j / segs) * Math.PI * 2;
                pts.push(new THREE.Vector3(Math.cos(a) * ringR, y, Math.sin(a) * ringR));
            }

            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const centerDist = Math.abs(norm);
            const baseOp = (1.0 - centerDist * 0.72) * 0.72;

            const mat = new THREE.LineBasicMaterial({
                color: centerDist < 0.22 ? 0xfff388 : 0xffbb11,
                transparent: true,
                opacity: baseOp,
                blending: THREE.AdditiveBlending
            });

            const line = new THREE.Line(geo, mat);
            line.userData = {
                baseY: y,
                baseR: ringR,
                norm: norm,
                baseOp: baseOp,
                freq: 1.5 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2
            };

            this.waveSlices.push(line);
            this.waveGroup.add(line);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 7. VERTICAL BEAM BUNDLE (Crosshair Axis Lines)
    // ─────────────────────────────────────────────────────────────
    _buildVerticalBeamBundle() {
        this.vertBundle = new THREE.Group();
        this.orbGroup.add(this.vertBundle);

        this.vertSlices = [];
        const R = 4.75;
        const count = 30;
        const widthSpread = 1.5;

        for (let i = 0; i < count; i++) {
            const norm = (i / (count - 1)) * 2.0 - 1.0;
            const xOffset = norm * (widthSpread / 2);

            const pts = [];
            const segs = 80;
            for (let j = 0; j <= segs; j++) {
                const phi = (j / segs) * Math.PI;
                const y = Math.cos(phi) * R;
                const z = Math.sin(phi) * Math.sqrt(Math.max(0, R * R - y * y - xOffset * xOffset));
                pts.push(new THREE.Vector3(xOffset, y, z));
            }

            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const centerDist = Math.abs(norm);
            const baseOp = (1.0 - centerDist * 0.68) * 0.58;

            const mat = new THREE.LineBasicMaterial({
                color: centerDist < 0.2 ? 0xfff077 : 0xffaa00,
                transparent: true,
                opacity: baseOp,
                blending: THREE.AdditiveBlending
            });

            const line = new THREE.Line(geo, mat);
            line.userData = { baseOp: baseOp, norm: norm, phase: Math.random() * Math.PI * 2 };
            this.vertSlices.push(line);
            this.vertBundle.add(line);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 8. HOLOGRAPHIC VERTICAL LASER SCANNER SWEEP
    // ─────────────────────────────────────────────────────────────
    _buildHolographicLaserScanner() {
        const scanGeo = new THREE.RingGeometry(0.1, 4.7, 64);
        const vert = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const frag = `
            uniform float uAlpha;
            varying vec2 vUv;
            void main() {
                float dist = length(vUv - vec2(0.5));
                float edge = smoothstep(0.48, 0.44, dist) * smoothstep(0.0, 0.2, dist);
                vec3 col = mix(vec3(1.0, 0.7, 0.1), vec3(1.0, 0.95, 0.6), dist * 2.0);
                gl_FragColor = vec4(col, edge * uAlpha);
            }
        `;
        this.scanUni = { uAlpha: { value: 0.35 } };
        const scanMat = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.scanUni,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        this.laserScanner = new THREE.Mesh(scanGeo, scanMat);
        this.laserScanner.rotation.x = Math.PI / 2;
        this.orbGroup.add(this.laserScanner);
    }

    // ─────────────────────────────────────────────────────────────
    // 9. INNER ROTATING CONSCIOUSNESS CORE (Quantum Lattice Cage)
    // ─────────────────────────────────────────────────────────────
    _buildInnerRotatingCore() {
        this.innerCoreGroup = new THREE.Group();
        this.orbGroup.add(this.innerCoreGroup);

        const coreRadius = 2.15;

        // 1. Icosahedron wireframe lattice
        const icoGeo = new THREE.IcosahedronGeometry(coreRadius, 2);
        const icoMat = new THREE.MeshBasicMaterial({
            color: 0xffc400,
            wireframe: true,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        this.innerIco = new THREE.Mesh(icoGeo, icoMat);
        this.innerCoreGroup.add(this.innerIco);

        // 2. Dodecahedron inner core
        const dodecaGeo = new THREE.DodecahedronGeometry(coreRadius * 0.75, 1);
        const dodecaMat = new THREE.MeshBasicMaterial({
            color: 0xffeb66,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });
        this.innerDodeca = new THREE.Mesh(dodecaGeo, dodecaMat);
        this.innerCoreGroup.add(this.innerDodeca);

        // 3. Gyroscopic orbital rings inside the core
        this.coreRings = [];
        const ringConfigs = [
            { r: 2.2,  tube: 0.02,  rx: Math.PI / 3,  ry: 0,            rz: Math.PI / 4,  speed: 0.9,  color: 0xffe266 },
            { r: 1.9,  tube: 0.018, rx: -Math.PI / 4, ry: Math.PI / 6,  rz: -Math.PI / 3, speed: -1.2, color: 0xffaa00 },
            { r: 1.6,  tube: 0.015, rx: Math.PI / 2,  ry: Math.PI / 4,  rz: 0,            speed: 1.5,  color: 0xfff077 },
            { r: 2.35, tube: 0.012, rx: -Math.PI / 6, ry: -Math.PI / 3, rz: Math.PI / 2,  speed: -0.8, color: 0xff8800 }
        ];

        ringConfigs.forEach(cfg => {
            const geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 12, 120);
            const mat = new THREE.MeshBasicMaterial({
                color: cfg.color,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.set(cfg.rx, cfg.ry, cfg.rz);
            ring.userData = { speed: cfg.speed };
            this.coreRings.push(ring);
            this.innerCoreGroup.add(ring);
        });

        // 4. Dense nested longitude helix cage
        const helixLinesCount = 12;
        this.helixCage = new THREE.Group();
        this.innerCoreGroup.add(this.helixCage);

        for (let i = 0; i < helixLinesCount; i++) {
            const pts = [];
            const segs = 60;
            const angleOffset = (i / helixLinesCount) * Math.PI * 2;
            for (let j = 0; j <= segs; j++) {
                const u = (j / segs) * Math.PI;
                const y = Math.cos(u) * coreRadius * 0.95;
                const r = Math.sin(u) * coreRadius * 0.95;
                const twist = angleOffset + u * 1.5;
                pts.push(new THREE.Vector3(Math.cos(twist) * r, y, Math.sin(twist) * r));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: 0xffd033,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(geo, mat);
            this.helixCage.add(line);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 10. CENTRAL ANAMORPHIC OPTICAL LENS FLARE (Stark 8-Point Core)
    // ─────────────────────────────────────────────────────────────
    _buildCentralAnamorphicFlare() {
        this.flareGroup = new THREE.Group();
        this.orbGroup.add(this.flareGroup);

        // A. Intense white-hot center core sphere
        const hotCoreGeo = new THREE.SphereGeometry(0.62, 32, 32);
        this.hotCoreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.99,
            blending: THREE.AdditiveBlending
        });
        this.hotCore = new THREE.Mesh(hotCoreGeo, this.hotCoreMat);
        this.flareGroup.add(this.hotCore);

        // B. Concentric golden bloom glow spheres
        const glows = [
            { r: 1.18, op: 0.82, color: 0xfff6aa },
            { r: 1.95, op: 0.52, color: 0xffc400 },
            { r: 2.95, op: 0.26, color: 0xff8800 }
        ];

        this.glowSpheres = [];
        glows.forEach(g => {
            const geo = new THREE.SphereGeometry(g.r, 32, 32);
            const mat = new THREE.MeshBasicMaterial({
                color: g.color,
                transparent: true,
                opacity: g.op,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            this.glowSpheres.push({ mesh, baseOp: g.op, baseR: g.r });
            this.flareGroup.add(mesh);
        });

        // C. Horizontal & Vertical Anamorphic Flare Streaks
        const makeStreak = (isVertical) => {
            const vert = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;
            const frag = `
                uniform float uTime;
                uniform float uAudio;
                uniform float uIsVertical;
                varying vec2 vUv;
                void main() {
                    float coord = uIsVertical > 0.5 ? vUv.x : vUv.y;
                    float dist = abs(coord - 0.5) * 2.0;
                    float thick = exp(-dist * (uIsVertical > 0.5 ? 18.0 : 24.0));
                    
                    float lengthCoord = uIsVertical > 0.5 ? vUv.y : vUv.x;
                    float lengthDist = abs(lengthCoord - 0.5) * 2.0;
                    float lengthFade = pow(clamp(1.0 - lengthDist, 0.0, 1.0), 1.3);
                    
                    float alpha = thick * lengthFade * (0.88 + uAudio * 0.5);
                    vec3 col = mix(vec3(1.0, 0.75, 0.1), vec3(1.0, 0.98, 0.92), thick * thick);
                    gl_FragColor = vec4(col, alpha);
                }
            `;

            const w = isVertical ? 0.45 : 10.6;
            const h = isVertical ? 10.6 : 0.45;
            const geo = new THREE.PlaneGeometry(w, h);
            const uni = {
                uTime: { value: 0 },
                uAudio: { value: 0 },
                uIsVertical: { value: isVertical ? 1.0 : 0.0 }
            };
            const mat = new THREE.ShaderMaterial({
                vertexShader: vert,
                fragmentShader: frag,
                uniforms: uni,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            return { mesh, uni };
        };

        this.streakH = makeStreak(false);
        this.streakV = makeStreak(true);
        this.streakH.mesh.position.z = 0.02;
        this.streakV.mesh.position.z = 0.03;
        this.flareGroup.add(this.streakH.mesh);
        this.flareGroup.add(this.streakV.mesh);

        // D. 8-Point Diffraction Star Flare
        const diamondGeo = new THREE.PlaneGeometry(2.8, 2.8);
        const diamondMat = new THREE.MeshBasicMaterial({
            color: 0xfffae5,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending
        });
        this.diamondFlare1 = new THREE.Mesh(diamondGeo, diamondMat);
        this.diamondFlare1.rotation.z = Math.PI / 4;
        this.diamondFlare1.position.z = 0.04;
        this.flareGroup.add(this.diamondFlare1);

        const diamondGeo2 = new THREE.PlaneGeometry(1.8, 1.8);
        const diamondMat2 = new THREE.MeshBasicMaterial({
            color: 0xffea88,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        this.diamondFlare2 = new THREE.Mesh(diamondGeo2, diamondMat2);
        this.diamondFlare2.rotation.z = 0;
        this.diamondFlare2.position.z = 0.05;
        this.flareGroup.add(this.diamondFlare2);
    }

    // ─────────────────────────────────────────────────────────────
    // 11. HOLOGRAPHIC SHOCKWAVE PULSE SYSTEM
    // ─────────────────────────────────────────────────────────────
    _buildShockwaveSystem() {
        this.shockwaveGroup = new THREE.Group();
        this.orbGroup.add(this.shockwaveGroup);

        for (let i = 0; i < 4; i++) {
            const geo = new THREE.RingGeometry(0.1, 0.2, 64);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xfff077,
                transparent: true,
                opacity: 0.0,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(geo, mat);
            this.shockwaveGroup.add(ring);
            this.shockwaves.push({ mesh: ring, active: false, progress: 0, speed: 1.5 });
        }
    }

    triggerShockwave(speed = 1.8) {
        const sw = this.shockwaves.find(s => !s.active);
        if (sw) {
            sw.active = true;
            sw.progress = 0;
            sw.speed = speed;
            sw.mesh.scale.set(0.1, 0.1, 1);
            sw.mesh.material.opacity = 0.9;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 12. 3D FLOATING HOLOGRAPHIC DATA BADGES & RINGS
    // ─────────────────────────────────────────────────────────────
    _buildFloatingHoloBadges() {
        this.badgeGroup = new THREE.Group();
        this.orbGroup.add(this.badgeGroup);

        // Orbiting Stark Telemetry Ring at R = 5.8
        const R = 5.7;
        const segs = 60;
        const pts = [];
        for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineDashedMaterial({
            color: 0xffaa00,
            dashSize: 0.4,
            gapSize: 0.2,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        this.outerDashedRing = new THREE.Line(geo, mat);
        this.outerDashedRing.computeLineDistances();
        this.badgeGroup.add(this.outerDashedRing);
    }

    // ─────────────────────────────────────────────────────────────
    // STATE & AUDIO INTERFACE
    // ─────────────────────────────────────────────────────────────
    setState(state) {
        if (this.stateConfig[state]) {
            this.currentState = state;
            this.targetColor.copy(this.stateConfig[state].color);
            this.triggerShockwave(2.2);
        }
    }

    setAudioLevel(level) {
        this.targetAudio = Math.max(0, Math.min(1, level));
        if (level > 0.6) {
            this.triggerShockwave(1.6);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ANIMATION & FRAME UPDATE
    // ─────────────────────────────────────────────────────────────
    _animate() {
        requestAnimationFrame(() => this._animate());

        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.time = this.clock.getElapsedTime();
        const cfg = this.stateConfig[this.currentState] || this.stateConfig.IDLE;

        // Smooth color lerping
        this.currentColor.lerp(this.targetColor, dt * 3.0);

        // Smooth audio response interpolation
        this.audioLevel += (this.targetAudio - this.audioLevel) * Math.min(dt * 10, 1.0);
        const aud = this.audioLevel;
        const t = this.time * cfg.speed;

        // Smooth Mouse Parallax + 3D Drag Rotation
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * dt * 4.0;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * dt * 4.0;

        if (!this.drag.isDown) {
            // Smoothly return towards front with subtle resting float
            this.drag.targetRotX += (0 - this.drag.targetRotX) * dt * 2.0;
            this.drag.targetRotY += (0 - this.drag.targetRotY) * dt * 2.0;
        }

        this.drag.rotX += (this.drag.targetRotX - this.drag.rotX) * dt * 8.0;
        this.drag.rotY += (this.drag.targetRotY - this.drag.rotY) * dt * 8.0;

        if (this.parallaxGroup) {
            this.parallaxGroup.rotation.y = this.mouse.x * 0.26 + this.drag.rotY;
            this.parallaxGroup.rotation.x = -this.mouse.y * 0.2 + this.drag.rotX;
        }

        // 1. Outer boundary rings
        this.outerRings.forEach(r => {
            r.mesh.rotation.z += r.speed * dt * cfg.speed;
            const pulse = 1.0 + Math.sin(t * cfg.pulseRate) * 0.06 + aud * 0.35;
            r.mesh.material.opacity = Math.min(1.0, r.baseOpacity * pulse * cfg.intensity);
            r.mesh.material.color.copy(this.currentColor);
        });

        // 2. Ticks & Reticle rotations
        if (this.tickGroup) {
            this.tickGroup.rotation.z += 0.03 * dt * cfg.speed;
            this.tickMat.color.copy(this.currentColor);
        }
        if (this.reticleGroup) {
            this.reticleGroup.rotation.z -= 0.12 * dt * cfg.speed;
        }
        if (this.innerReticleGroup) {
            this.innerReticleGroup.rotation.z += 0.2 * dt * cfg.speed;
        }

        // 3. Orbiting chevrons
        for (let i = 0; i < this.chevrons.length; i++) {
            const ch = this.chevrons[i];
            ch.userData.angle += ch.userData.speed * dt * cfg.speed;
            const a = ch.userData.angle;
            const r = ch.userData.radius;
            ch.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02);
            ch.rotation.z = a + Math.PI / 2;
        }

        // 4. Outer spherical grid rotation
        if (this.gridGroup) {
            this.gridGroup.rotation.y += 0.09 * dt * cfg.speed;
        }

        // 5. Equatorial waveform slices (Harmonic resonance & Audio frequency displacement)
        for (let i = 0; i < this.waveSlices.length; i++) {
            const slice = this.waveSlices[i];
            const u = slice.userData;
            const wave = Math.sin(t * 2.4 + u.phase) * 0.07 * cfg.waveAmp;
            const audioKick = aud * (1.0 - Math.abs(u.norm)) * 0.24;
            const scale = 1.0 + wave + audioKick;

            slice.scale.set(scale, 1.0, scale);
            slice.material.opacity = Math.min(1.0, u.baseOp * (1.0 + aud * 0.8) * cfg.intensity);
            slice.material.color.copy(this.currentColor);
        }

        // 6. Vertical bundle lines
        for (let i = 0; i < this.vertSlices.length; i++) {
            const line = this.vertSlices[i];
            const u = line.userData;
            const pulse = Math.sin(t * 3.0 + u.phase) * 0.14 + aud * 0.55;
            line.material.opacity = Math.min(1.0, u.baseOp * (1.0 + pulse) * cfg.intensity);
        }

        // 7. Laser Scanner Sweep
        if (this.laserScanner) {
            const scanY = Math.sin(t * 1.6 * cfg.scanSpeed) * 4.4;
            this.laserScanner.position.y = scanY;
            const scanR = Math.sqrt(Math.max(0.4, 4.75 * 4.75 - scanY * scanY)) / 4.75;
            this.laserScanner.scale.set(scanR, scanR, 1.0);
            this.scanUni.uAlpha.value = (0.2 + aud * 0.35) * cfg.intensity;
        }

        // 8. Inner consciousness core
        if (this.innerCoreGroup) {
            this.innerCoreGroup.rotation.y += 0.4 * dt * cfg.coreRotSpeed;
            this.innerCoreGroup.rotation.x += 0.18 * dt * cfg.coreRotSpeed;
        }
        if (this.innerIco) {
            this.innerIco.rotation.y -= 0.6 * dt * cfg.coreRotSpeed;
            this.innerIco.rotation.z += 0.3 * dt * cfg.coreRotSpeed;
            this.innerIco.material.color.copy(this.currentColor);
        }
        if (this.innerDodeca) {
            this.innerDodeca.rotation.x += 0.5 * dt * cfg.coreRotSpeed;
            this.innerDodeca.rotation.y += 0.4 * dt * cfg.coreRotSpeed;
        }
        if (this.helixCage) {
            this.helixCage.rotation.y += 0.7 * dt * cfg.coreRotSpeed;
        }
        for (let i = 0; i < this.coreRings.length; i++) {
            const r = this.coreRings[i];
            r.rotation.z += r.userData.speed * dt * cfg.coreRotSpeed;
        }

        // 9. Central optical flare & core glow
        const corePulse = 1.0 + Math.sin(t * cfg.pulseRate * 1.5) * 0.14 + aud * 0.65;
        if (this.hotCore) {
            const s = (0.62 + aud * 0.42) * cfg.flareScale;
            this.hotCore.scale.set(s, s, s);
        }
        this.glowSpheres.forEach(g => {
            const s = (1.0 + aud * 0.45) * cfg.flareScale;
            g.mesh.scale.set(s, s, s);
            g.mesh.material.opacity = Math.min(1.0, g.baseOp * corePulse * cfg.intensity);
        });

        // 10. Streak shaders
        if (this.streakH) {
            this.streakH.uni.uTime.value = t;
            this.streakH.uni.uAudio.value = aud;
            const sx = (1.0 + aud * 0.28) * cfg.flareScale;
            const sy = (1.0 + aud * 0.65) * cfg.flareScale;
            this.streakH.mesh.scale.set(sx, sy, 1.0);
        }
        if (this.streakV) {
            this.streakV.uni.uTime.value = t;
            this.streakV.uni.uAudio.value = aud;
            const sx = (1.0 + aud * 0.65) * cfg.flareScale;
            const sy = (1.0 + aud * 0.28) * cfg.flareScale;
            this.streakV.mesh.scale.set(sx, sy, 1.0);
        }

        // 11. 8-Point Diffraction star
        if (this.diamondFlare1) {
            const ds1 = (0.75 + Math.sin(t * 3.8) * 0.1 + aud * 0.55) * cfg.flareScale;
            this.diamondFlare1.scale.set(ds1, ds1, 1.0);
            this.diamondFlare1.rotation.z = Math.PI / 4 + Math.sin(t * 1.8) * 0.12;
        }
        if (this.diamondFlare2) {
            const ds2 = (0.65 + Math.cos(t * 3.2) * 0.08 + aud * 0.45) * cfg.flareScale;
            this.diamondFlare2.scale.set(ds2, ds2, 1.0);
            this.diamondFlare2.rotation.z = -Math.sin(t * 1.5) * 0.1;
        }

        // 12. Shockwave Pulses Animation
        for (let i = 0; i < this.shockwaves.length; i++) {
            const sw = this.shockwaves[i];
            if (sw.active) {
                sw.progress += dt * sw.speed;
                const r = 0.5 + sw.progress * 5.2;
                sw.mesh.scale.set(r, r, 1);
                sw.mesh.material.opacity = Math.max(0, (1.0 - sw.progress) * 0.85);
                if (sw.progress >= 1.0) {
                    sw.active = false;
                    sw.mesh.material.opacity = 0;
                }
            }
        }

        // 13. Outer dashed ring rotation
        if (this.outerDashedRing) {
            this.outerDashedRing.rotation.z += 0.04 * dt * cfg.speed;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    _onResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const W = this.container.clientWidth || 600;
        const H = this.container.clientHeight || 600;
        this.camera.aspect = W / H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(W, H);
    }
}

window.SupernovaOrb = SupernovaOrb;
