export class Fullscreen {
    constructor() {

        this.initFullScreen();

    }

    checkHasFullscreenApi(){
        return !document.fullscreenEnabled || document?.documentElement?.requestFullscreen;
    }

    initFullScreen(){
        if(!this.checkHasFullscreenApi()) return;

        document.addEventListener('touchend', async function onFullscreen(e) {
            try {
                await document.documentElement.requestFullscreen();
            } finally {
                document.removeEventListener('touchstart', onFullscreen);
            }
        }, {passive: true, once: true})
    }
}