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
// Utils
function CreatureASMUtils()
{

};

CreatureASMUtils.heapBytes = function(typedArray)
{
	var numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
	var ptr = Module._malloc(numBytes);
	var heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
	heapBytes.set(new Uint8Array(typedArray.buffer));
	return heapBytes;
};

// CreaturePackRenderer
function CreaturePackRenderer(manager_in, loader_name_in, texture_in)
{
	PIXI.mesh.Mesh.call(this, texture_in);
	
    this.playerId = manager_in.addPackPlayer(loader_name_in);
    this.packManager = manager_in;
	this.texture = texture_in;
	this.dirty = true;
	this.blendMode = PIXI.blendModes.NORMAL;
	this.creatureBoundsMin = new PIXI.Point(0,0);
	this.creatureBoundsMax = new PIXI.Point(0,0);
	
	this.vertices = manager_in.getPlayerPoints(this.playerId);
	this.uvs = manager_in.getPlayerUVs(this.playerId);
    
    var readIndices = manager_in.getPlayerIndices(this.playerId);
	this.indices = Uint16Array.from(readIndices);
	
	this.colors = new Float32Array([1,1,1,1]);
	
	this.drawMode = PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES;
};

// constructor
CreaturePackRenderer.prototype = Object.create(PIXI.mesh.Mesh.prototype);
CreaturePackRenderer.prototype.constructor = CreaturePackRenderer;

CreaturePackRenderer.prototype.UpdateCreatureBounds = function()
{
	// update bounds based off world transform matrix
	var curBounds = this.packManager.getPlayerBounds(this.playerId);
	this.creatureBoundsMin.set(curBounds[0], curBounds[1]);
	this.creatureBoundsMax.set(curBounds[2], curBounds[3]);
	
	this.worldTransform.apply(this.creatureBoundsMin, this.creatureBoundsMin);	
	this.worldTransform.apply(this.creatureBoundsMax, this.creatureBoundsMax);				
};

CreaturePackRenderer.prototype.GetPixelScaling = function(desired_x, desired_y)
{
	// compute pixel scaling relative to mesh scaling
	var curBounds = this.packManager.getPlayerBounds(this.playerId);

    var mesh_size_x = curBounds[2] - curBounds[0];
    var mesh_size_y = curBounds[3] - curBounds[1];

    var scale_x = 1.0 / mesh_size_x * desired_x;
    var scale_y = 1.0 / mesh_size_y * desired_y;

    return [scale_x, scale_y];
};

CreaturePackRenderer.prototype.refresh = function()
{
	this.UpdateCreatureBounds();
	this.dirty = true;
};

CreaturePackRenderer.prototype.removeFromManager = function()
{
    // Call this to remove the player from the manager during destruction to free up memory
    this.packManager.removePackPlayer(this.playerId)
}