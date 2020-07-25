import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { GUI } from './dat.gui.module.js';
import Stats from './stats.module.js';


let renderer, scene, camera, controls, stats, materials = [], parameters;
const nbrParticles = 50000;
const maxRand = 1000;
const nbrObjects = 8;
let timeScale = 1;
let colorSpeed = 1;


init();
animate();


function getRand(min, max) {
	return min + Math.random()*(max-min);
}


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}


function modifyTimeScale(speed) {
	timeScale = speed;
}


function modifyColorScale(speed) {
	colorSpeed = speed;
}


function setPanel() {
	let panel = new GUI();
	let settings = {
		'message': 'Hello World',
		'time speed': 1,
		'color speed': 1,
	}
	panel.add(settings, 'message');
	panel.add(settings, 'time speed', 0, 10).onChange(modifyTimeScale);
	panel.add(settings, 'color speed', 0, 10).onChange(modifyColorScale);
}


function setupScene() {
	let geometry = new THREE.BufferGeometry();
	let textureLoader = new THREE.TextureLoader();
	let sprites = [
		textureLoader.load('pictures/snowflake1.png'),
		textureLoader.load('pictures/snowflake2.png'),
		textureLoader.load('pictures/snowflake3.png'),
		textureLoader.load('pictures/snowflake4.png'),
		textureLoader.load('pictures/snowflake5.png'),
		textureLoader.load('pictures/snowflake6.png'),
		textureLoader.load('pictures/cloud.png'),
	]

	let positions = [];
	for (let i=0; i<nbrParticles; i++) {
		let x = getRand(-maxRand, maxRand);
		let y = getRand(-maxRand, maxRand);
		let z = getRand(-maxRand, maxRand);
		positions.push(x, y, z);
	}
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

	for (let i=0; i<nbrObjects; i++) {
		let size = getRand(5, 10);
		let sprite = sprites[i%sprites.length];
		materials[i] = new THREE.PointsMaterial({size:size, map:sprite, blending:THREE.AdditiveBlending, depthTest:false, transparent:true});
		materials[i].color.setHSL(Math.random(), 0.8, 0.5);

		let particle = new THREE.Points(geometry, materials[i]);
		scene.add(particle);
	}
}


function init() {
	stats = new Stats();
	document.body.appendChild(stats.dom);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x2a2b2c);
	scene.fog = new THREE.Fog(0x2a2b2c, 3000, 5000);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
	controls = new OrbitControls(camera, renderer.domElement);
	camera.position.z = 750;
	camera.lookAt(0, 0, 0);
	controls.update();

	window.addEventListener('resize', onWindowResize, false);
	setPanel();
	setupScene();
}


function animate() {
	requestAnimationFrame(animate);
	render();
	controls.update();
	stats.update();
}


function render() {
	let time = Date.now() * timeScale * 0.000005;
	for (let i=0; i<nbrObjects; i++) {
		let object = scene.children[i];
		if (object instanceof THREE.Points) {
			object.rotation.x = time + (i % nbrObjects);
			object.rotation.y = time - (i % nbrObjects);
			object.rotation.z = time + (i % nbrObjects);
		}
		let h, hsl = {};
		materials[i].color.getHSL(hsl);
		if (i%2==0) {
			h = (((hsl.h * 100) + (0.1 * colorSpeed)) % 100) / 100;
		} else {
			h = (((hsl.h * 100) - 0.1 * colorSpeed) % 100) / 100;
		}
		materials[i].color.setHSL(h, hsl.s, hsl.l);
	}
	renderer.render(scene, camera);
}
