# CreaturePack Accelerated WebAssembly Module

This folder contains files used for the **CreaturePack Accelerated WebAssembly** playback of Creature exported characters. [**WebAssembly**](http://webassembly.org/) is a web-based technology stack that allows for native code to be compiled and deployed on a web-based platform. This is especially useful for high quality, high performance animation playback. Read the writeup of the implementation **[here](<https://medium.com/@kestrelm/creaturepack-high-performance-2d-webgl-character-animation-with-webassembly-72c436bec86c>)**.

## Share your animations easily with the CreaturePack WebAssembly Widget

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/packPlayer.png)

The **CreaturePack WebAssembly Widget** allows you to easily share your exported Creature animations on your own personal webpage! The rendering core uses the powerful [**BabylonJS 3D WebGL Engine**](https://www.babylonjs.com/). This allows for beautiful rendering effects, including high quality soft-shadows and real-time 3D lighting.

Because the animation engine uses the **CreaturePack WebAssembly Runtime**, users will be able to deliver extremely high quality animation while at the same time benefiting from tiny file sizes and lightning fast playback speeds. The widget includes an optional set of player controls with buttons + slider widgets for changing animations, play/pause + fast-forwarding/reversing through your animation clip.

### Sharing the CreaturePack WebAssembly Widget Animation on your WebPage

1. After you export out your Creature animation ( **Game Engine Export** ), open up your folder and copy over the **CreaturePack** + **Character Image Atlas** files onto your web hosting folder

Here are the files you need: (Copy them from the Github repository into your web hosting folder):

- babylon.js
- babylon.gui.min.js
- CreatureWASMUtils.js
- CreaturePackBabylonWASMRenderer.js
- CreaturePlayerWidget.js
- creaturepack-wasm.js
- creaturepack-wasm.wasm


2. At the top of your webpage, make sure you include the following libraries:

        <script src="babylon.js"></script>
        <script src="babylon.gui.min.js"></script>
        <script src="CreatureWASMUtils.js"></script>        
        <script src="CreaturePackBabylonWASMRenderer.js"></script> 
		<script src="CreaturePlayerWidget.js"></script>      


3. Now define your rendering canvas object in you **style** tag section:

		<style>
			html, body {
			  overflow: hidden;
			  width: 100%;
			  height: 100%;
			  margin: 0;
			  padding: 0;
			}
  
			#renderCanvas {
			  width: 100%;
			  height: 100%;
			  touch-action: none;
			}
		</style>

        <canvas id="renderCanvas"></canvas>

4.  In your main webpage's **script** section, create the **CreaturePlayerWidget**:

	    <!-- This will load the WebAssembly module and run its main. --> 
		<script async type="text/javascript" src="creaturepack-wasm.js"></script>

        <script type="text/javascript">

        var Module = {
            preRun: [],
            postRun: (function() {
    			console.log("Loaded WebAssembly.");
    			var canvas = document.getElementById("renderCanvas");
    			var player_widget = new CreaturePlayerWidget(
    				window,
    				canvas,
    				"myCharacter.creature_pack",
    				"myCharacter.png",
    				Module,
    				"",
    				true,
    				-40,
    				true,
    				-11,
    				true,
    				new BABYLON.Color3(0, 0, 0)
    			);
            })
        };  

        </script>

And that's it! When you open up your webpage in your browser, you should be able to see your character playing back on your browser window.

### Configuration Options for Widget

The **CreaturePlayerWidget** constructor has the following options:

- **window:** webpage window object

- **canvas:** the canvas object to start the rendering session

- **charAssetPath:** path to your CreaturePack Asset

- **charImgPath:** path to your character texture atlas png

- **wasmModule:** the CreaturePack WASM Module object

- **startAnim:** If not empty, will use the specified animation starting out

- **showPlayer:** Show the player controls widget object

- **camPosZ:** Camera Z position

- **groundPlaneOn:** Shows ground plane or not

- **groundPlaneZ:** Ground plane Z position

- **shadowsOn:** Does character cast shadows

- **bgColor:** Background color

- **readyCB** An optional callback function that is triggered when this widget is finished loading

- **playOnStart** Whether the animation plays when the widget is loaded


    