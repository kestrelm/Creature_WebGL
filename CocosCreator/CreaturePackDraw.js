// This is a sample to show you how to load and run your CreaturePack characters
// in CocosCreator
// In particular, pay attention to the onLoad() method where we load our characters
// into the game.
// You can alter how the character is scaled with respect to your width/height settings
// by taking a look at the charScale variable in _updateVertexData() and seeing how it is
// applied

// To Use:
// Take note that this sample loads the fox character dynamically in the code. Change
// it to fit your own requirements
// 1. Create an Empty Node in your Cocos Creator scene
// 2. Drag this CreaturePackDraw as as component into your node 
// 3. Run your game.

let creaturepack = require('./CreaturePackModule');
let assembler = require('./CreaturePackDrawAssembler');
let renderEngine;
let gfx;
let math;
let _currMat;

var arrayBufferHandler = function (item, callback) {
    var url = item.url;
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (oEvent) {
        var arrayBuffer = xhr.response;
        if (arrayBuffer) {
            var result = new Uint8Array(arrayBuffer);
            callback(null, result);
        }
        else {
            callback(errorMessage);
        }
    }

    xhr.send(null);
};

cc.loader.addDownloadHandlers({
    'array_buffer': arrayBufferHandler
});

cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
    renderEngine = cc.renderer.renderEngine;
    gfx = renderEngine.gfx;
    math = renderEngine.math;

    _currMat = math.mat4.create();
})

let CreaturePackDraw = cc.Class({
    extends: cc.RenderComponent,

    properties: {
        blColor: cc.Color,
        brColor: cc.Color,
        tlColor: cc.Color,
        trColor: cc.Color,
    },

    _updateVertexData (matrix) {
        if(this._packRenderer == null)
        {
            return;
        }

        // This code uses the node's anchor points as a reference
        let verts = this._vData,
            uintV = this._uintVData;
        let w = this.node.width,
            h = this.node.height,
            appx = w * this.node.anchorX,
            appy = h * this.node.anchorY;
        let a = matrix.m00, b = matrix.m01, c = matrix.m04, d = matrix.m05,
            tx = matrix.m12, ty = matrix.m13;

        let x, y = 0;
        let j = 0;

        // Scale the character based on its extents
        // takking into account its original dimensions and your node dimensions
        // If you do not want proportional scaling, you should take a look at the
        // charRatio variable and not use it in the calculations for baseX and baseY
        let charScale = 2;
        let charWidth = (this._maxX - this._minX);
        let charHeight = (this._maxY - this._minY);
        let charRatio = charHeight / charWidth;

        let midX = charWidth * 0.5;
        let midY = charHeight * 0.5;

        let curColor = cc.Color.WHITE;

        for(var i = 0; i < this._packRenderer.render_points.length; i+=2)
        {
            let baseX = (this._packRenderer.render_points[i] + midX) / charWidth * w * charScale;
            let baseY = (this._packRenderer.render_points[i + 1] + midY) / charHeight * charRatio * w * charScale;

            x = -appx + baseX;
            y = -appy + baseY;

            var finalX = x * a + y * c + tx;
            var finalY = x * b + y * d + ty;
            verts[j++] = finalX;
            verts[j++] = finalY;

            verts[j++] = this._packRenderer.render_uvs[i];
            verts[j++] = this._packRenderer.render_uvs[i + 1];

            uintV[j++] = curColor._val;
        }        

        this._vb.update(0, verts);
    },    

    _updateDefaultVertexData (matrix) {
        // NOTE:
        // This always needs to be called, not sure why.
        // For some reason, Cocos Creator will not render the vertices ( maybe the VBOs are not create ?)
        // If you do not explicitly force an update on the VBO structure every frame
        // regardless if your VBOs have been constructed or not.
        // It will throw an error on the first update since the VBO is not available but
        // it seems to be fine after that and does not affect the final result
        let verts = this._vData,
            uintV = this._uintVData;
        this._vb.update(0, verts);
    },

    _createIA (withPack) {
        let device = cc.renderer.device;
        // Vertex format defines vertex buffer layout: x, y, color
        this._vertexFormat = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true }
        ]);

        if(withPack)
        {
            // Read in the data for the character from CreaturePack
            this._vData = new Float32Array((2 + 2 + 1) * (this._packRenderer.render_points.length / 2));
            this._uintVData = new Uint32Array(this._vData.buffer);
            this._iData = new Uint16Array(this._packData.indices.length);

            for(var i = 0; i < this._packData.indices.length; i+=3)
            {
                this._iData[i] = this._packData.indices[i];
                this._iData[i + 1] = this._packData.indices[i + 1];
                this._iData[i + 2] = this._packData.indices[i + 2];
            }    

            this._minX = this._packData.points[0];
            this._maxX = this._packData.points[0];

            this._minY = this._packData.points[1];
            this._maxY = this._packData.points[1];

            for(var i = 0; i < this._packData.points.length; i+=2)
            {
                this._minX = Math.min(this._minX, this._packData.points[i]);
                this._minY = Math.min(this._minY, this._packData.points[i + 1]);

                this._maxX = Math.max(this._maxX, this._packData.points[i]);
                this._maxY = Math.max(this._maxY, this._packData.points[i + 1]);
            }
            
            this._vb = new gfx.VertexBuffer(
                device,
                this._vertexFormat,
                gfx.USAGE_DYNAMIC,
                // array buffer with real data
                null,
                // vertex count
                this._packRenderer.render_points.length / 2
            );

            this._ib = new gfx.IndexBuffer(
                device,
                gfx.INDEX_FMT_UINT16,
                gfx.USAGE_STATIC,
                this._iData,
                // index count
                this._iData.length
            );
        }
        else {
            // Default dummy rectangle
            let maxVerts = 4;
            this._vData = new Float32Array(maxVerts * 3);
            this._uintVData = new Uint32Array(this._vData.buffer);
            this._iData = new Uint16Array([0, 1, 2, 1, 3, 2]);

            this._vb = new gfx.VertexBuffer(
                device,
                this._vertexFormat,
                gfx.USAGE_DYNAMIC,
                // array buffer with real data
                null,
                // vertex count
                maxVerts
            );


            this._ib = new gfx.IndexBuffer(
                device,
                gfx.INDEX_FMT_UINT16,
                gfx.USAGE_STATIC,
                this._iData,
                // index count
                this._iData.length
            );

            return;
        }


        this.node.getWorldMatrix(_currMat);
        this._updateVertexData(_currMat);

        this._ia = new renderEngine.InputAssembler();
        this._ia._vertexBuffer = this._vb;
        this._ia._indexBuffer = this._ib;
        this._ia._start = 0;
        this._ia._count = this._iData.length;

        this._bufferInit = true;
    },

    onEnable () {
        this._super();

        this.node._renderFlag &= ~cc.RenderFlow.FLAG_RENDER;
        this.node._renderFlag |= cc.RenderFlow.FLAG_CUSTOM_IA_RENDER;
    },

    updatePackRenderData (timestep) {
        if(this._packRenderer == null)
        {
            return;
        }

        this._packRenderer.stepTime(timestep);
        this._packRenderer.syncRenderData();
    },    

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this._material = new renderEngine.SpriteMaterial();
        this._material.useTexture = true;
        this._material.useColor = false;

        this._packData = null;
        this._packRenderer = null;
        this._timeStep = 0.8;
        this._bufferInit = false;
        this._minX = null;
        this._minY = null;
        this._maxX = null;
        this._maxY = null;

        // Here we load our assets using the cc.loader methods

        // First load the creature_pack binary
        let cur_url = cc.url.raw("resources/fox2x.creature_pack");
        cc.loader.load({url:cur_url, type:"array_buffer"}, (err, data)=>{ 
            if (err) {
                console.error('cc.loader.loadRes  ' + err.message);
                return;
            }
            
            this._packData =  new creaturepack.CreaturePackLoader(data.buffer);
            this._packRenderer = new creaturepack.CreatureHaxeBaseRenderer(this._packData);

            // Set animation if you want
            this._packRenderer.setActiveAnimation("run");

            // Create VBOs etc.
            this._createIA(true);
            cc.log("Loaded CreaturePack data.");
        });

        // Now load the texture of the character
        let pic_url = cc.url.raw("resources/fox.png");
        cc.loader.load(
            {
                url: pic_url,
                type:"png"
            },
            (err,data)=>
            {
                if (err) {
                    console.error('cc.loader.loadRes  ' + err.message);
                    return;
                }
                
                this._material.texture = data;
                cc.log("Loaded texture.");
            }
        );
    },

    update () {
        this.updatePackRenderData(this._timeStep);
        this.node.getWorldMatrix(_currMat);

        if(this._packRenderer == null)
        {
            this._updateDefaultVertexData(_currMat);
        }
        else {
            this._updateVertexData(_currMat);
        }
    }
});

CreaturePackDraw._assembler = assembler;

module.exports = CreaturePackDraw;