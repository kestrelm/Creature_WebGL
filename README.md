# Creature-Runtimes

For more information on how to use the runtimes, please head over to this [site](http://www.kestrelmoon.com/creaturedocs/Game_Engine_Runtimes_And_Integration/Runtimes_Introduction.html)

The **Ice Demon** character sample Artwork is by: **Katarzyna Zalecka [http://kasia88.deviantart.com], Attribution-ShareAlike 3.0 Unported**

Download the samples and more **[here](http://www.kestrelmoon.com/creaturedocs/Animation_Samples_And_Examples/Samples_And_Videos.html)**.

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/babylonjs.png)
Live Babylon JS Demo is **[here](http://creature.kestrelmoon.com/WebDemo/Babylon-Demo.html)**.

## FAQ

### My character mesh in BabylonJS flickers/disappears
This is a BabylyJS renderer issue and has to do with the bounding box of the character. You can try setting **mesh.alwaysSelectAsActiveMesh = true**. Or refresh the mesh data and bounding box each frame. Please read the thread [here](https://github.com/kestrelm/Creature_WebGL/issues/10)

## Live Raptor Mark Demo

**Raptor Mark** is a demonstration of what the **Creature WebGL** plugin is capable of. 

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/logo1.png)

### Regular JS Demo

This demo shows **30 fully mesh deforming raptor characters** running across the screen. This demo is using the **CreaturePack Web** format to deliver results that have high performance, great quality and yet compact in delivery size.

**UtahRaptor Artwork**: Emily Willoughby (http://emilywilloughby.com) 

View the Live demo **[here](http://www.kestrelmoon.com/creature/WebDemo/raptor_mark.html)** .

### WebAssembly Demo

Unleash the power of high performance **Web Assembly** with the new **CreaturePack WebAssembly** runtimes!

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/babylonPack.png)
The above demo uses advanced **Delta Compression** in CreaturePack to deliver high performance + quality animation with extreme compression ratios! This Raptor animation is **only 230KB in size**!

View the Live CreaturePack BabylonJS WebAssembly demo **[here](https://creature.kestrelmoon.com/WebDemo/wasm/BabylonPack-Demo.html)** 


This second demo shows **200 (Not a Typo!!) mesh deforming raptor dinosaurs** running across the screen! The demo is using the **CreaturePack Web** format similar to the JS version to deliver results that have high performance, great quality and yet compact in delivery size. However, with the new **Web Assembly** backend, the playback is even faster, capable of handling huge numbers of characters running live on your web browser. Even on moderately equipped PCs, this demo runs at a fluid 60 FPS. Make sure your browser has been updated to the latest version to take advantage of this exciting runtime.

View the Live CreaturePack WebAsseambly demo **[here](https://creature.kestrelmoon.com/WebDemo/wasm/PixiJS-WASM-Pack-MultiDemo.html)** :)

Read the writeup on the WebAssembly runtime **[here](<https://medium.com/@kestrelm/creaturepack-high-performance-2d-webgl-character-animation-with-webassembly-72c436bec86c>)**

### Share your animations easily with the CreaturePack WebAssembly Widget

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/packPlayer.png)

The **CreaturePack WebAssembly Widget** allows you to easily share your exported Creature animations on your own personal webpage! The rendering core uses the powerful [**BabylonJS 3D WebGL Engine**](https://www.babylonjs.com/). This allows for beautiful rendering effects, including high quality soft-shadows and real-time 3D lighting. Head over to the **WebAssembly** folder for more info [**here**](https://github.com/kestrelm/Creature_WebGL/tree/master/wasm).
