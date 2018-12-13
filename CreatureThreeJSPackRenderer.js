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

function CreaturePackRenderer(name, scene, pack_data_in, texture_in)
{
	this.pack_data = pack_data_in;
	this.pack_renderer = new CreatureHaxeBaseRenderer(this.pack_data);
	this.texture = texture_in;
	this.scene = scene;
	this.name = name;
	this.normals = [];
	
	this.renderMesh = null; 	

	if(this.renderMesh == null)
	{
		var geometry = new THREE.BufferGeometry();
		var material = this.texture;	
        
        var pts_size = this.pack_renderer.render_points.length / 2 * 3; // 2D to 3D pts for ThreeJS
		var vertices = new Float32Array(pts_size);
		var normals = new Float32Array(pts_size);
		var uvs = new Float32Array(this.pack_renderer.render_uvs.length);
        var indices = new Uint32Array(this.pack_data.indices.length);
        
        for(var i = 0; i < vertices.length; i+=3)
        {
            vertices[i] = this.pack_data.points[i / 3 * 2];
            vertices[i + 1] = this.pack_data.points[i / 3 * 2 + 1];
            vertices[i + 2];
        }

        for(var i = 0; i < uvs.length; i+=2)
        {
            uvs[i] = this.pack_data.uvs[i];
            uvs[i + 1] = 1.0 - this.pack_data.uvs[i + 1];
        }
		
		// topology
        for(var i = 0; i < indices.length; i++)
        {
            indices[i] = this.pack_data.indices[i];
        }
		        
		// normals
		for(var i = 0; i < normals.length; i+=3)
		{
			normals[i] = 0.0;
			normals[i + 1] = 1.0;
			normals[i + 2] = 0.0;
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
		
		geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
		geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
        
		this.renderMesh = new THREE.Mesh(geometry, material);
		scene.add(this.renderMesh);

		this.renderMesh.geometry.computeFaceNormals();		
		this.renderMesh.geometry.computeVertexNormals();	
		
		this.renderMesh.geometry.elementsNeedUpdate = true;	
		this.renderMesh.geometry.normalsNeedUpdate = true;	
		//this.renderMesh.geometry.colorsNeedUpdate = true;
		material.needsUpdate = true;
		this.renderMesh.geometry.verticesNeedUpdate = true;
		this.renderMesh.geometry.uvsNeedUpdate = true;
        this.renderMesh.geometry.buffersNeedUpdate = true;        
	}

};

CreaturePackRenderer.prototype.UpdateRenderData = function()
{
    set_vertices = this.renderMesh.geometry.getAttribute("position");
    set_vertices.needsUpdate = true;
    
	set_uvs = this.renderMesh.geometry.getAttribute("uv");
	set_uvs.needsUpdate = true;

    var j = 0;
	for(var i = 0; i < this.pack_renderer.render_points.length; i+=2)
	{
		set_vertices.array[j] = this.pack_renderer.render_points[i];
        set_vertices.array[j + 1] = this.pack_renderer.render_points[i + 1];
        j += 3;
		
		set_uvs.array[i] = this.pack_renderer.render_uvs[i];
		set_uvs.array[i + 1] = 1.0 - this.pack_renderer.render_uvs[i + 1];		
    }
    
    this.renderMesh.geometry.verticesNeedUpdate = true;
    this.renderMesh.geometry.uvsNeedUpdate = true;   
};


CreaturePackRenderer.prototype.UpdateData = function()
{	
	this.pack_renderer.syncRenderData();
    this.UpdateRenderData();
};
