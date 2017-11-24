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
	PIXI.DisplayObjectContainer.call( this );
	
	this.creature_manager = manager_in;
	this.texture = texture_in;
	this.dirty = true;
	this.blendMode = PIXI.blendModes.NORMAL;
	this.creatureBoundsMin = new PIXI.Point(0,0);
	this.creatureBoundsMax = new PIXI.Point(0,0);
	
	var target_creature = this.creature_manager.target_creature;

	this.verticies = new Float32Array(target_creature.total_num_pts * 2);
	this.uvs = new Float32Array(target_creature.total_num_pts * 2);
	
	this.indices = new Uint16Array(target_creature.global_indices.length);
	for(var i = 0; i < this.indices.length; i++)
	{
		this.indices[i] = target_creature.global_indices[i];
	}
	
	this.colors = new Float32Array(target_creature.total_num_pts * 4);
	for(var i = 0; i < this.colors.length; i++)
	{
		this.colors[i] = 1.0;
	}

	this.UpdateRenderData(target_creature.global_pts, target_creature.global_uvs);
};

// constructor
CreatureRenderer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
CreatureRenderer.prototype.constructor = CreatureRenderer;

CreatureRenderer.prototype._renderWebGL = function(renderSession)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if(!this.visible || this.alpha <= 0)return;
    // render triangles..

    renderSession.spriteBatch.stop();

    // init! init!
    if(!this._vertexBuffer)this._initWebGL(renderSession);
    
    renderSession.shaderManager.setShader(renderSession.shaderManager.stripShader);

    this._renderCreature(renderSession);

    ///renderSession.shaderManager.activateDefaultShader();

    renderSession.spriteBatch.start();

    //TODO check culling  
};

CreatureRenderer.prototype._initWebGL = function(renderSession)
{
    // build the strip!
    var gl = renderSession.gl;
    
    this._vertexBuffer = gl.createBuffer();
    this._indexBuffer = gl.createBuffer();
    this._uvBuffer = gl.createBuffer();
    this._colorBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,  this.uvs, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
};

CreatureRenderer.prototype._renderCreature = function(renderSession)
{
    var gl = renderSession.gl;
    var projection = renderSession.projection,
        offset = renderSession.offset,
        shader = renderSession.shaderManager.stripShader;


    // gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mat4Real);

    renderSession.blendModeManager.setBlendMode(this.blendMode);
    

    // set uniforms
    gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
    gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
    gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
    gl.uniform1f(shader.alpha, this.worldAlpha);

    if(!this.dirty)
    {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verticies);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        
    	// update colors, Phaser or Pixi does not support this yet
    	//gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
    	//gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 0, 0);
        
        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            
        gl.activeTexture(gl.TEXTURE0);

        // check if a texture is dirty..
        if(this.texture.baseTexture._dirty[gl.id])
        {
            renderSession.renderer.updateTexture(this.texture.baseTexture);
        }
        else
        {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
        }
    
        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    
    
    }
    else
    {

        this.dirty = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    	// update colors, Phaser or Pixi does not support this yet
    	//gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
    	//gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 0, 0);
        
        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            
        gl.activeTexture(gl.TEXTURE0);

        // check if a texture is dirty..
        if(this.texture.baseTexture._dirty[gl.id])
        {
            renderSession.renderer.updateTexture(this.texture.baseTexture);
        }
        else
        {
            gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
        }
    
        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        
    }
    
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);  
};

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

CreatureRenderer.prototype.EnableSkinSwap = function(swap_name_in, active)
{
	var target_creature = this.creature_manager.target_creature;
	target_creature.EnableSkinSwap(swap_name_in, active);
	this.indices = new Uint16Array(target_creature.final_skin_swap_indices.length);
	for(var i = 0; i < this.indices.length; i++)
	{
		this.indices[i] = target_creature.final_skin_swap_indices[i];
	}		
};

CreatureRenderer.prototype.DisableSkinSwap = function()
{
	var target_creature = this.creature_manager.target_creature;
	target_creature.DisableSkinSwap();
	this.indices = new Uint16Array(target_creature.global_indices.length);
	for(var i = 0; i < this.indices.length; i++)
	{
		this.indices[i] = target_creature.global_indices[i];
	}		
};

CreatureRenderer.prototype.SetAnchorPoint = function(x, y, anim_clip_name_in) {
  if (!anim_clip_name_in) {
    anim_clip_name_in = 'default';
  }

  var target_creature = this.creature_manager.target_creature;
  target_creature.ComputeBoundaryMinMax();

  this.ComputeBoundaryMinMax();

  var mesh_size_x = this.boundary_max[0] - this.boundary_min[0];
  var mesh_size_y = this.boundary_max[1] - this.boundary_min[1];

  var target_size_x = this.boundary_max[0];
  var target_size_y = this.boundary_max[1];


  if (x >= 0 && x !== null) {
    target_size_x = (this.boundary_max[0] - (mesh_size_x * (x)));
  }
  else if (x < 0) {
    target_size_x = -Math.abs(this.boundary_max[0] - (mesh_size_x * (Math.abs(x))));
  }
  else if (x === null) {
    if (this.anchor_point_map && this.anchor_point_map[anim_clip_name_in]) {
        target_size_x = this.anchor_point_map[anim_clip_name_in][0];
    }
    else {
        target_size_x = 0;
    }
  }

  if (y >= 0 && y !== null) {
    target_size_y = (this.boundary_max[1] - (mesh_size_y * (y)));
  }
  else if (y < 0) {
    target_size_y = -Math.abs(this.boundary_max[1] - (mesh_size_y * (Math.abs(y))));
  }
  else if (y === null) {
    if (this.anchor_point_map && this.anchor_point_map[anim_clip_name_in]) {
        target_size_y = this.anchor_point_map[anim_clip_name_in][1];
    }
    else {
        target_size_y = 0;
    }
  }

  var anchor_point_base = {
    AnchorPoints: [
      {
        point: [target_size_x, target_size_y],
        anim_clip_name: anim_clip_name_in
      }
    ]
  };

  this.anchor_point_map = this.FillAnchorPointMap(anchor_point_base);
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

CreatureRenderer.prototype.UpdateData = function()
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
		this.verticies[write_pt_index] = inputVerts[pt_index];
		this.verticies[write_pt_index + 1] = -inputVerts[pt_index + 1];
		
		this.uvs[uv_index] = inputUVs[uv_index];
		this.uvs[uv_index + 1] = inputUVs[uv_index + 1];
		
		pt_index += 3;
		uv_index += 2;
		
		write_pt_index += 2;
	}
	
	// Update colour/opacity region values
	var render_composition =
    	target_creature.render_composition;
	var regions_map =
	    render_composition.getRegionsMap();
	for(region_name in regions_map)
	{
		var cur_region = regions_map[region_name];
		var start_pt_idx = cur_region.getStartPtIndex();
		var end_pt_idx = cur_region.getEndPtIndex();
		var cur_opacity = cur_region.opacity * 0.01;
				
		for(var i = (start_pt_idx * 3); i <= (end_pt_idx * 3); i++)
		{
			this.colors[i] = cur_opacity;
		}
	}
	 
};
