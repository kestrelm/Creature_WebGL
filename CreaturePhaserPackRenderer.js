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

Phaser.CreaturePackDraw = function (game, x, y, pack_data_in, texture) {
	x = x || 0;
    y = y || 0;
    
    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;
    
    
    /**
    * @property {number} timeDelta - How quickly the animation time/playback advances
    */
    this.timeDelta = 0.05;
    
    /**
    * @property {string} name - The user defined name given to this Image.
    * @default
    */
    this.name = '';
    
    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = 314598722; 
    
    /**
    * @property {number} z - The z-depth value of this object within its Group (remember the World is a Group as well). No two objects in a Group can have the same z value.
    */
    this.z = 0;
    
    CreaturePackRenderer.call(this, pack_data_in, texture);
    
    this.position.set(x, y);
    
    /**
    * @property {Phaser.Point} world - The world coordinates of this Image. This differs from the x/y coordinates which are relative to the Images container.
    */
    this.world = new Phaser.Point(x, y);
};

Phaser.CreaturePackDraw.prototype = Object.create(CreaturePackRenderer.prototype);
Phaser.CreaturePackDraw.prototype.constructor = Phaser.CreaturePackDraw;

Phaser.CreaturePackDraw.prototype.preUpdate = function() {
};

Phaser.CreaturePackDraw.prototype.update = function() {
	this.pack_renderer.stepTime(this.timeDelta);
	this.UpdateData();
};

Phaser.CreaturePackDraw.prototype.postUpdate = function() {
};


