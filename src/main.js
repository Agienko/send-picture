import './style.css'
import {Application, Ticker} from 'pixi.js';
import {ReferenceSprite} from "./reference-sprite.js";
import {Brush} from "./brush.js";
import {loadSavedTexture, settings} from "./settings.js";
import {hideLoader, showLoader} from "./loader.js";
import {ParticleCreator} from "./particle-creator.js";
import Stats from 'stats.js';

export const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: MS, 2: MB
stats.domElement.style.display = settings.stats ? 'block' : 'none';
document.body.appendChild(stats.dom);

document.body.style.backgroundColor = settings.bgColor;

export const app = new Application();
showLoader();
(async () => {
    await app.init({
        preference: settings.renderer,
        resizeTo: window,
        antialias: false,
        autoDensity: true,
        resolution: 1,
        backgroundColor: settings.bgColor
    });

    window.addEventListener('bgColorChanged', (e) => {
        const color = e.detail.color;
        document.body.style.backgroundColor = settings.bgColor;
        app.renderer.background.color = color;
    })

    app.stage.eventMode = 'static';
    app.stage.interactiveChildren = false;
    document.body.appendChild(app.canvas);

    const referenceSprite = new ReferenceSprite();

    await loadSavedTexture()

    const particleCreator = new ParticleCreator();
    const brush = new Brush(particleCreator.particles);

    hideLoader()

    const step = settings.step;

    Ticker.shared.add(ticker => {
        settings.stats && stats.begin();
        const now = performance.now();
        const delta = ticker.elapsedMS / 16.6667;
        for (let i = 0; i < particleCreator.particles.length; i++) {
            const p = particleCreator.getParticle(i);

            if(p.alpha <= 0) continue;

            const darkness = referenceSprite.getBrightnessAt(p.x, p.y);
            const gx = referenceSprite.getBrightnessAt(p.x + step, p.y) - referenceSprite.getBrightnessAt(p.x - step, p.y);
            const gy = referenceSprite.getBrightnessAt(p.x, p.y + step) - referenceSprite.getBrightnessAt(p.x, p.y - step);

            p.onTick(gx, gy, darkness, now, delta);

        }
        settings.stats && stats.end();
    });
})();