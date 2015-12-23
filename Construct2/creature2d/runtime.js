// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Creature2d = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Creature2d.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
		this.texture_img = new Image();
		this.texture_img.cr_filesize = this.texture_filesize;
		// Tell runtime to wait for this to load
		this.runtime.waitForImageLoad(this.texture_img, this.texture_file);
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
		if(this.runtime.glwrap)
		{
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, false, this.runtime.linearSampling);
			this.saved_mat = mat4.create();
		}
		
		this.dirty = false;
		this.creature_manager = null;
		
		this.verticies = null;
		this.uvs = null;
		this.indices = null;
		
		this.runtime.tickMe(this);
	};
	
	instanceProto.onDestroy = function ()
	{
	};
	
	instanceProto.saveToJSON = function ()
	{
		return {
		};
	};

	instanceProto.loadFromJSON = function (o)
	{
	};
	
	instanceProto.tick = function()
	{
		if(this.creature_manager)
		{
			//console.log("tick");
			this.creature_manager.Update(this.runtime.getDt(this));
			this.dirty=true;
			this.runtime.redraw = true;
		}
	};
	
	instanceProto.draw = function(ctx)
	{
		// none
	};
	
	instanceProto.drawGL = function (glw)
	{
		if(!this.creature_manager)
			return;
		
		glw.endBatch();
		var gl = glw.gl;
		
		//init buffers
		if(!this._vertexBuffer)
		{
			this._vertexBuffer = gl.createBuffer();
			this._indexBuffer = gl.createBuffer();
			this._uvBuffer = gl.createBuffer();
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,  this.uvs, gl.DYNAMIC_DRAW);
		 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
		}
		
		//c2 setup
		glw.setTexture(this.webGL_texture);
		//glw.setOpacity(this.opacity);
		
		// save matrix
		mat4.set(glw.matMV, this.saved_mat);
		
		glw.translate(this.x, this.y);
		glw.rotateZ(this.angle);
		glw.scale(this.width/50, this.height/50);
		glw.updateModelView();
		glw.endBatch();
		
		// update
		if(!this.dirty)
		{
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
			//gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.verticies);
			gl.vertexAttribPointer(glw.currentShader.locAPos, 2, gl.FLOAT, false, 0, 0);
			
			// update the uvs
			gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
			gl.vertexAttribPointer(glw.currentShader.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		else
		{
			var target_creature = this.creature_manager.target_creature;
			var pt_index = 0;
			var uv_index = 0;
			var write_pt_index = 0;
			for(var i = 0; i < target_creature.total_num_pts; i++)
			{
				this.verticies[write_pt_index] = target_creature.render_pts[pt_index];
				this.verticies[write_pt_index + 1] = -target_creature.render_pts[pt_index + 1];
				
				this.uvs[uv_index] = target_creature.global_uvs[uv_index];
				this.uvs[uv_index + 1] = target_creature.global_uvs[uv_index + 1];
				
				pt_index += 3;
				uv_index += 2;
				
				write_pt_index += 2;
			}
			
			this.dirty = false;
			gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.verticies, gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(glw.currentShader.locAPos, 2, gl.FLOAT, false, 0, 0);
			
			// update the uvs
			gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(glw.currentShader.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
		//c2 post setup
		// restore c2 index buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glw.indexBuffer);
		
		// swap mat with saved
		var tmp = glw.matMV
		glw.matMV = this.saved_mat;
		this.saved_mat = tmp;
		
		glw.updateModelView();
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "My debugger section",
			"properties": [
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.loadCreature2djson = function (jsonText)
	{
		var actual_JSON = JSON.parse(jsonText);
		
		var creature = new Creature(actual_JSON);
				
		this.creature_manager = new CreatureManager(creature);
		this.creature_manager.CreateAllAnimations(actual_JSON);

		this.creature_manager.SetShouldLoop(true);
		this.creature_manager.SetIsPlaying(true);
		this.creature_manager.RunAtTime(0);

		this.verticies = new Float32Array(creature.total_num_pts * 2);
		this.uvs = new Float32Array(creature.total_num_pts * 2);
		
		this.indices = new Uint16Array(creature.global_indices.length);
		for(var i = 0; i < this.indices.length; i++)
		{
			this.indices[i] = creature.global_indices[i];
		}
		
		this.dirty = true;
	};

	Acts.prototype.switchAnimation = function(animationName)
	{
		this.creature_manager.SetActiveAnimationName(animationName, true);
	};

	Acts.prototype.setAnimationSpeed = function(speed)
	{
		this.creature_manager.time_scale = speed;
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	pluginProto.exps = new Exps();

}());