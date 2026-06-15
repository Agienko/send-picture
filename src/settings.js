import GUI from "lil-gui";
import {stats} from "./main.js";
import {Ticker} from "pixi.js";
import {loadTextureFile} from './db-controller/db-controller.js'
import {loadSettings} from "./storage-controller/storage-controller.js";
import {createFileInput, processFileToLoad} from "./helpers.js";

const gui = new GUI({title: 'Particle Settings'});

const defaultSettings = {
    wanderForce: 0.07,   // постійний хаотичний рух
    textureForce: 0.88,  // м’яке притягування до картинки
    friction: 0.998, // майже не гасить швидкість
    maxSpeed: 1.3,
    lifeTime: 15000, // час загасання
    step: 3,
    particleCount: 100_000,
    brashRadiusScale: 1,
    brashIterations: 200,
    lockBrash: false,
    renderer: 'webgl',
    maxFPS: 45,
    stats: false,
    bgColor: '#001329',
    color: '#F2C14E',
    textureName: 'default',
}


export const settings = {
    ...defaultSettings,
    ...loadSettings(),
    resetToDefault: () => {
        Object.assign(settings, defaultSettings);
        void init();
        stats.domElement.style.display = 'none';
        gui.controllersRecursive().forEach(controller => controller.updateDisplay());
    }
}

export async function init() {
    const file = settings.textureName !== 'default' ? await loadTextureFile() : null;
    processFileToLoad(file);
}
export const closeGui = () => gui.close();

closeGui()

gui.add(settings, 'wanderForce', 0, 1, 0.001);
gui.add(settings, 'textureForce', 0, 5, 0.001);
gui.add(settings, 'friction', 0.8, 1.5, 0.0001);
gui.add(settings, 'maxSpeed', 0.1, 5, 0.1);
gui.add(settings, 'lifeTime', 500, 60000, 100);
gui.add(settings, 'step', 1, 10, 1);

gui.add(settings, 'brashRadiusScale', 0.1, 4, 0.001);
gui.add(settings, 'brashIterations', 10, 3000, 1);
gui.add(settings, 'lockBrash', 0, 1, 1);

gui.add(settings, 'stats', 0, 1, 1).onChange((value) => {
    stats.domElement.style.display = value ? 'block' : 'none';
});

gui.add(settings, 'renderer', ['webgl', 'webgpu']).name('renderer').onChange((value) => location.reload());

Ticker.shared.maxFPS = settings.maxFPS;
gui.add(settings, 'maxFPS', 24, 120, 1).name('max FPS').onChange((value) => Ticker.shared.maxFPS = +value);

let debounceParticleAmountTimeout = -1;
gui.add(settings, 'particleCount', 10000, 500000, 1).onChange(value => {
    clearTimeout(debounceParticleAmountTimeout);
    debounceParticleAmountTimeout = setTimeout(() => {
        const event = new CustomEvent('particleCountChanged', {detail: value});
        window.dispatchEvent(event);
    }, 250)
})

let debounceTimeout = -1;
gui.addColor(settings, 'color').onChange((value) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const event = new CustomEvent('colorChanged', {detail: {color: value}});
        window.dispatchEvent(event);
    }, 250)

});

let debounceBgColorTimeout = -1;
gui.addColor(settings, 'bgColor').onChange((value) => {
    clearTimeout(debounceBgColorTimeout);
    debounceBgColorTimeout = setTimeout(() => {
        const event = new CustomEvent('bgColorChanged', {detail: {color: value}});
        window.dispatchEvent(event);
    }, 250)

});

gui.add(settings, 'resetToDefault').name('Reset to default');

const textureController = gui.add(settings, 'textureName').name('Texture').disable();

const fileInput = createFileInput();
window.addEventListener('textureLoaded', (event) => {
    textureController.updateDisplay();
    settings.textureName = event.detail.textureName;
    closeGui();
})
gui.add(fileInput, 'click').name('Load Texture');