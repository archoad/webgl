import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import Stats from './stats.module.js';


let renderer, scene, camera, controls, stats, mesh;
const nbrParticles = 500000;
const maxRand = 200;

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


function setupScene() {
	const geometry = new THREE.BufferGeometry();
	const material = new THREE.PointsMaterial({ vertexColors:true });

	let positions = [];
	let velocities = [];
	let colors = [];
	let sizes = [];
	for (let i=0; i<nbrParticles; i++) {
		let x = getRand(-maxRand, maxRand);
		let y = getRand(-maxRand, maxRand);
		let z = getRand(-maxRand, maxRand);
		velocities.push(getRand(-0.1, 0.1), getRand(-0.1, 0.1), getRand(-0.1, 0.1));
		positions.push(x, y, z);
		colors.push(Math.random(), Math.random(), Math.random());
		sizes.push(2.0);
	}

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
	mesh = new THREE.Points(geometry, material);
	scene.add(mesh);

}


function init() {
	stats = new Stats();
	document.body.appendChild(stats.dom);

	renderer = new THREE.WebGLRenderer({ antialias:true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x2a2b2c);
	scene.fog = new THREE.Fog(0x2a2b2c, 3000, 5000);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
	controls = new OrbitControls(camera, renderer.domElement);
	camera.position.z = 250;
	camera.lookAt(0, 0, 0);
	controls.update();

	window.addEventListener('resize', onWindowResize, false);

	setupScene();
}


function animate() {
	requestAnimationFrame(animate);
	render();
}


function render() {
	controls.update();
	stats.update();
	let time = Date.now() * 0.001;
	mesh.rotation.x = time * 0.025;
	mesh.rotation.y = time * 0.030;
	mesh.rotation.z = time * 0.020;

	let p = mesh.geometry.attributes.position.array;
	let v = mesh.geometry.attributes.velocity.array;
	for(let i=0; i<nbrParticles*3; i++) {
		p[i] += v[i];
	}
	mesh.geometry.attributes.position.needsUpdate = true;
	mesh.geometry.computeBoundingSphere();
	renderer.render(scene, camera);
}
