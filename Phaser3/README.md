# CreaturePack Runtimes for Phaser 3

This folder contains the **CreaturePack** high performance + compression runtimes for [Phaser 3](https://phaser.io/phaser3)
You will need to export your animations usint the [Creature Animation Tool](https://creature.kestrelmoon.com/) to use these runtimes.

![Alt text](https://github.com/kestrelm/Creature_WebGL/blob/master/Phaser3/title.png)

## Detailed Writeup

![Alt tet](https://cdn-images-1.medium.com/max/1200/1*lbKI11CHM2W41r6ehl_Z8A.gif)

A full writeup on how author a walking Flamingo animation asset from scratch using this runtime is available [here as well](https://medium.com/@kestrelm/2d-skeletal-animation-in-phaser-3-tutorial-3ed468fb6bd0)

## Usage

Using this runtime is super simple! Take a look at **Phaser3BasicGroup.html** for a quick introduction.

First, you will need to load your **creature pack binary** as well as the character's **texture atlas png**:

```
    function preload ()
    {
        this.load.binary('char', '../fox2x.creature_pack');
        this.load.image('texture', '../fox.png');
    }
```

Now create your **CreaturePack character** and set its scale:
```
        creature_char = this.make.CreaturePackObj({
            byte_data_in: this.cache.binary.get('char'),
            texture_key: 'texture',
            x: 300,
            y: 300
        });
        creature_char.scaleX = 15;
        creature_char.scaleY = 15;
```        

And that's it! You can also do more with your character. To blend the animation, you can:

```
    creature_char.pack_renderer.blendToAnimation("run", 0.03); // ( Animation Clip, Blend Speed from 0 to 1 )
```

You can set the playback speed and more:

```
    creature_char.speed = 0.1
```

Check out **CreaturePackModule.js** for the full API/set of functions you can call to control your character animations.