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

// CreaturePackRenderer
function CreaturePackRenderer(pack_data_in, texture_in)
{
	this.pack_data = pack_data_in;
	this.pack_renderer = new CreatureHaxeBaseRenderer(this.pack_data);

	var mIndices = new Uint16Array(this.pack_data.indices.length);
    for(var i = 0; i < mIndices.length; i++)
	{
		mIndices[i] = this.pack_data.indices[i];
	}

	PIXI.SimpleMesh.call(
		this, 
		texture_in, 
		new Float32Array(this.pack_renderer.render_points.length),
		new Float32Array(this.pack_renderer.render_uvs.length),
		mIndices,
		PIXI.DRAW_MODES.TRIANGLES
		);
	
	this.texture = texture_in;
	this.dirty = true;
	this.blendMode = PIXI.BLEND_MODES.NORMAL;
	this.creatureBoundsMin = new PIXI.Point(0,0);
    this.creatureBoundsMax = new PIXI.Point(0,0);
		
    this.colors = new Float32Array([1,1,1,1]);
    this.UpdateRenderData(this.pack_data.points, this.pack_data.uvs);
};

// constructor
CreaturePackRenderer.prototype = Object.create(PIXI.SimpleMesh.prototype);
CreaturePackRenderer.prototype.constructor = CreaturePackRenderer;

CreaturePackRenderer.prototype.refresh = function()
{
    this.pack_renderer.syncRenderData();
	var read_pts = this.pack_renderer.render_points;
	var read_uvs = this.pack_renderer.render_uvs;	
    this.UpdateRenderData(read_pts, read_uvs);
	
	this.autoUpdate = true;
	var setUVs = this.geometry.getBuffer('aTextureCoord');
	setUVs.update();
};

CreaturePackRenderer.prototype.UpdateRenderData = function(inputVerts, inputUVs)
{
	var write_pt_index = 0;
	var setUVs = this.geometry.getBuffer('aTextureCoord').data;
	for(var i = 0; i < this.pack_renderer.render_points.length; i+=2)
	{
		this.vertices [i] = this.pack_renderer.render_points[i];
		this.vertices [i + 1] = -this.pack_renderer.render_points[i + 1];
		
		setUVs[i] = this.pack_renderer.render_uvs[i];
		setUVs[i + 1] = this.pack_renderer.render_uvs[i + 1];		
	}
};