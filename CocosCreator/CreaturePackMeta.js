// CreaturePackMetaData
class CreaturePackMetaData
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.mesh_map = {};
        this.mesh_sorted_names = [];
        this.skin_swaps = {};
        this.active_skin_swap_names = new Set();
    }

    getNumMeshIndices(name_in)
    {
        var cur_data = this.mesh_map[name_in];
        return cur_data[1] - cur_data[0] + 1;
    }

    genSortedMeshNames(pack_player)
    {
        this.mesh_sorted_names = [];
        for(var i = 0; i < pack_player.data.meshRegionsList.length; i++)
        {
            var meshData = pack_player.data.meshRegionsList[i];
            for(var meshKey in this.mesh_map)
            {
                if (this.mesh_map.hasOwnProperty(meshKey)) {  
                    var cmpMeshData = this.mesh_map[meshKey];
                    var cmpMinIdx = pack_player.data.points.length
                    var cmpMaxIdx = 0;
                    for(var k = cmpMeshData[0]; k <= cmpMeshData[1]; k++)
                    {
                        var cur_idx = pack_player.data.indices[k];
                        cmpMinIdx = Math.min(cmpMinIdx, cur_idx);
                        cmpMaxIdx = Math.max(cmpMaxIdx, cur_idx);
                    }
    
                    if ((meshData[0] == cmpMinIdx) 
                        && (meshData[1] == cmpMaxIdx))
                    {
                        this.mesh_sorted_names.push(meshKey);
                    }
                }
            }
        }
    }    

    buildSkinSwapIndices(
        swap_name,
        src_indices,
        pack_player
    )
    {
        var skin_swap_indices = [];
        // Generate sorted names in mesh drawing order
        if (this.mesh_sorted_names.length == 0)
        {
            this.genSortedMeshNames(pack_player);
        }

        // Now Generate Skin Swap indices
        if (!(swap_name in this.skin_swaps))
        {
            return skin_swap_indices;
        }

        var swap_set = this.skin_swaps[swap_name];
        this.active_skin_swap_names = new Set();
        var total_size = 0;
        for (var cur_data in this.mesh_map)
        {
            if(this.mesh_map.hasOwnProperty(cur_data))
            {
                var cur_name = cur_data;
                if (swap_set.has(cur_name))
                {
                    total_size += this.getNumMeshIndices(cur_name);
                    this.active_skin_swap_names.add(cur_name);
                }    
            }
        }

        var offset = 0;
        for(var i = 0; i < this.mesh_sorted_names.length; i++)
        {
            var region_name = this.mesh_sorted_names[i];
            if (swap_set.has(region_name))
            {
                var num_indices = this.getNumMeshIndices(region_name);
                var cur_range = this.mesh_map[region_name];
                for (var j = 0; j < this.getNumMeshIndices(region_name); j++)
                {
                    var local_idx = cur_range[0] + j;
                    skin_swap_indices.push(src_indices[local_idx]);
                }

                offset += num_indices;
            }
        }

        return skin_swap_indices;
    }    
}

module.exports = { 
    CreaturePackMetaData
}