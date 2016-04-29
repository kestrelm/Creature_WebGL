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

function CreaturePackRenderer(pack_data_in, texture_in)
{
	PIXI.DisplayObjectContainer.call( this );
	
	this.pack_data = pack_data_in;
	this.pack_renderer = new CreatureHaxeBaseRenderer(this.pack_data);
	this.texture = texture_in;
	this.dirty = true;
	this.blendMode = PIXI.blendModes.NORMAL;
	this.creatureBoundsMin = new PIXI.Point(0,0);
	this.creatureBoundsMax = new PIXI.Point(0,0);
	
	this.verticies = new PIXI.Float32Array(this.pack_renderer.render_points.length);
	this.uvs = new PIXI.Float32Array(this.pack_renderer.render_uvs.length);
	
	this.indices = new PIXI.Uint16Array(this.pack_data.indices.length);
	for(var i = 0; i < this.indices.length; i++)
	{
		this.indices[i] = this.pack_data.indices[i];
	}
	
	this.colors = new PIXI.Float32Array([1,1,1,1]);

	this.UpdateRenderData(this.pack_data.points, this.pack_data.uvs);
};

// constructor
CreaturePackRenderer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
CreaturePackRenderer.prototype.constructor = CreaturePackRenderer;

CreaturePackRenderer.prototype._renderWebGL = function(renderSession)
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

CreaturePackRenderer.prototype._initWebGL = function(renderSession)
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
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
};

CreaturePackRenderer.prototype._renderCreature = function(renderSession)
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

// TODO: Implement this
/*
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
*/

CreaturePackRenderer.prototype.UpdateData = function()
{
	this.pack_renderer.syncRenderData();
	var read_pts = this.pack_renderer.render_points;
	//var read_pts = target_creature.global_pts;
	var read_uvs = this.pack_renderer.render_uvs;
	
	this.UpdateRenderData(read_pts, read_uvs);
	//this.UpdateCreatureBounds();
	this.dirty = true;
};

CreaturePackRenderer.prototype.UpdateRenderData = function(inputVerts, inputUVs)
{
	var write_pt_index = 0;
	
	for(var i = 0; i < this.pack_renderer.render_points.length; i+=2)
	{
		this.verticies[i] = this.pack_renderer.render_points[i];
		this.verticies[i + 1] = -this.pack_renderer.render_points[i + 1];
		
		this.uvs[i] = this.pack_renderer.render_uvs[i];
		this.uvs[i + 1] = this.pack_renderer.render_uvs[i + 1];		
	}
};
