import {ParticleContainer} from "pixi.js";
import {settings} from "../settings.js";
import {SandParticle} from "./sand-particle.js";
import {app} from "../main.js";

export class SandFactory extends ParticleContainer {
    constructor(){
        super({
            dynamicProperties: {
                position: true,  // Update positions each frame
                rotation: false,  // Update rotations each frame
                vertex: false,   // Static vertices
                uvs: false,     // Static texture coordinates
                color: true     // Static colors
            }
        })

        this.eventMode = 'none';
        this.interactiveChildren = false;
        app.stage.addChild(this);

        this.particles = Array.from({length: settings.particleCount}, () => new SandParticle(this));

        window.addEventListener('particleCountChanged', e => this.onParticleCountChanged(e))

        window.addEventListener('colorChanged', (e) => {
            this.particles.forEach(p => p.tint = e.detail.color);
        })
    }

    onParticleCountChanged(e){
        const targetCount = e.detail;
        const diff = targetCount - this.particles.length;

        if (diff > 0) {
            for (let i = 0; i < diff; i++) this.particles.push(new SandParticle(this));
        } else if (diff < 0) {

            this.particles.length = targetCount;
            this.removeParticles(targetCount);
        }

    }

    getParticle(i){
        return this.particles[i];
    }
}