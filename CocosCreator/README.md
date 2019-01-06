# CreaturePack for Cocos Creator

This folder contains files for running **CreaturePack** in **Cocos Creator**. This enables you to publish games with the **Creature Animation Tool** for the various HTML5 and Native Mobile platforms Cocos Creator supports. The CreatorePack plugin is also [**Wechat Mini Game Engine**](https://developers.weixin.qq.com/minigame/en/introduction/) ready. 

![Alt text](https://raw.githubusercontent.com/kestrelm/Creature_WebGL/master/CocosCreator/cocos_creator1.png)

## Overview

This is a sample to show you how to load and run your CreaturePack characters in CocosCreator.

## Installation

Please drag/copy all the **js** files in this repository into your Cocos Creator project. Make sure the relevant **meta** files are created for the plugin script files to be recognized by the system. Also make sure the character atlas image files as well as converted to text CreaturePack assets + MetaData files are in the **resources** folder of your project.

## Usage

### Convert your Creature Pack assets to b64 Text Encoding

**This is very important!** Please either do this yourself or run the provided b64Encode.py in the main WebGL runtimes directory.

``Usage: python b64Encode.py <yourCreaturePack.creature_pack> <outputFile.txt>``

So for example if you have a **Creature Pack** file asset called **myCharacter.creature_pack**, you will run:

``python b64Encode.py myCharacter.creature_pack myCharacter.creature_pack.txt``

You will need **python3** installed for the conversion script to run. Please make sure the converted file has the **.txt** extension so that Cocos Creator can recognize it.

### MetaData renamed to JSON extension

To make your metaData recognizable by Cocos Creator, also rename your **MetaData** file to a file with a **.json** extension.

### Setup and Run

Now go into Cocos Creator:

( First, make sure all your assets are in the resource folder of your game project )

1. Create an Empty Node in your Cocos Creator scene

2. Drag this CreaturePackDraw as as component into your node 

![Alt text](https://raw.githubusercontent.com/kestrelm/Creature_WebGL/master/CocosCreator/cocos_creator2.png)

3. Assign the CreaturePack b64 encoded text asset into the **Creature Pack Asset** slot

4. Assign your character atlas png file to the **Char Texture** slot

5. Optionally, assign the meta data ( please rename with a .json extension ) to the **Meta Data Asset** slot if you want SkinSwapping

## Scripting Details

### Controlling the character ( Animation Switching, Skin Swaps etc. )

**CreaturePackDraw.j** is the file that contains most of the important object handles to controlling your character. In particular, there is the following object in the main class:

``this._packRenderer``

This is a **creaturepack.CreatureHaxeBaseRenderer** which allows you to perform most animation game related operations on your character.

### Switching Animations

To switch to an animation directly, call:

``this._packRenderer.setActiveAnimation("MyNewAnimation");``

To switch with blending, call:

``this._packRenderer.blendToAnimation("MyNewAnimation", blendDelta);``

where **blendDelta** is 0 < value < 1.0 . We recommend a value of 0.1 to get started.

### SkinSwap

You can directly call **CreaturePackDraw**'s method:

``switchToSkin("MyNewSwap");``

to switch to a new available skinSwap. Take note you will need to have your metaData slot connected for skinSwapping to work.

### Changing Mesh Region Colors

You can dynamically set and change mesh region colors via:

``setMeshColorOverride("MyMeshRegion", 0.5, 0, 0, 1.0);``

This will change your mesh region called **MyMeshRegion** with RGBA values of (0.5, 0, 0, 1.0). Take note the value ranges are from 0 to 1.0.

### Character Scaling Size Implmentation

Pay attention to the **onLoad()** method where we load our characters into the game. You can alter how the character is scaled with respect to your width/height settings by taking a look at the charScale variable in **_updateVertexData()** and seeing how it is applied.

## Publishing CreaturePack for the Wechat Mini Game Platform

This plugin is ready for the **Wechat Mini Game Platform**. Once setup, please follow the instructions outlined [here](https://docs.cocos2d-x.org/creator/manual/en/publish/publish-wechatgame.html) to publish for that platform.

    