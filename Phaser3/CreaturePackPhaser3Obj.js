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

// This is an class that will create a Phaser 3 Mesh object and include it as part of the class under:
// - mesh
// Access mesh to resize, transform etc just like a regular Phaser 3 Mesh Object
// You should call the tick() method in your game's update() method to update the CreaturePackObj animation state

var CreaturePackObj = new Phaser.Class({

    initialize:

    function CreaturePackObj (scene, x, y, byte_data_in, texture_key, panZVal=7)
    {
        this.speed = 0.05;

        var byte_array = new Uint8Array(byte_data_in);
        this.pack_data = new CreaturePackLoader(byte_array.buffer);

        this.pack_renderer = new CreatureHaxeBaseRenderer(this.pack_data);
        this.pack_renderer.stepTime(0);
        this.pack_renderer.syncRenderData();

        var indices = this.pack_data.indices;

        var render_pts = this.pack_renderer.render_points;
        var render_uvs = this.pack_renderer.render_uvs;
        var render_colors = this.pack_renderer.render_colors;

		var create_vertices = new Float32Array(render_pts.length);
        var create_uvs = new Float32Array(render_uvs.length);
        var create_colors = new Uint32Array(render_pts.length);
        var create_alphas = new Float32Array(render_pts.length);

        for(var i = 0; i < create_colors.length; i++)
        {
            create_colors[i] = 0xFFFFFF;
        }

        for(var i = 0; i < create_alphas.length; i++)
        {
            create_alphas[i] = 1.0;
        }

        this.mesh = scene.add.mesh(x, y, texture_key);
        this.mesh.addVertices(render_pts, render_uvs, indices);
        this.mesh.ignoreDirtyCache = true;
        this.mesh.panZ(panZVal);      
    },

    getPackRGBA: function (r, g, b, a)
    {
        var ur = ((r * 255.0)|0) & 0xFF;
        var ug = ((g * 255.0)|0) & 0xFF;
        var ub = ((b * 255.0)|0) & 0xFF;
        var ua = ((a * 255.0)|0) & 0xFF;

        return ((ua << 24) | (ur << 16) | (ug << 8) | ub) >>> 0;
    },

    tick: function (time, delta)
    {
        this.pack_renderer.stepTime(delta * this.speed);
        this.pack_renderer.syncRenderData();

        indices = this.pack_data.indices;
        render_pts = this.pack_renderer.render_points;
        render_uvs = this.pack_renderer.render_uvs;
        render_colors = this.pack_renderer.render_colors;

        // Unfortunately, Phaser still does not have a proper efficient way of rendering meshes with indices
        // It seems Phase still "unrolls" the mesh without any considerations for vertices sharing multiple indices
        // This means indices.length == this.mesh.getVertexCount() which is not good for performance
        for(var i = 0; i < indices.length; i++)
        {
            var cVertex = this.mesh.vertices[i];
            var idx = indices[i] * 2;
            cVertex.x = render_pts[idx];
            cVertex.y = render_pts[idx + 1];

            cVertex.u = render_uvs[idx];
            cVertex.v = render_uvs[idx + 1];
            
            var r = render_colors[indices[i] * 4];
            var g = render_colors[indices[i] * 4];
            var b = render_colors[indices[i] * 4];
            cVertex.colors = this.getPackRGBA(r, g, b, 1);
            cVertex.alphas = render_colors[indices[i] * 4 + 3];
        }                     
    }

});