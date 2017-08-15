"use strict";

var Colors = new Vue({
	el: "#color-bar",
	data: {
		current: "#000000",
		codes: ["#000000","#7B7B7B","#7B0000","#7B7B00","#007B00","#007B7B","#00007B","#7B017B","#7B7B39","#003939","#007BFF","#00397B","#3900FF","#7B3900","#FFFFFF","#BDBDBD","#FF0000","#FFFF02","#00FF02","#01FFFF","#0000FF","#FF00FF","#FFFF7B","#00FF7B","#7BFFFF","#7B7BFE","#FF007B","#FF7B39"]
	}
});

var Canvas = new Vue({
	el: "#canvases",
	data: {
		offsetX: 0,
		offsetY: 0,
		width: 500,
		height: 500,
		canvas: null,
		shadowCanvas: null,
		ctx: null,
		shadowCtx: null,
		isHiRes: (window.devicePixelRatio || 0) > 1,
		raf: (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame).bind(window)
	},
	methods: {
		draw: function(drawingMethod) {
			this.raf(drawingMethod);
		},
		scale: function(value) {
			return this.isHiRes ? value * 2 : value;
		},
		trim: function(value, x) {
			return x ? value - this.offsetX : value - this.offsetY;
		},
		copy: function() {
			this.ctx.drawImage(this.shadowCanvas, 0, 0);
			this.clear();
		},
		clear: function() {
			this.shadowCtx.clearRect(0,0,this.width,this.height);
		}
	},
	mounted: function() {

		this.canvas = this.$el.children[0];
		this.shadowCanvas = this.$el.children[1];
		this.ctx = this.canvas.getContext("2d");
		this.shadowCtx = this.shadowCanvas.getContext("2d");
		this.offsetX = this.canvas.offsetLeft;
		this.offsetY = this.canvas.offsetTop;
		this.ctx.fillRect(10,10,20,20);
	}
});



var PencilTool = new Vue({
	el: "#painttool",
	data: {
		name: "Pencil",
		size: 10,
		hasMouseDown: false
	},
	methods: {
		beginDraw: function(e) {
			console.log("Pencil beginDraw")
			Canvas.shadowCtx.fillStyle = Colors.current;
			this.hasMouseDown = true;
			e.preventDefault();
			this.draw(e);
		},
		draw: function(e) {
			e.preventDefault();
			if(!this.hasMouseDown) return;

			var self = this;
			Canvas.draw(function() {
				Canvas.shadowCtx.fillRect(
					Canvas.scale(Canvas.trim(e.pageX, true)),
					Canvas.scale(Canvas.trim(e.pageY, false)),
					Canvas.scale(self.size),
					Canvas.scale(self.size)
				);
			});
		},
		stopDraw: function(e) {
			e.preventDefault();
			Canvas.copy();
			this.hasMouseDown = false;
		},
		activate: function() {
			console.log("Pencil tool activated");
			Canvas.ctx.fillRect(50, 50, 10, 10);
			window.addEventListener("mousedown", this.beginDraw.bind(this));
			window.addEventListener("mousemove", this.draw.bind(this));
			window.addEventListener("mouseup", this.stopDraw.bind(this));
		},
		deactivate: function() {
			console.log("Pencil deactivated");
			window.removeEventListener("mousedown", this.beginDraw.bind(this));
			window.removeEventListener("mousemove", this.draw.bind(this));
			window.removeEventListener("mouseup", this.stopDraw.bind(this));
		}
	}
});

var EraseTool = new Vue({
	el: "#erasetool",
	methods: {
		beginDraw: function() {
			Canvas.shadowCtx.fillStyle = "#ffffff";
			this.hasMouseDown = true;
		}
	}
});

//EraseTool.extend(PencilTool);


var RectangleTool = new Vue({
	el: "#rectangle-tool",
	data: {
		name: "Rectangle",
		lineWidth: 10,
		startX: 0,
		startY: 0
	},
	methods: {
		beginDraw: function(e) {
			e.preventDefault();
			Canvas.shadowCtx.fillStyle = "transparent";
			Canvas.shadowCtx.strokeStyle = Colors.current;
			Canvas.shadowCtx.lineWidth = RectangleTool.lineWidth;
			RectangleTool.startX = Canvas.scale(Canvas.trim(e.pageX, true));
			RectangleTool.startY = Canvas.scale(Canvas.trim(e.pageY, false));
			window.addEventListener("mousemove", RectangleTool.draw);
			window.addEventListener("mouseup", RectangleTool.stopDraw);
			RectangleTool.draw(e);
		},
		draw: function(e) {
			e.preventDefault();
			Canvas.draw(function() {
				Canvas.clear()
				Canvas.shadowCtx.strokeRect(
					RectangleTool.startX,
					RectangleTool.startY,
					Canvas.scale(Canvas.trim(e.pageX, true)) - RectangleTool.startX,
					Canvas.scale(Canvas.trim(e.pageY, false)) - RectangleTool.startY
				);
			});
		},
		stopDraw: function(e) {
			e.preventDefault();
			Canvas.copy();
			window.removeEventListener("mousemove", RectangleTool.draw);
		},
		activate: function() {
			console.log("Rectangle activated");
			Canvas.ctx.lineWidth = this.lineWidth;
			Canvas.ctx.strokeRect(50,20,32,62);
			window.addEventListener("mousedown", RectangleTool.beginDraw);
		},
		deactivate: function() {
			console.log("Rectangle deactivated");
			window.removeEventListener("mousedown", RectangleTool.beginDraw);
			window.removeEventListener("mousemove", RectangleTool.draw);
			window.removeEventListener("mouseup", RectangleTool.stopDraw);
		}
	}
});

var EllipseTool = new Vue({
	el: "#ellipse-tool",
	data: {
		name: "Ellipse",
		lineWidth: 10,
		startX: 0,
		startY: 0
	},
	methods: {
		beginDraw: function(e) {
			e.preventDefault();
			Canvas.shadowCtx.fillStyle = "transparent";
			Canvas.shadowCtx.strokeStyle = Colors.current;
			Canvas.shadowCtx.lineWidth = EllipseTool.lineWidth;

			EllipseTool.startX = Canvas.scale(Canvas.trim(e.pageX, true));
			EllipseTool.startY = Canvas.scale(Canvas.trim(e.pageY, false));

			window.addEventListener("mousemove", EllipseTool.draw);
			window.addEventListener("mouseup", EllipseTool.stopDraw);
			EllipseTool.draw(e);
		},
		draw: function(e) {
			e.preventDefault();
			var currX = Canvas.scale(Canvas.trim(e.pageX, true)),
				currY = Canvas.scale(Canvas.trim(e.pageY, false)),
				height = currY - EllipseTool.startY,
				width = currX - EllipseTool.startX,
				centerX = width / 2 + EllipseTool.startX,
				centerY = height / 2 + EllipseTool.startY;

			Canvas.draw(function() {
				Canvas.clear();
				// http://www.williammalone.com/briefs/how-to-draw-ellipse-html5-canvas/
				Canvas.shadowCtx.beginPath();
				Canvas.shadowCtx.moveTo(centerX, centerY - height/2); // A1
				Canvas.shadowCtx.bezierCurveTo(
				centerX + width/2, centerY - height/2, // C1
				centerX + width/2, centerY + height/2, // C2
				centerX, centerY + height/2); // A2
				Canvas.shadowCtx.bezierCurveTo(
				centerX - width/2, centerY + height/2, // C3
				centerX - width/2, centerY - height/2, // C4
				centerX, centerY - height/2); // A1

				Canvas.shadowCtx.stroke();
				Canvas.shadowCtx.closePath();
			});
		},
		stopDraw: function(e) {
			e.preventDefault();
			Canvas.copy();
			window.removeEventListener("mousemove", EllipseTool.draw);
		},
		activate: function() {
			console.log("Ellipse activated");
			window.addEventListener("mousedown", EllipseTool.beginDraw);
		},
		deactivate: function() {
			console.log("Ellipse deactivated");
			window.removeEventListener("mousedown", EllipseTool.beginDraw);
			window.removeEventListener("mousemove", EllipseTool.draw);
			window.addEventListener("mouseup", EllipseTool.stopDraw);
		}
	}
});

// Erase
// Fill
// Line
// Curve
// Brush
// Spray
//


var Tools = new Vue({
	el: "#paint-tools",
	data: {
		currentToolName: PencilTool,
		tools: {
			"PencilTool": PencilTool,
			"EraseTool": EraseTool,
			"EllipseTool": EllipseTool,
			"RectangleTool": RectangleTool
		}
	},
	computed: {
		currentTool: function() {
			console.log("currentTool", this.currentToolName)
			return this.tools[this.currentToolName];
		}
	},
	methods: {
		changeTool: function(tool) {
			console.log("Changetool", tool)
			this.currentTool.deactivate();
			this.currentToolName = tool;
			this.currentTool.activate();
		}
	},
	mounted: function() {
		console.log("Tools mounted");
		this.currentToolName = "PencilTool";
		this.currentTool.activate();
	}
});