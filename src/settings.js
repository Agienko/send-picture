import GUI from "lil-gui";
import {stats} from "./main.js";
import {Assets, Texture, Ticker} from "pixi.js";
import {loadTextureFile, saveTextureFile} from './db.js'

const STORAGE_KEY = '_send_particle_settings_';

const gui = new GUI({title: 'Particle Settings'});

const loadSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch (e) {
        return {};
    }
};

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
        void loadSavedTexture();
        stats.domElement.style.display = 'none';
        gui.controllersRecursive().forEach(controller => controller.updateDisplay());
    }
}


export async function loadSavedTexture() {
    const file = settings.textureName !== 'default' ? await loadTextureFile() : null;

    if (!file) {
        settings.textureName = 'default';
        textureController.updateDisplay();
        const texture = await Assets.load('/default.png');

        const event = new CustomEvent('textureLoaded', {detail: texture});
        window.dispatchEvent(event);
        return;
    }

    const url = URL.createObjectURL(file);

    const image = new Image();
    image.onload = () => {
        const texture = Texture.from(image);
        URL.revokeObjectURL(url);
        console.log('Texture loaded:', file.name, texture);
        settings.textureName = file.name;
        textureController.updateDisplay();
        const event = new CustomEvent('textureLoaded', {detail: texture});
        window.dispatchEvent(event);
    };

    image.onerror = (error) => {
        URL.revokeObjectURL(url);
        console.error('Texture error:', file.name);
    };

    image.src = url;
}

export const closeGui = () => gui.close();

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

gui.add(settings, 'maxFPS', 24, 120, 1).name('max FPS').onChange((value) => Ticker.shared.maxFPS = +value);

let debounceParticleAmountTimeout = -1;

gui.add(settings, 'particleCount', 10000, 200000, 1).onChange(value => {
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

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';

fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await saveTextureFile(file);
    const url = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
        const texture = Texture.from(image);
        URL.revokeObjectURL(url);
        console.log('Texture loaded:', file.name);
        settings.textureName = file.name;
        textureController.updateDisplay();
        const event = new CustomEvent('textureLoaded', {detail: texture});
        window.dispatchEvent(event);
    };

    image.onerror = (error) => {
        URL.revokeObjectURL(url);
        console.error('Texture error:', file.name);
    };

    image.src = url;

});

gui.add(fileInput, 'click').name('Load Texture');

const save = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
};

document.addEventListener('visibilitychange', (e) => {
    if (document.visibilityState === 'visible') return;
    save()
})

document.addEventListener('beforeunload', save)