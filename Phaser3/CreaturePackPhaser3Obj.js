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

var CreaturePackObj = new Phaser.Class({

    Extends: Phaser.GameObjects.Mesh,

    initialize:

    function CreaturePackObj (scene, x, y, byte_data_in, texture_key)
    {
        this.speed = 0.05;

        var byte_array = new Uint8Array(byte_data_in);
        this.pack_data = new CreaturePackLoader(byte_array.buffer);

        this.pack_renderer = new CreatureHaxeBaseRenderer(this.pack_data);
        var indices_num = this.pack_data.indices.length; // Also number of points since Phaser 3 does not allow for efficient indices rendering
        
		var create_vertices = new Float32Array(indices_num * 2);
        var create_uvs = new Float32Array(indices_num * 2);
        var create_colors = new Uint32Array(indices_num * 2);
        var create_alphas = new Float32Array(indices_num * 2);

        for(var i = 0; i < create_colors.length; i++)
        {
            create_colors[i] = 0xFFFFFF;
        }

        for(var i = 0; i < create_alphas.length; i++)
        {
            create_alphas[i] = 1.0;
        }

        Phaser.GameObjects.Mesh.call(
            this,
            scene,
            x,
            y,
            create_vertices,
            create_uvs,
            [],
            create_alphas,
            texture_key
        );          

        var haha = 0;
    },

    getPackRGBA: function (r, g, b, a)
    {
        var ur = ((r * 255.0)|0) & 0xFF;
        var ug = ((g * 255.0)|0) & 0xFF;
        var ub = ((b * 255.0)|0) & 0xFF;
        var ua = ((a * 255.0)|0) & 0xFF;

        return ((ua << 24) | (ur << 16) | (ug << 8) | ub) >>> 0;
    },

    preUpdate: function (time, delta)
    {
        this.pack_renderer.stepTime(delta * this.speed);
        this.pack_renderer.syncRenderData();

        indices = this.pack_data.indices;
        render_pts = this.pack_renderer.render_points;
        render_uvs = this.pack_renderer.render_uvs;
        render_colors = this.pack_renderer.render_colors;


        for(var i = 0; i < indices.length; i++)
        {
            var idx = indices[i] * 2;
            this.vertices[i * 2] = render_pts[idx];
            this.vertices[i * 2 + 1] = -render_pts[idx + 1];

            this.uv[i * 2] = render_uvs[idx];
            this.uv[i * 2 + 1] = render_uvs[idx + 1];
            
            var r = render_colors[indices[i] * 4];
            var g = render_colors[indices[i] * 4];
            var b = render_colors[indices[i] * 4];
            this.colors[i] = this.getPackRGBA(r, g, b, 1);
            this.alphas[i] = render_colors[indices[i] * 4 + 3];
        }                     
    }

});

Phaser.GameObjects.GameObjectCreator.register('CreaturePackObj', function (config, addToScene)
{
    if (config === undefined) { config = {}; }

    var x = Phaser.Utils.Objects.GetValue(config, 'x', 0);
    var y = Phaser.Utils.Objects.GetValue(config, 'y', 0);
    var texture_key = Phaser.Utils.Objects.GetAdvancedValue(config, 'texture_key', null);
    var byte_data_in = Phaser.Utils.Objects.GetAdvancedValue(config, 'byte_data_in', null);

    var creature_char = new CreaturePackObj(this.scene, x, y, byte_data_in, texture_key);

    if (addToScene !== undefined)
    {
        config.add = addToScene;
    }

    Phaser.GameObjects.BuildGameObject(this.scene, creature_char, config);
    this.displayList.add(creature_char);
    this.updateList.add(creature_char);
return creature_char;
});

if (typeof WEBGL_RENDERER)
{
    Phaser.GameObjects.GameObjectFactory.register('CreaturePackObj', function (x, y, byte_data_in, texture_key)
    {
        var new_obj = new CreaturePackObj(this.scene, x, y, byte_data_in, texture_key);
        return new_obj;
    });
}