import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import EarthTexture from "./assets/earth-texture.jpg";
import JupiterTexture from "./assets/jupiter-texture.jpg";
import MarTexture from "./assets/mars-texture.jpg";
import MercuryTexture from "./assets/mercury-texture.jpg";
import MoonTexture from "./assets/moon-texture.jpg";
import NeptuneTexture from "./assets/neptune-texture.jpg";
import PlutoTexture from "./assets/pluto-texture.jpg";
import SaturnRingTexture from "./assets/saturn-ring-texture.png";
import SaturnTexture from "./assets/saturn-texture.jpg";
import StartBackground from "./assets/start-background.jpg";
import SunTexture from "./assets/sun-texture.jpg";
import UranusRingTexture from "./assets/uranus-ring-texture.png";
import UranusTexture from "./assets/uranus-texture.jpg";
import VenusTexture from "./assets/venus-texture.jpg";
const Phoenix = new URL("./assets/phoenix.glb", import.meta.url);

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const assetLoader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const scene = new THREE.Scene();
scene.background = cubeTextureLoader.load([
  StartBackground,
  StartBackground,
  StartBackground,
  StartBackground,
  StartBackground,
  StartBackground,
]);

camera.position.set(-90, 140, 140);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//light
scene.add(new THREE.AmbientLight(0x333333, 10));

const pointLight = new THREE.PointLight(0xffffff, 10000, 1000);
scene.add(pointLight);

//sun
const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(SunTexture),
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const createPlanet = (radius, texture, position, ring) => {
  const geo = new THREE.SphereGeometry(radius, 30, 30);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const planet = new THREE.Mesh(geo, mat);
  planet.position.set(position, 0, 0);
  const orbit = new THREE.Object3D();
  orbit.add(planet);
  scene.add(orbit);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      30
    );
    const ringMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    planet.add(ringMesh);
  }

  return { planet, orbit };
};

//mercury
const mercury = createPlanet(3.2, MercuryTexture, 40);

//saturn
const saturn = createPlanet(9, SaturnTexture, 120, {
  innerRadius: 12,
  outerRadius: 20,
  texture: SaturnRingTexture,
});

//earth
const earth = createPlanet(5, EarthTexture, 60);
//moon
const moon = createPlanet(1.5, MoonTexture, 10);
earth.planet.add(moon.planet);

//jupiter
const jupiter = createPlanet(10, JupiterTexture, 180);

//mar
const mar = createPlanet(4, MarTexture, 90);

//neptune
const neptune = createPlanet(8, NeptuneTexture, 240);

//pluto
const pluto = createPlanet(2, PlutoTexture, 270);

//uranus
const uranus = createPlanet(7, UranusTexture, 210, {
  innerRadius: 9,
  outerRadius: 15,
  texture: UranusRingTexture,
});

//venus
const venus = createPlanet(4, VenusTexture, 0);

//fog
scene.fog = new THREE.Fog(0x00000, 1, 500);

//phoenix
let mixer;
assetLoader.load(
  Phoenix.href,
  (gltf) => {
    const phoenix = gltf.scene;
    phoenix.scale.set(0.01, 0.01, 0.01);
    phoenix.position.set(0, 0, 25);
    sun.add(phoenix);

    mixer = new THREE.AnimationMixer(phoenix);
    const clips = gltf.animations;
    clips.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

const clock = new THREE.Clock();
function animated() {
  requestAnimationFrame(animated);

  //rotate
  sun.rotation.y += 0.004;

  mercury.planet.rotation.y += 0.01;
  mercury.orbit.rotation.y += 0.008;

  saturn.planet.rotation.y += 0.01;
  saturn.orbit.rotation.y += 0.004;

  earth.planet.rotation.y += 0.01;
  earth.orbit.rotation.y += 0.006;

  jupiter.planet.rotation.y += 0.01;
  jupiter.orbit.rotation.y += 0.002;

  mar.planet.rotation.y += 0.01;
  mar.orbit.rotation.y += 0.01;

  neptune.planet.rotation.y += 0.01;
  neptune.orbit.rotation.y += 0.002;

  pluto.planet.rotation.y += 0.01;
  pluto.orbit.rotation.y += 0.001;

  uranus.planet.rotation.y += 0.01;
  uranus.orbit.rotation.y += 0.003;

  venus.planet.rotation.y += 0.01;
  venus.orbit.rotation.y += 0.007;

  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}

animated();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
