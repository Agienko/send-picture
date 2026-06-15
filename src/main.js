import './style.css'
import Stats from 'stats.js';
import {App} from "./components/application.js";
import {Ticker} from 'pixi.js';
import {Reference} from "./components/reference.js";
import {Brush} from "./components/brush.js";
import {SandFactory} from "./components/sand-factory.js";
import {init, settings} from "./settings.js";
import {hideLoader, showLoader} from "./loader-controller/loader-controller.js";
import {Fullscreen} from "./fullscreen.js";

new Fullscreen();

showLoader();
export const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: MS, 2: MB
stats.domElement.style.display = settings.stats ? 'block' : 'none';
document.body.appendChild(stats.dom);

document.body.style.backgroundColor = settings.bgColor;


export const app = new App();

(async () => {
    await app.init();
    const reference = new Reference();
    await init();
    const sandFactory = new SandFactory();
    const brush = new Brush(sandFactory.particles);
    hideLoader();
    Ticker.shared.add(ticker => {
        settings.stats && stats.begin();

        const now = performance.now();
        const delta = ticker.elapsedMS / 16.6667;

        for (let i = 0; i < sandFactory.particles.length; i++) {
            const particle = sandFactory.getParticle(i);
            if (particle.alpha <= 0) continue;

            const params = reference.getBrightnessParams(particle);

            particle.onTick(params, now, delta);

        }
        settings.stats && stats.end();
    });
})();