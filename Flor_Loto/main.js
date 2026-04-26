// main.js - Configuración de vista inicial según imagen proporcionada
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.002); 

// AJUSTE DE CÁMARA: Posición inicial más frontal y cercana (Z: 65, Y: 15)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 15, 65); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.minDistance = 10; 
controls.maxDistance = 200; // Límite de alejamiento para no perder la estética

// Iluminación
scene.add(new THREE.AmbientLight(0x404040, 0.6));
const light = new THREE.PointLight(0xff00ff, 4, 150);
light.position.set(0, 5, 5);
scene.add(light);

const lotusGroup = new THREE.Group();
scene.add(lotusGroup);

// --- PÉTALOS SUPERIORES ---
const petalGeo = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI, 0, Math.PI);
petalGeo.scale(0.9, 4.0, 0.25);
petalGeo.translate(0, 2, 0);

const petalMaterials = [];

function createRing(count, radius, tilt, scale, color, glow, yOff, op) {
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: new THREE.Color(glow),
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: op,
        side: THREE.DoubleSide
    });
    petalMaterials.push(mat);

    for (let i = 0; i < count; i++) {
        const pivot = new THREE.Group();
        pivot.position.y = yOff;
        const petal = new THREE.Mesh(petalGeo, mat);
        const angle = (i / count) * Math.PI * 2;
        
        petal.position.z = radius;
        petal.rotation.x = tilt;
        petal.scale.set(scale, scale, scale);
        
        pivot.rotation.y = angle;
        pivot.add(petal);
        lotusGroup.add(pivot);
    }
}

// Capas de la flor
createRing(8,  0.6, 0.3, 0.8, 0xffffff, 0xffffff, 1.0, 0.7); 
createRing(12, 1.5, 0.6, 1.0, 0xffd9ec, 0xff00ff, 0.5, 0.6); 
createRing(16, 3.0, 0.9, 1.2, 0xffb3d9, 0xff0080, -0.5, 0.5); 
createRing(20, 5.0, 1.2, 1.4, 0xff66b3, 0xff0040, -1.2, 0.4); 

// --- BASE DE HOJAS PELTADAS (7,000 Partículas) ---
const pCount = 7000; 
const pPos = new Float32Array(pCount * 3);
const numLeaves = 6; 
const particlesPerLeaf = Math.floor(pCount / numLeaves);

for(let j = 0; j < numLeaves; j++) {
    const leafAngle = (j / numLeaves) * Math.PI * 2;
    const leafCenterX = Math.cos(leafAngle) * 7.5; 
    const leafCenterZ = Math.sin(leafAngle) * 7.5;
    const leafRadius = 4.8; 

    for(let i = 0; i < particlesPerLeaf; i++) {
        const idx = (j * particlesPerLeaf + i) * 3;
        const r = Math.sqrt(Math.random()) * leafRadius;
        const a = Math.random() * Math.PI * 2;
        
        pPos[idx] = leafCenterX + Math.cos(a) * r;
        pPos[idx+1] = -2.8 + (Math.random() - 0.5) * 0.4; 
        pPos[idx+2] = leafCenterZ + Math.sin(a) * r;
    }
}

const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const baseParticles = new THREE.Points(pGeo, new THREE.PointsMaterial({ 
    size: 0.13, 
    color: 0xff00ff, 
    transparent: true, 
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
}));
lotusGroup.add(baseParticles);

// --- FONDO ESTRELLADO ---
const starCount = 15000; 
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 1500; 
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.25, 
    transparent: true, 
    opacity: 0.8,
    sizeAttenuation: true 
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    controls.update();
    
    const pulse = 1.2 + Math.sin(t * 3) * 0.7;
    petalMaterials.forEach(m => m.emissiveIntensity = pulse);
    
    lotusGroup.position.y = Math.sin(t) * 0.6;
    lotusGroup.rotation.z = Math.sin(t * 0.4) * 0.03;
    baseParticles.rotation.y += 0.001;
    stars.rotation.y += 0.00005;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();