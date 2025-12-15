import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LagosCity3DProps {
  mood: 'chaotic' | 'calm' | 'danger' | 'party' | 'tech' | undefined;
}

export const LagosCity3D: React.FC<LagosCity3DProps> = ({ mood = 'chaotic' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const fogRef = useRef<THREE.FogExp2 | null>(null);
  const speedRef = useRef<number>(1.0);
  
  // Entity Groups
  const danfosRef = useRef<THREE.Group[]>([]);
  const trafficRef = useRef<THREE.Group[]>([]);
  const environmentRef = useRef<THREE.Group[]>([]); // Street lights, billboards
  const particleSystemRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const fog = new THREE.FogExp2(0x110500, 0.02); // Dusty Lagos evening
    scene.fog = fog;
    fogRef.current = fog;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Lower camera angle for more "action movie" feel
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1.5, -20);

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance cap
    renderer.toneMapping = THREE.ReinhardToneMapping;
    containerRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa00, 2); // Sun/Streetlight hue
    dirLight.position.set(10, 20, 5);
    scene.add(dirLight);

    // --- MATERIALS ---
    const danfoYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.1 });
    const danfoBlackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const luggageMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    
    const carRedMat = new THREE.MeshStandardMaterial({ color: 0x880000, roughness: 0.2, metalness: 0.6 });
    const carGreyMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2, metalness: 0.6 });
    
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // --- HELPER: CREATE DANFO ---
    const createDanfo = () => {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(1.6, 1.4, 3.2);
        const body = new THREE.Mesh(bodyGeo, danfoYellowMat);
        body.position.y = 0.7;
        group.add(body);

        // Black Stripes (Side)
        const stripeGeo = new THREE.BoxGeometry(1.65, 0.2, 3.25);
        const stripe = new THREE.Mesh(stripeGeo, danfoBlackMat);
        stripe.position.y = 0.7;
        group.add(stripe);

        // Roof Luggage (Chaos vibe)
        const luggageGeo = new THREE.BoxGeometry(1.4, 0.4, 1.5);
        const luggage = new THREE.Mesh(luggageGeo, luggageMat);
        luggage.position.set(0, 1.6, 0.2);
        group.add(luggage);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8);
        wheelGeo.rotateZ(Math.PI / 2);
        const frontWheels = new THREE.Mesh(wheelGeo, danfoBlackMat);
        frontWheels.position.set(0, 0.3, 1);
        group.add(frontWheels);
        const backWheels = new THREE.Mesh(wheelGeo, danfoBlackMat);
        backWheels.position.set(0, 0.3, -1);
        group.add(backWheels);

        // Lights
        const lightGeo = new THREE.BoxGeometry(1.4, 0.1, 0.1);
        const tailLight = new THREE.Mesh(lightGeo, redLightMat);
        tailLight.position.set(0, 0.8, 1.6);
        group.add(tailLight);

        const headLight = new THREE.Mesh(lightGeo, glowMat);
        headLight.position.set(0, 0.6, -1.6);
        group.add(headLight);

        return group;
    };

    // --- HELPER: CREATE REGULAR CAR ---
    const createCar = () => {
        const group = new THREE.Group();
        const colorMat = Math.random() > 0.5 ? carRedMat : carGreyMat;
        
        const bodyGeo = new THREE.BoxGeometry(1.5, 0.8, 2.8);
        const body = new THREE.Mesh(bodyGeo, colorMat);
        body.position.y = 0.4;
        group.add(body);

        const cabinGeo = new THREE.BoxGeometry(1.2, 0.5, 1.5);
        const cabin = new THREE.Mesh(cabinGeo, danfoBlackMat); // Tinted windows
        cabin.position.set(0, 1.0, -0.2);
        group.add(cabin);
        
        // Taillights
        const tailLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), redLightMat);
        tailLight.position.set(0, 0.5, 1.4);
        group.add(tailLight);

        return group;
    };

    // --- HELPER: CREATE STREET ENVIRONMENT ---
    // Represents Third Mainland Bridge lights and Billboards
    const createEnvironmentProp = (index: number) => {
        const group = new THREE.Group();
        const side = index % 2 === 0 ? 1 : -1;
        const xPos = side * (8 + Math.random() * 5); // Distance from road

        // Street Light
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 4);
        const pole = new THREE.Mesh(poleGeo, danfoBlackMat); // Grey pole
        pole.position.set(xPos, 4, 0);
        group.add(pole);

        const bulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const bulb = new THREE.Mesh(bulbGeo, glowMat);
        bulb.position.set(xPos - (side * 0.5), 7.5, 0);
        group.add(bulb);

        // Occasional Billboard
        if (Math.random() > 0.7) {
            const boardW = 4;
            const boardH = 2;
            const boardGeo = new THREE.PlaneGeometry(boardW, boardH);
            // Random Neon Colors for Ads
            const adColor = new THREE.Color().setHSL(Math.random(), 1, 0.5);
            const boardMat = new THREE.MeshBasicMaterial({ color: adColor, side: THREE.DoubleSide });
            const board = new THREE.Mesh(boardGeo, boardMat);
            board.position.set(xPos, 6, 0);
            board.lookAt(0, 1.5, 20); // Face camera roughly
            group.add(board);
        }

        return group;
    };

    // --- POPULATE SCENE ---
    
    // Road
    const roadGeo = new THREE.PlaneGeometry(30, 1000);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a, 
        shininess: 20 
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.z = -400;
    scene.add(road);

    // Initial Traffic
    for (let i = 0; i < 15; i++) {
        const isDanfo = Math.random() > 0.6; // 40% Danfos
        const mesh = isDanfo ? createDanfo() : createCar();
        
        mesh.position.z = -10 - (Math.random() * 100);
        mesh.position.x = (Math.random() - 0.5) * 10;
        
        // Add random slight sway rotation
        mesh.rotation.y = (Math.random() - 0.5) * 0.1;

        scene.add(mesh);
        if (isDanfo) danfosRef.current.push(mesh);
        else trafficRef.current.push(mesh);
    }

    // Initial Environment
    for (let i = 0; i < 40; i++) {
        const prop = createEnvironmentProp(i);
        prop.position.z = -i * 10;
        scene.add(prop);
        environmentRef.current.push(prop);
    }

    // Particles (Dust/Sparks)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        particlePositions[i] = (Math.random() - 0.5) * 40;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffff00, size: 0.1, transparent: true, opacity: 0.6 });
    const particleSystem = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;


    // --- ANIMATION LOOP ---
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const speed = speedRef.current;

      // Move Traffic (Relative to camera)
      // Some cars move faster (pass you), some slower (you pass them)
      [...danfosRef.current, ...trafficRef.current].forEach((car, idx) => {
          // Base speed of game is 'speed', cars have their own delta
          // A car with delta > speed moves forward away from camera
          // A car with delta < speed comes closer to camera (we overtake it)
          const carSpeedDelta = (idx % 3 === 0) ? 0.2 : -0.2; 
          
          car.position.z += (speed + carSpeedDelta) * 0.2; // Simulating relative movement
          
          // Loop logic
          if (car.position.z > 10) {
              car.position.z = -150 - Math.random() * 50;
              car.position.x = (Math.random() - 0.5) * 12;
          }
      });

      // Move Environment (We are moving forward, so props move +z)
      environmentRef.current.forEach(prop => {
          prop.position.z += speed;
          if (prop.position.z > 10) {
              prop.position.z = -390; // Recycle far back
          }
      });

      // Move Particles
      if (particleSystemRef.current) {
          particleSystemRef.current.position.z += speed;
          if (particleSystemRef.current.position.z > 20) {
              particleSystemRef.current.position.z = -20;
          }
          // Rotate for chaos
          particleSystemRef.current.rotation.z += 0.001;
      }

      // Camera Shake
      const time = Date.now() * 0.001;
      camera.position.y = 1.5 + Math.sin(time * 10) * 0.02; // Engine vibration
      camera.rotation.z = Math.sin(time * 2) * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Cleanup is simplified here for brevity, usually we dispose geoms/mats
    };
  }, []);

  // --- MOOD REACTIVITY ---
  useEffect(() => {
    if (!fogRef.current || !sceneRef.current) return;

    let targetColor = 0x000000;
    let targetSpeed = 1.0;
    
    switch (mood) {
        case 'chaotic': // The default Lagos Hustle
            targetColor = 0x331a00; // Brown/Orange dust
            targetSpeed = 1.8; // Fast
            break;
        case 'danger': // Police chase or Robbery
            targetColor = 0x330000; // Blood red sky
            targetSpeed = 2.5; // Very Fast
            break;
        case 'party': // Island Clubbing
            targetColor = 0x220044; // Purple neon
            targetSpeed = 0.8; // Cruising
            break;
        case 'tech': // Yaba Tech scene
            targetColor = 0x001122; // Cyber blue
            targetSpeed = 1.2;
            break;
        default:
            targetColor = 0x111111;
            targetSpeed = 0.5;
            break;
    }

    fogRef.current.color.setHex(targetColor);
    sceneRef.current.background = new THREE.Color(targetColor);
    speedRef.current = targetSpeed;
    
    // Update particle color based on mood
    if (particleSystemRef.current) {
        const mat = particleSystemRef.current.material as THREE.PointsMaterial;
        mat.color.setHex(mood === 'danger' ? 0xff0000 : 0xffff00);
    }

  }, [mood]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};