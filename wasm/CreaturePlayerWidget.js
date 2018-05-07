/******************************************************************************
 * Creature Runtimes License
 * 
 * Copyright (c) 2015, Kestrel Moon Studios
 * All rights reserved.
 * 
 * Preamble: This Agreement governs the relationship between Licensee and Kestrel Moon Studios(Hereinafter: Licensor).
 * This Agreement sets the terms, rights, restrictions and obligations on using [Creature Runtimes] (hereinafter: The Software) created and owned by Licensor,
 * as detailed herein:
 * License Grant: Licensor hereby grants Licensee a Sublicensable, Non-assignable & non-transferable, Commercial, Royalty free,
 * Including the rights to create but not distribute derivative works, Non-exclusive license, all with accordance with the terms set forth and
 * other legal restrictions set forth in 3rd party software used while running Software.
 * Limited: Licensee may use Software for the purpose of:
 * Running Software on Licensee’s Website[s] and Server[s];
 * Allowing 3rd Parties to run Software on Licensee’s Website[s] and Server[s];
 * Publishing Software’s output to Licensee and 3rd Parties;
 * Distribute verbatim copies of Software’s output (including compiled binaries);
 * Modify Software to suit Licensee’s needs and specifications.
 * Binary Restricted: Licensee may sublicense Software as a part of a larger work containing more than Software,
 * distributed solely in Object or Binary form under a personal, non-sublicensable, limited license. Such redistribution shall be limited to unlimited codebases.
 * Non Assignable & Non-Transferable: Licensee may not assign or transfer his rights and duties under this license.
 * Commercial, Royalty Free: Licensee may use Software for any purpose, including paid-services, without any royalties
 * Including the Right to Create Derivative Works: Licensee may create derivative works based on Software, 
 * including amending Software’s source code, modifying it, integrating it into a larger work or removing portions of Software, 
 * as long as no distribution of the derivative works is made
 * 
 * THE RUNTIMES IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE RUNTIMES OR THE USE OR OTHER DEALINGS IN THE
 * RUNTIMES.
 *****************************************************************************/

 // CreaturePlayerWidget
function CreaturePlayerWidget(
    window, // webpage window object
    canvas, // the canvas object to start the rendering session
    charAssetPath, // path to your CreaturePack Asset
    charImgPath,  // path to your character texture atlas png
    wasmModule, // the CreaturePack WASM Module object
    startAnim="", // If not empty, will use the specified animation starting out
    showPlayer=true, // Show the player widget object
    camPosZ=-40, // Camera Z position
    groundPlaneOn=true, // Shows ground plane or not
    groundPlaneZ=-11, // Ground plane Z position
    shadowsOn=true, // Does character cast shadows
    bgColor=new BABYLON.Color3(0, 0, 0), // Background color
    readyCB=null, // An optional callback function that is triggered when this widget is finished loading
    playOnStart=true, // Whether the animation plays when the widget is loaded
    offsetPos=new BABYLON.Vector3(0,0,0) // displacement offset position
)
{
    this.canvas = canvas;
    // Load the BABYLON 3D engine
    this.engine = new BABYLON.Engine(canvas, true);
    this.pack_manager = new wasmModule.PackManager();
    this.readyCB = readyCB;
    this.draw_cntdown = 0;
    this.module = wasmModule;
    this.char_name = charAssetPath;

    // Watch for browser/canvas resize events
    var cur_engine = this.engine;
    window.addEventListener("resize", function () {
        cur_engine.resize();
    }.bind(cur_engine));

    this.loadFile(charAssetPath, function(response, self_ptr) {
        var pack_manager = self_ptr.pack_manager;
        var byte_array = new Uint8Array(response);
        console.log("Loaded CreaturePack Data with size: " + byte_array.byteLength);
        var load_bytes = CreatureWASMUtils.heapBytes(self_ptr.module, byte_array);        
        var pack_loader = pack_manager.addPackLoader(self_ptr.char_name, load_bytes.byteOffset, byte_array.byteLength);
        var engine = self_ptr.engine;
        
        // Now, call the createScene function that you just finished creating
        self_ptr.createScene(
            canvas, 
            engine,
            pack_manager, 
            self_ptr.char_name, 
            charImgPath, 
            showPlayer,
            camPosZ,
            groundPlaneOn,
            groundPlaneZ,
            shadowsOn,
            bgColor,
            playOnStart,
            offsetPos
        );
        
        // Determine starting animation
        var all_anims = pack_manager.getAllAnimNames(self_ptr.creature_renderer.playerId);
        var realStartAnim = all_anims[0];
        if(startAnim != "")
        {
            realStartAnim = startAnim;
        }
        
        if(self_ptr.hasPlayer) {
            self_ptr.animClipBtn.children[0].text = realStartAnim;
        }
        // Set active animation
        pack_manager.setPlayerActiveAnimation(self_ptr.creature_renderer.playerId, realStartAnim);

        // Call ready callback if specified
        if(self_ptr.readyCB)
        {
            self_ptr.readyCB();
        }

        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
            if(self_ptr.playing) {
                self_ptr.pack_manager.stepPlayer(
                    self_ptr.creature_renderer.playerId, 1.0);
            }
            
            if(self_ptr.playing || (self_ptr.draw_cntdown > 0))
            {
                self_ptr.creature_renderer.UpdateData();
                self_ptr.updateControls();    
                self_ptr.scene.render();
                
                if(self_ptr.draw_cntdown > 0)
                {
                    self_ptr.draw_cntdown--;
                }
            }
        }.bind(self_ptr))
    });
}

CreaturePlayerWidget.prototype.loadFile = function (filePath, done) {
    var xhr = new XMLHttpRequest();
    var self_obj = this;
    xhr.onload = function () { return done(this.response, self_obj); };
    xhr.open("GET", filePath, true);
    xhr.responseType = "arraybuffer";
    xhr.send();
};

CreaturePlayerWidget.prototype.updateControls = function()
{
    if(!this.hasPlayer)
    {
        return;
    }

    var curRenderer = this.creature_renderer;
    var curRunTime = curRenderer.GetRuntime();
    var activeAnimName = curRenderer.GetActiveAnimName();
    var curStartTime = curRenderer.GetActiveAnimStartTime();
    var curEndTime = curRenderer.GetActiveAnimEndTime();
    var runtimeFraction = (curRunTime - curStartTime) / (curEndTime - curStartTime);
    var curTimeSlider = this.timeSlider;

    this.frameText.text = curRunTime.toString();
    if(this.playing)
    {
        curTimeSlider.value = runtimeFraction * (curTimeSlider.maximum - curTimeSlider.minimum) + curTimeSlider.minimum;
    }
};

CreaturePlayerWidget.prototype.oneShotDraw = function()
{
    this.draw_cntdown = 30;
}

CreaturePlayerWidget.prototype.createScene = function(
    canvas, 
    engine,
    manager_in, 
    char_name, 
    char_img_path,
    showPlayer,
    camPosZ,
    groundPlaneOn,
    groundPlaneZ,
    shadowsOn,
    bgColor,
    playOnStart,
    offsetPos) 
{
    // Now create a basic Babylon Scene object 
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = bgColor;
    this.scene = scene;
    var self_ptr = this;
    
	// Add ground plane
    if(groundPlaneOn)
    {
		var sourcePlane = new BABYLON.Plane(0, 1, 0, groundPlaneZ);
    	sourcePlane.normalize();
	    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {height:200, width: 150, sourcePlane: sourcePlane, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
		plane.receiveShadows = true;

		var planeMat = new BABYLON.StandardMaterial("planeMaterial", scene);
		planeMat.diffuseColor = new BABYLON.Color3(0.75, 0.75, 0.75);
		planeMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
		planeMat.emissiveColor = new BABYLON.Color3(0.1, .1, .1);
		planeMat.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5);

        plane.material = planeMat;
        this.plane = plane;
	}

    // This creates and positions a free camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(offsetPos.x, offsetPos.y, offsetPos.z), scene);
    this.camera = camera;
    // This targets the camera to scene origin
    camera.setPosition(new BABYLON.Vector3(offsetPos.x, offsetPos.y, camPosZ));
	//camera.attachControl(canvas, true);

    // This creates a light
	var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, 30, -30), scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);
	light.groundColor = new BABYLON.Color3(1, 1, 1);

    // creature
    var creature_texture = new BABYLON.StandardMaterial("creatureTexture", scene);
    creature_texture.diffuseTexture = new BABYLON.Texture(char_img_path, scene);
    creature_texture.diffuseTexture.hasAlpha = true;
    creature_texture.emissiveTexture = new BABYLON.Texture(char_img_path, scene);
	creature_texture.specularColor = new BABYLON.Color3(0, 0, 0);
    creature_texture.backFaceCulling = false;

    var creature_renderer = new CreaturePackBabylonRenderer(
        "CreatureRenderer",
         scene, 
         manager_in, 
         char_name,
         creature_texture);
    this.creature_renderer = creature_renderer;

    // Add shadows
    if(shadowsOn) {
    	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        shadowGenerator.getShadowMap().renderList.push(creature_renderer.renderMesh);
        shadowGenerator.usePercentageCloserFiltering = true;
        this.shadowGenerator = shadowGenerator;
    }

    this.playing = playOnStart;
    // GUI
    if(showPlayer) {
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        this.screenPanel = advancedTexture;
        
        var baseRect = new BABYLON.GUI.Rectangle();
        baseRect.width = "300px";
        baseRect.height = "65px";
        baseRect.cornerRadius = 10;
        baseRect.color = "white";
        baseRect.thickness = 1;
        baseRect.background = new BABYLON.Color4(0, 0.1, 0.3, 0.7).toHexString();
        baseRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        baseRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(baseRect);    

        var panel = new BABYLON.GUI.StackPanel();
        panel.width = "280px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    	baseRect.addControl(panel);		

        var subpanel = new BABYLON.GUI.StackPanel();
        subpanel.width = "280px";
        subpanel.isVertical = false;
        subpanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        subpanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.addControl(subpanel);    

        var animClipBtn = BABYLON.GUI.Button.CreateSimpleButton("clipBtn", "CLIP");
        animClipBtn.width = "215px";
        animClipBtn.height = "25px";
        animClipBtn.color = "white";
        animClipBtn.children[0].fontSize = 15;
        animClipBtn.background = new BABYLON.Color4(0, 0.5, 0.8, 0.5).toHexString();
        animClipBtn.onPointerUpObservable.add(function() {
            pack_manager = self_ptr.pack_manager;
            var all_anims = pack_manager.getAllAnimNames(self_ptr.creature_renderer.playerId);
            var cur_anim = pack_manager.getActiveAnimName(self_ptr.creature_renderer.playerId);
            var anim_idx = 0;
            for(var i = 0; i < all_anims.length; i++)
            {
                if(all_anims[i] == cur_anim)
                {
                    anim_idx = i;
                    break;
                }
            }
            
            anim_idx = (anim_idx + 1) % all_anims.length;
            var new_anim = all_anims[anim_idx];
            pack_manager.setPlayerActiveAnimation(self_ptr.creature_renderer.playerId, new_anim);
            pack_manager.stepPlayer(self_ptr.creature_renderer.playerId, 0.0);
            self_ptr.animClipBtn.children[0].text = new_anim;
            self_ptr.oneShotDraw();
        }.bind(self_ptr));

        subpanel.addControl(animClipBtn);    
        this.animClipBtn = animClipBtn;
            
    	subpanel = new BABYLON.GUI.StackPanel();
    	subpanel.width = "280px";
    	subpanel.isVertical = false;
        subpanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        subpanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    	panel.addControl(subpanel);    
    	
    	var playBtn = BABYLON.GUI.Button.CreateSimpleButton("btn", this.playing ? "⏸️" : "▶️");
        playBtn.width = "25px";
        playBtn.height = "25px";
        playBtn.color = "white";
        playBtn.children[0].fontSize = 25;
        playBtn.background = new BABYLON.Color4(0, 0, 0, 0).toHexString();
        playBtn.onPointerUpObservable.add(function() {
            self_ptr.playing = !self_ptr.playing;
            if(self_ptr.playing)
            {
                self_ptr.playBtn.children[0].text = "⏸️";
            }
            else {
                self_ptr.playBtn.children[0].text = "▶️";
            }
            self_ptr.oneShotDraw();
        }.bind(self_ptr));

        subpanel.addControl(playBtn);     
        this.playBtn = playBtn;

    	var timeSlider = new BABYLON.GUI.Slider();
    	timeSlider.minimum = 0;
        timeSlider.maximum = 100;
    	timeSlider.value = 0;
    	timeSlider.height = "18px";
    	timeSlider.width = "200px";
    	timeSlider.thumbWidth = "15px";
    	timeSlider.isThumbCircle = true;
    	timeSlider.background = new BABYLON.Color3(0.1, 0.42, 0.5).toHexString();
    	timeSlider.color = new BABYLON.Color3(0.1, 0.7, 1).toHexString();
    	timeSlider.borderColor = new BABYLON.Color3(0.1, 0.1, 0.1).toHexString();
    	timeSlider.onValueChangedObservable.add(function(value) {
            if(!self_ptr.playing)
            {
                var curRenderer = self_ptr.creature_renderer;
                var curStartTime = curRenderer.GetActiveAnimStartTime();
                var curEndTime = curRenderer.GetActiveAnimEndTime();
                var curFraction = 
                    (self_ptr.timeSlider.value - self_ptr.timeSlider.minimum) / (self_ptr.timeSlider.maximum - self_ptr.timeSlider.minimum);
                var setVal = Math.round(curFraction * (curEndTime - curStartTime) + curStartTime);
                        
                self_ptr.creature_renderer.SetRuntime(setVal);
                self_ptr.oneShotDraw();
            }
        }.bind(self_ptr));

    	subpanel.addControl(timeSlider);    
        this.timeSlider = timeSlider;

    	var frameText = new BABYLON.GUI.TextBlock();
        frameText.text = "FRAME";
        frameText.width = "50px";
    	frameText.height = "30px";
        frameText.color = new BABYLON.Color3(0.1, 1, 1).toHexString();
    	frameText.fontSize = 20;
        subpanel.addControl(frameText);    
        this.frameText = frameText;   
        
        this.hasPlayer = true;
    }
    else {
        this.hasPlayer = false;
    }

    // Initialise character on first frame
    manager_in.stepPlayer(
        this.creature_renderer.playerId, 0);
    this.creature_renderer.UpdateData();
    this.oneShotDraw();
};