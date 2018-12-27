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
        this.skin_swap = {};
        this.active_skin_swap_names = {};
    }

    getNumMeshIndices(name_in)
    {
        var cur_data = this.mesh_map[name_in];
        return cur_data[1] - cur_data[0] + 1;
    }

    genSortedMeshNames(pack_player)
    {
        mesh_sorted_names = [];
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
                        mesh_sorted_names.push(meshKey);
                    }
                }
            }
        }
    }    
}

module.exports = { 
    CreaturePackMetaData
}