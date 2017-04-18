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

function CreatureRenderer(manager_in, texture_in)
{
	PIXI.mesh.Mesh.call(this, texture_in);
	
	this.creature_manager = manager_in;
	this.texture = texture_in;
	this.dirty = true;
	this.blendMode = PIXI.blendModes.NORMAL;
	this.creatureBoundsMin = new PIXI.Point(0,0);
	this.creatureBoundsMax = new PIXI.Point(0,0);
	
	var target_creature = this.creature_manager.target_creature;

	this.vertices = new Float32Array(target_creature.total_num_pts * 2);
	this.uvs = new Float32Array(target_creature.total_num_pts * 2);
	
	this.indices = new Uint16Array(target_creature.global_indices.length);
	for(var i = 0; i < this.indices.length; i++)
	{
		this.indices[i] = target_creature.global_indices[i];
	}
	
	this.colors = new Float32Array([1,1,1,1]);
	
	this.drawMode = PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES;

	this.UpdateRenderData(target_creature.global_pts, target_creature.global_uvs);
};

// constructor
CreatureRenderer.prototype = Object.create(PIXI.mesh.Mesh.prototype);
CreatureRenderer.prototype.constructor = CreatureRenderer;


CreatureRenderer.prototype.UpdateCreatureBounds = function()
{
	// update bounds based off world transform matrix
	var target_creature = this.creature_manager.target_creature;
		
	target_creature.ComputeBoundaryMinMax();
	this.creatureBoundsMin.set(target_creature.boundary_min[0],
								-target_creature.boundary_min[1]);
	this.creatureBoundsMax.set(target_creature.boundary_max[0],
								-target_creature.boundary_max[1]);
								
	
	this.worldTransform.apply(this.creatureBoundsMin, this.creatureBoundsMin);	
	this.worldTransform.apply(this.creatureBoundsMax, this.creatureBoundsMax);				
};

CreatureRenderer.prototype.GetPixelScaling = function(desired_x, desired_y)
{
	// compute pixel scaling relative to mesh scaling
	var target_creature = this.creature_manager.target_creature;		
	target_creature.ComputeBoundaryMinMax();

    var mesh_size_x = target_creature.boundary_max[0] - target_creature.boundary_min[0];
    var mesh_size_y = target_creature.boundary_max[1] - target_creature.boundary_min[1];

    var scale_x = 1.0 / mesh_size_x * desired_x;
    var scale_y = 1.0 / mesh_size_y * desired_y;

    return [scale_x, scale_y];
};

CreatureRenderer.prototype.refresh = function()
{
	var target_creature = this.creature_manager.target_creature;
	
	var read_pts = target_creature.render_pts;
	//var read_pts = target_creature.global_pts;
	var read_uvs = target_creature.global_uvs;
	
	this.UpdateRenderData(read_pts, read_uvs);
	this.UpdateCreatureBounds();
	this.dirty = true;
};

CreatureRenderer.prototype.UpdateRenderData = function(inputVerts, inputUVs)
{
	var target_creature = this.creature_manager.target_creature;

	var pt_index = 0;
	var uv_index = 0;
	
	var write_pt_index = 0;
	
	for(var i = 0; i < target_creature.total_num_pts; i++)
	{
		this.vertices[write_pt_index] = inputVerts[pt_index];
		this.vertices[write_pt_index + 1] = -inputVerts[pt_index + 1];
		
		this.uvs[uv_index] = inputUVs[uv_index];
		this.uvs[uv_index + 1] = inputUVs[uv_index + 1];
		
		pt_index += 3;
		uv_index += 2;
		
		write_pt_index += 2;
	}
};
