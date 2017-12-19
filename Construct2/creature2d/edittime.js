// Initial Plugin Development started by: R0J0hound 

function GetPluginSettings()
{
	return {
		"name":			"Creature2d",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"Creature2d",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"0.1",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Used to render creature2d exports.",
		"author":		"R0J0hound",
		"help url":		"https://www.scirra.com/forum/plugin-creature2d_t165057",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"dependency":	"gl-matrix.js;CreatureMeshBone.js;flatbuffers.js;CreatureFlatData_generated.js",
		"flags":		0						// uncomment lines to enable flags...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
						| pf_texture			// object has a single texture (e.g. tiled background)
						| pf_position_aces		// compare/set/get x, y...
						| pf_size_aces			// compare/set/get width, height...
						| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
						| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
						| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
						| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
//AddNumberParam("Number", "Enter a number to test if positive.");
//AddCondition(0, cf_none, "Is number positive", "My category", "{0} is positive", "Description for my condition!", "MyCondition");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddStringParam("json", "Enter a creature2d json.");
AddAction(0, af_none, "Load json", "creature2d", "Load creature2d json {0}", "Load creature2d json.", "loadCreature2djson");

AddStringParam("animationName", "Enter Animation CLip to switch to.");
AddAction(1, af_none, "Switch Animation", "creature2d", "Switch creature2d animation {1}", "Switch creature2d animation.", "switchAnimation");

AddStringParam("animationBlendName", "Enter Animation C;ip to blend into.");
AddNumberParam("animationBlendDelta", "Enter Blend Delta (0 to 1)", "0.1");
AddAction(2, af_none, "Blend To Animation", "creature2d", "Blend to creature2d animation {2}", "Blend to creature2d animation.", "autoBlendToAnimation");

AddNumberParam("animationSpeed", "Enter Speed of Animation Playback", "30");
AddAction(3, af_none, "Set Animation Speed", "creature2d", "Set creature2d animation speed {3}", "Set creature2d animation speed", "setAnimationSpeed");

AddNumberParam("animationYFlip", "Flips along Y-Axis (-1 or 1)", "1");
AddNumberParam("animationXFlip", "Flips along X-Axis (-1 or 1)", "1");
AddAction(4, af_none, "Set Animation Axis Flip", "creature2d", "Set Animation Axis Flip {4}", "Set Animation Axis Flip", "setXYFlip");

AddNumberParam("animationName", "Name of Animation");
AddNumberParam("animationStartTime", "Set Start Time", "0");
AddNumberParam("animationEndTime", "Set End Time", "1");
AddAction(5, af_none, "Set Animation Clip Start/End Time", "creature2d", "Set Animation Clip Start/End Time {5}", "Set Animation Clip Start/End Time", "setAnimationStartEndTime");

AddNumberParam("animationLoop", "1 to Loop, 0 to not Loop", "1");
AddAction(6, af_none, "Set Animation Loop", "creature2d", "Set Animation Loop {6}", "Set Animation Loop", "setAnimationLoop");

AddStringParam("pointCache", "Enter Animation Name to Point Cache");
AddAction(7, af_none, "Make Point Cache", "creature2d", "Make Point Cache {7}", "Make Point Cache.", "makePointCache");

AddNumberParam("anchorPoints", "Set Anchor Points Active (0 inactive, 1 active)", "0");
AddAction(8, af_none, "Set Anchor Points Actived", "creature2d", "Set Anchor Points Active {8}", "Set Anchor Points Active", "setAnchorPointsActive");

AddStringParam("metaDataJSon", "Enter a creature2d MetaData JSON.");
AddAction(9, af_none, "Load MetaData JSON", "creature2d", "Load MetaData JSON {9}", "Load MetaData JSON.", "loadCreature2dMetaData");

AddStringParam("skinSwap", "Enter a SkinSwap Name.");
AddAction(10, af_none, "SkinSwap", "creature2d", "SkinSwap {10}", "SkinSwap.", "enableSkinSwap");

AddAction(11, af_none, "Disable SkinSwap", "creature2d", "Disable SkinSwap {11}", "Disable SkinSwap.", "disableSkinSwap");

AddNumberParam("animateRegionOrder", "Set Region Order Animation Active (0 inactive, 1 active)", "0");
AddAction(12, af_none, "Set Animate Region Order Active", "creature2d", "Set Animate Region Order Active {12}", "Set Animate Region Order Active", "setAnimateRegionOrder");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
//AddExpression(0, ef_return_number, "Leet expression", "My category", "MyExpression", "Return the number 1337.");

var exp_id = 1;

AddExpression(exp_id++, ef_return_string, "Get Active Animation", "Creature2D Expressions", "GetActiveAnimation", "Get Active Animation");
////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_link,	"Image",				"Edit",		"Click to edit the object's image.", "firstonly")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
	this.instance.EditTexture();
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	if (property_name === "Image")
	{
		this.instance.EditTexture();
	}
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
	renderer.LoadTexture(this.instance.GetTexture());
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
	renderer.SetTexture(this.instance.GetTexture());

	var q=this.instance.GetBoundingQuad();
	//renderer.Fill(q, cr.RGB(255,255,255));
	renderer.Quad(q);
	renderer.Outline(q, cr.RGB(0,0,0));
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	renderer.ReleaseTexture(this.instance.GetTexture());
}