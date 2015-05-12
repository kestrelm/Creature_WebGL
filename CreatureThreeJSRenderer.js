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

function CreatureRenderer(name, scene, manager_in, texture_in)
{
	this.creature_manager = manager_in;
	this.texture = texture_in;
	this.scene = scene;
	this.name = name;
	this.normals = [];
	
	this.renderMesh = null; 	

	if(this.renderMesh == null)
	{
		var target_creature = this.creature_manager.target_creature;
		var geometry = new THREE.Geometry();
		var material = this.texture;	
		
		// topology
		for(var i = 0; i < target_creature.global_indices.length; i+=3)
		{
			var cur_face = new THREE.Face3(target_creature.global_indices[i],
											target_creature.global_indices[i + 1],
											target_creature.global_indices[i + 2]);
			geometry.faces.push(cur_face);
		}
		
		// points
		for(var i = 0; i < target_creature.total_num_pts * 3; i+=3)
		{
			var cur_pt = new THREE.Vector3(target_creature.global_pts[i],
											target_creature.global_pts[i + 1],
											target_creature.global_pts[i + 2]);
			geometry.vertices.push(cur_pt);
		}
		
		// uvs
		geometry.faceVertexUvs[0] = [];
		var faces = geometry.faces;
		for(var i = 0; i < geometry.faces.length; i++)
		{
			var v1 = faces[i].a;
      		var v2 = faces[i].b;
      		var v3 = faces[i].c;
      		
			var cur_uv1 = new THREE.Vector2(target_creature.global_uvs[v1 * 2],
											target_creature.global_uvs[(v1 * 2) + 1]);
			
			var cur_uv2 = new THREE.Vector2(target_creature.global_uvs[v2 * 2],
										target_creature.global_uvs[(v2 * 2) + 1]);

			var cur_uv3 = new THREE.Vector2(target_creature.global_uvs[v3 * 2],
										target_creature.global_uvs[(v3 * 2) + 1]);

			geometry.faceVertexUvs[0].push([cur_uv1, cur_uv2, cur_uv3]);
		}
		
		
		/*
		// colors
		for(var i = 0; i < target_creature.total_num_pts * 4; i+=4)
		{
			var cur_color = new THREE.Color(0xffffff);
			cur_color.setRGB(1,1,1);
			geometry.colors.push(cur_color);
		}
		*/
		
		this.renderMesh = new THREE.Mesh(geometry, material);
		scene.add(this.renderMesh);

		this.renderMesh.geometry.computeFaceNormals();		
		this.renderMesh.geometry.computeVertexNormals();	
		
		this.renderMesh.geometry.elementsNeedUpdate = true;	
		this.renderMesh.geometry.normalsNeedUpdate = true;	
		//this.renderMesh.geometry.colorsNeedUpdate = true;
		material.needsUpdate = true;
		this.renderMesh.geometry.uvsNeedUpdate = true;
		this.renderMesh.geometry.buffersNeedUpdate = true;
	}

};


CreatureRenderer.prototype.UpdateData = function()
{
	var target_creature = this.creature_manager.target_creature;
	
	var read_pts = target_creature.render_pts;
	//var read_pts = target_creature.global_pts;
	var read_uvs = target_creature.global_uvs;
	var read_colours = target_creature.render_colours;
	
	// points
	var index = 0;
	for(var i = 0; i < target_creature.total_num_pts * 3; i+=3)
	{
		var cur_pt = new THREE.Vector3(target_creature.render_pts[i],
										target_creature.render_pts[i + 1],
										target_creature.render_pts[i + 2]);

		this.renderMesh.geometry.vertices[index] = cur_pt;
		index = index + 1;
	}
	
	// uvs
	var faces = this.renderMesh.geometry.faces;
	for(var i = 0; i < this.renderMesh.geometry.faces.length; i++)
	{
		var v1 = faces[i].a;
      	var v2 = faces[i].b;
      	var v3 = faces[i].c;
      		
		var cur_uv1 = new THREE.Vector2(target_creature.global_uvs[v1 * 2],
										1.0 - target_creature.global_uvs[(v1 * 2) + 1]);
			
		var cur_uv2 = new THREE.Vector2(target_creature.global_uvs[v2 * 2],
										1.0 - target_creature.global_uvs[(v2 * 2) + 1]);

		var cur_uv3 = new THREE.Vector2(target_creature.global_uvs[v3 * 2],
										1.0 - target_creature.global_uvs[(v3 * 2) + 1]);

		this.renderMesh.geometry.faceVertexUvs[0][i] = ([cur_uv1, cur_uv2, cur_uv3]);
	}

	this.renderMesh.geometry.verticesNeedUpdate = true;
	this.renderMesh.geometry.uvsNeedUpdate = true;
};
