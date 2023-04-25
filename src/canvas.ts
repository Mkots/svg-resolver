import {sendDataToIME} from "./api";

type CurrentShape = [Array<number>, Array<number>, Array<number>];
type Shapes = Array<CurrentShape>;
export type ResolvedImages = Array<{name: string, confidence: string, url: string, url_variant_1: string, url_variant_2: string}>;
export type DisplaySuggestionsFunction = (suggestions: ResolvedImages | undefined) => void;
export class CanvasHandler{
    public pressed: boolean;
    public pressedAt: number;
    public drawingInterval: any;
    public intervalLastPosition: number[];
    public shapes: Shapes;
    public currentShape: CurrentShape;
    public prevX: number;
    public currX: number;
    public prevY: number;
    public currY: number;
    public dColor: string;
    public dColorStartingPoint: string;
    public dStroke: number;
    public highlightStartPoint: boolean;
    public canvas: HTMLCanvasElement | null;
    public ctx: CanvasRenderingContext2D | null;
    public resolvedImages: ResolvedImages | undefined;
    public displaySuggestionsFunction: DisplaySuggestionsFunction;

    
    constructor(displaySuggestionsFunction: DisplaySuggestionsFunction){
        this.pressed = false;
        this.pressedAt = 0;
        this.drawingInterval = null;
        this.intervalLastPosition = [-1,-1];
        this.shapes = [];
        this.currentShape = [[],[],[]];
        this.prevX = 0;
        this.currX = 0;
        this.prevY = 0;
        this.currY = 0;
        this.highlightStartPoint = false;
        this.dColor = "black"
        this.dColorStartingPoint = "black"
        this.dStroke = 8;
        this.resolvedImages = undefined;
        this.displaySuggestionsFunction = displaySuggestionsFunction;

        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");
    }

    init(){
        this.canvas?.addEventListener("mousemove", (e) => {
            this.drawXY("move", e)
        }, false);
        this.canvas?.addEventListener("mousedown", (e) => {
            this.drawXY("down", e)
        }, false);
        this.canvas?.addEventListener("mouseup", (e) => {
            this.drawXY("up", e)
        }, false);
        this.canvas?.addEventListener("mouseout", (e) => {
            this.drawXY("out", e)
        }, false);
    }

    prepareNewShape() {
        this.currentShape = [
            [], // x coordinates
            [], // y coordinates
            [] // timestamps
        ]
    }

    drawXY(res: "down" | "up" | "move" | "out", e: MouseEvent) {
        if(!this.canvas || !this.ctx) return;
        if (res == "down") {
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = e.clientX - this.canvas.offsetLeft;
            this.currY = e.clientY - this.canvas.offsetTop;

            this.pressed = true;
            this.pressedAt = Date.now();
            this.highlightStartPoint = true;

            this.prepareNewShape();
            this.drawingInterval = setInterval(this.drawingShape.bind(this),9); // stores coordinates every 9ms

            if (this.highlightStartPoint) {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.dColorStartingPoint;
                this.ctx.fillRect(this.currX, this.currY, 2, 2);
                this.ctx.closePath();
                this.highlightStartPoint = false;
            }
        }
        if (res == "up" || (this.pressed && res == "out")) {
            this.pressed = false;
            void this.commitCurrentShape();
        }
        if (res == "move") {
            if (this.pressed) {
                this.prevX = this.currX;
                this.prevY = this.currY;
                this.currX = e.clientX - this.canvas.offsetLeft;
                this.currY = e.clientY - this.canvas.offsetTop;
                this.draw();
            }
        }
    }

    addPointToCurrentShape(x: number, y: number){
        if(!this.currentShape) this.currentShape = [[],[], []]
        this.currentShape[0].push(x);
        this.currentShape[1].push(y);
        this.currentShape[2].push(Date.now() - this.pressedAt);
    }

    drawingShape() {
        if (!(this.intervalLastPosition[0] == this.prevX && this.intervalLastPosition[1] == this.prevY)) {
            this.addPointToCurrentShape(this.prevX, this.prevY);
            this.intervalLastPosition = [this.prevX, this.prevY];
        }
    }

    draw() {
        if(!this.canvas || !this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(this.currX, this.currY);
        this.ctx.strokeStyle = this.dColor;
        this.ctx.fillStyle = this.dColor;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = this.dStroke;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    async commitCurrentShape() {
        clearInterval(this.drawingInterval);
        this.shapes.push(this.currentShape);
        this.resolvedImages = await sendDataToIME(this.shapes);
        this.displaySuggestionsFunction(this.resolvedImages)
    }

    erase() {
        if(!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas?.width, this.canvas?.height);
        (document.getElementById("canval") as HTMLTextAreaElement).value = "";
        this.shapes = [];
    }

    save() {
        if(!this.canvas) return;
        const dataURL = this.canvas.toDataURL();
        (document.getElementById("canval") as HTMLTextAreaElement).value = dataURL;
    }
    
}