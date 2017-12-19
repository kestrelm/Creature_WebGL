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
		this.first_run = true;
		this.pixel_scale_x = 1.0;
		this.pixel_scale_y = 1.0;
		
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

			if(this.first_run)
			{
				this.first_run = false;
				// Compute Pixel Scaling
				var target_creature = this.creature_manager.target_creature; 
				target_creature.ComputeBoundaryMinMax();
			    var mesh_size_x = target_creature.boundary_max[0] - target_creature.boundary_min[0];
	    		var mesh_size_y = target_creature.boundary_max[1] - target_creature.boundary_min[1];

	    		this.pixel_scale_x = 1.0 / mesh_size_x;
				this.pixel_scale_y = 1.0 / mesh_size_y;			
			}			
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
		 
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);

		//c2 setup
		glw.setTexture(this.webGL_texture);
		glw.setOpacity(this.opacity);
		
		// save matrix
		mat4.set(glw.matMV, this.saved_mat);
		
		glw.translate(this.x, this.y);
		glw.rotateZ(this.angle);
		glw.scale(this.width * this.pixel_scale_x * this.xFlip, this.height * this.pixel_scale_y * this.yFlip);
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

		// Update Indices if required
		var indexBufferLength = this.indices.length;
		if(this.animateRegionOrder)
		{
			var target_creature = this.creature_manager.target_creature;
			var whichIdxBuffer = target_creature.UpdateFinalOrderIndices(
				this.creature_manager.active_animation_name, 
				this.creature_manager.run_time);
			if(whichIdxBuffer)
			{
				// Skin Swap Indices
				indexBufferLength = target_creature.final_skin_swap_indices.length;
				for(var j = 0; j < target_creature.final_skin_swap_indices.length; j++)
				{
					this.indices[j] = target_creature.final_skin_swap_indices[j];
				}
			}
			else {
				// Normal Indices
				for(var j = 0; j < target_creature.final_indices.length; j++)
				{
					this.indices[j] = target_creature.final_indices[j];
				}
			}

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);			
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.drawElements(gl.TRIANGLES, indexBufferLength, gl.UNSIGNED_SHORT, 0);
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
		this.creature_manager.CreateAllAnimations(actual_JSON, false);
		this.creature_manager.SetIsPlaying(true);
		this.creature_manager.RunAtTime(0);
		this.creature_manager.SetShouldLoop(true);
		this.creature_manager.SetAutoBlending(true);

		this.verticies = new Float32Array(creature.total_num_pts * 2);
		this.uvs = new Float32Array(creature.total_num_pts * 2);
		this.yFlip = 1.0;
		this.xFlip = 1.0;
		this.animateRegionOrder = false;
		
		this.indices = new Uint16Array(creature.global_indices.length);
		for(var i = 0; i < this.indices.length; i++)
		{
			this.indices[i] = creature.global_indices[i];
		}
		
		this.dirty = true;
	};

	Acts.prototype.loadCreature2dMetaData = function(jsonText)
	{
		var actual_JSON = JSON.parse(jsonText);
		var meta_data = CreatureModuleUtils.BuildCreatureMetaData(actual_JSON);
		this.creature_manager.target_creature.SetMetaData(meta_data);
	};

	Acts.prototype.enableSkinSwap = function(swap_name_in)
	{
		var target_creature = this.creature_manager.target_creature;
		target_creature.EnableSkinSwap(swap_name_in, true);
		this.indices = new Uint16Array(target_creature.final_skin_swap_indices.length);
		for(var i = 0; i < this.indices.length; i++)
		{
			this.indices[i] = target_creature.final_skin_swap_indices[i];
		} 		
	};

	Acts.prototype.disableSkinSwap = function()
	{
		var target_creature = this.creature_manager.target_creature;
		target_creature.DisableSkinSwap();
		this.indices = new Uint16Array(target_creature.global_indices.length);
		for(var i = 0; i < this.indices.length; i++)
		{
			this.indices[i] = target_creature.global_indices[i];
		} 
	};

	Acts.prototype.switchAnimation = function(animationName)
	{
		this.creature_manager.SetActiveAnimationName(animationName, true);
	};

	Acts.prototype.autoBlendToAnimation = function(animationName, blendDelta)
	{
		this.creature_manager.AutoBlendTo(animationName, blendDelta);
	};

	Acts.prototype.setAnimationSpeed = function(speed)
	{
		this.creature_manager.time_scale = speed;
	};

	Acts.prototype.setXYFlip = function(xFlip, yFlip)
	{
		this.xFlip = xFlip;
		this.yFlip = yFlip;
	};

	Acts.prototype.setAnimateRegionOrder = function(valIn)
	{
		var real_val = false;
		if(valIn > 0)
		{
			real_val = true;
		}

		this.animateRegionOrder = real_val;
	};

	Acts.prototype.setAnimationStartEndTime = function(animationName, startTime, endTime)
	{
		var cur_animation = this.creature_manager.GetAnimation(animationName);
		cur_animation.start_time = startTime;
		cur_animation.end_time = endTime;		
	};

	Acts.prototype.setAnimationLoop = function(should_loop)
	{
		var real_val = false;
		if(should_loop > 0)
		{
			real_val = true;	
		}

		this.creature_manager.SetShouldLoop(real_val);
	};

	Acts.prototype.makePointCache = function(animationName)
	{
		this.creature_manager.MakePointCache(animationName);
	};

	Acts.prototype.setAnchorPointsActive = function(anchorActive)
	{
		var real_val = false;
		if(anchorActive > 0)
		{
			real_val = true;
		}

		this.creature_manager.anchor_points_active = real_val;
	}
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.GetActiveAnimation = function(ret) {
		var instance = this;
		ret.set_string(this.creature_manager.GetActiveAnimation());
	}

	pluginProto.exps = new Exps();

}());