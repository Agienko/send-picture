import {Application} from "pixi.js";
import {settings} from "../settings.js";


export class App extends Application{
    constructor(){
        super();
    }
    async init(){
        await super.init({
            preference: settings.renderer,
            resizeTo: window,
            antialias: false,
            autoDensity: true,
            resolution: 1,
            backgroundColor: settings.bgColor
        });
        this.canvas.style.webkitUserSelect = 'none';
        this.canvas.style.userSelect = 'none';
        this.canvas.style.webkitTouchCallout = 'none';
        this.canvas.style.touchAction = 'none';

        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
        });


        window.addEventListener('bgColorChanged', (e) => {
            const color = e.detail.color;
            document.body.style.backgroundColor = settings.bgColor;
            this.renderer.background.color = color;
        })

        this.stage.eventMode = 'static';
        this.stage.interactiveChildren = false;
        document.body.appendChild(this.canvas);
    }
}