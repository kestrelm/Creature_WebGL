# Creature Construct 2 Plugin

This document is about the [Creature](http://creature.kestrelmoon.com) runtime for [Construct 2](https://www.scirra.com/construct2). Please check out the sample demo in the 
**demo** directory for more information.

![alt text](https://raw.githubusercontent.com/kestrelm/Creature_WebGL/master/Construct2/pic2.png "Image2")

Watch the Demo video [here](https://youtu.be/btMsOebcwrA).

### Installation

1. Close Construct 2

2. Copy the plugin's folder ( **creature2d** ) to **(your construct 2 install path)\exporters\html5\plugins**. You'll see each plugin has its own folder here, so to add a new plugin create a new folder ( **creature2d** ) and add the plugin's files inside it. 

3. Launch Construct 2 and the plugin or behavior should be available from the editor.

### Requirements

1. Exported Creature JSON

2. Exported Creature Meta Data ( for Skin/Item Swapping)

3. Exported Creature character PNG Image Texture Atlas

![alt text](https://raw.githubusercontent.com/kestrelm/Creature_WebGL/master/Construct2/pic1.png "Image1")

### Loading in the JSON

First, construct a new **AJAX** request to load in the JSON file. Tag it with an identifier you can recognize easily. Then, add an **AJAX** event completed on the tag. In the completion event, call the **Load Json()** function on your **Creature2D** object with **AJAX.LastData** as the entry ( this loads the most recently requested JSON file )

By default, when you play the game, you should already see the character playing its default animation.

### Switching/Blending into Animations

You have 2 options, either call **Switch Animation()** with a target animation name OR call **Blend to Animation()** with a target animation name and a blend delta factor. Blend delta factor is a value > 0 and < 1. The larger the value, the faster the current animation blends into the target animation. 

### Setting Animation Playback Speed

Set the animation playback speed in terms of sampling rate by calling **Set Animation Speed**. The typical values are 60 ( 60 fps ) but you can lower it down to 30 if you want. Note that this still ensures smooth playback throughout as key poses are still interpolated during runtime.

### Controlling Animation Looping

Enable/disable animation playback looping by calling **Set Animation Loop()** with a value of either 0 ( no loop ) or 1 ( looping ).

### Flipping your character along X or Y Axis

If you want to easily flip your character in either X or Y Axis ( for directional changes ), just call **Set Animation Axis Flip()**. You can flip either axis, with the value for each axis being either -1 or 1.

### Anchor Points

You can enable anchor points by calling **Set Anchor Points Active()**. Anchor points are defined in the Creature Animation Editor for each character.

### Performance Point Caching

To skip the posing engine completely, you can activate **Point Caching** by calling **Make Point Cache()** with the target animation name. This allows you to have very high performance playback with minimal computation at runtime.

### Skin/Item Swapping

You can also use **Skin Swapping** to swap out items, clothing, hairstyles etc. on your characters. First, you need to use the typical **AJAX** request/completion procedure to load your **Creature MetaData JSON**. After that, you can easily enable **Skin Swapping** by calling **SkinSwap()** with the target **Skin Swap** name. You can disable **Skin Swapping** by calling **Disable SkinSwap()**

