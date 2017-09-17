#include "CreaturePackManager.h"

CreaturePack::PackManager::PackManager()
    : pack_id_gen(0)
{

}

CreaturePack::PackManager::~PackManager()
{

}

bool CreaturePack::PackManager::addPackLoader(
    const std::string& name_in, 
    const std::vector<uint8_t>& byte_array)
{
    if(pack_loaders.count(name_in) > 0)
    {
        std::cout<<"CreaturePack::PackManager::addPackLoader() - Cannot add PackLoader, " + name_in + " already exists!"<<std::endl;
        return false;
    }

    pack_loaders[name_in] = std::make_shared<CreaturePackLoader>(byte_array);
    return true;
}

int CreaturePack::PackManager::addPackPlayer(const std::string& loader_name)
{
    if(pack_loaders.count(loader_name) == 0)
    {
        std::cout<<"CreaturePack::PackManager::addPackPlayer() - ERROR! PackLoader: " + loader_name + " does not exist!"<<std::endl;
        return -1;
    }

    pack_id_gen++;
    pack_players[pack_id_gen] = std::make_shared<CreaturePackPlayer>(*pack_loaders[loader_name]);

    return pack_id_gen;
}

bool CreaturePack::PackManager::removePackPlayer(int handle)
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::removePackPlayer() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return false;
    }

    pack_players.erase(handle);
    return true;
}

bool CreaturePack::PackManager::setPlayerActiveAnimation(int handle, const std::string& name)
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::setPlayerActiveAnimation() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return false;
    }

    auto& player = pack_players[handle];
    player->setActiveAnimation(name);
    return true;
}

bool CreaturePack::PackManager::setPlayerBlendToAnimation(int handle, const std::string& name, float blend_delta)
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::setPlayerBlendToAnimation() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return false;
    }

    auto& player = pack_players[handle];
    player->blendToAnimation(name, blend_delta);

    return true;    
}

bool CreaturePack::PackManager::stepPlayer(int handle, float delta)
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::stepPlayer() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return false;
    }

    auto& player = pack_players[handle];
    player->stepTime(delta);
    player->syncRenderData();

    return true;
}

float CreaturePack::PackManager::getPlayerRunTime(int handle) const
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::getPlayerRunTime() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return 0.0f;
    }

    const auto& player = pack_players.at(handle);
    return player->getRunTime();
}

bool CreaturePack::PackManager::setPlayerLoop(int handle, bool should_loop)
{
    if(pack_players.count(handle) == 0)
    {
        std::cout<<"CreaturePack::PackManager::setPlayerLoop() - ERROR! Player with handle: " + std::to_string(handle) + " not found!"<<std::endl;
        return false;
    }

    const auto& player = pack_players.at(handle);
    player->isLooping = should_loop;
    return true;
}

emscripten::val CreaturePack::PackManager::getPlayerPoints(int handle)
{
    const auto& player = pack_players.at(handle);
    return emscripten::val(emscripten::typed_memory_view(
        player->getRenderPointsLength(),
        player->render_points.get()
    ));
}

emscripten::val CreaturePack::PackManager::getPlayerColors(int handle)
{
    const auto& player = pack_players.at(handle);
    return emscripten::val(emscripten::typed_memory_view(
        player->getRenderColorsLength(),
        player->render_colors.get()
    ));
}

emscripten::val CreaturePack::PackManager::getPlayerUVs(int handle)
{
    const auto& player = pack_players.at(handle);
    return emscripten::val(emscripten::typed_memory_view(
        player->getRenderUVsLength(),
        player->render_uvs.get()
    ));
}

// Binding code
EMSCRIPTEN_BINDINGS(creaturepack_manager_module) {
    emscripten::class_<CreaturePack::PackManager>("PackManager")
        .constructor()
        .function("addPackLoader", &CreaturePack::PackManager::addPackLoader)
        .function("addPackPlayer", &CreaturePack::PackManager::addPackPlayer)
        .function("removePackPlayer", &CreaturePack::PackManager::removePackPlayer)
        .function("setPlayerActiveAnimation", &CreaturePack::PackManager::setPlayerActiveAnimation)
        .function("setPlayerBlendToAnimation", &CreaturePack::PackManager::setPlayerBlendToAnimation)
        .function("stepPlayer", &CreaturePack::PackManager::stepPlayer)
        .function("getPlayerRunTime", &CreaturePack::PackManager::getPlayerRunTime)
        .function("setPlayerLoop", &CreaturePack::PackManager::setPlayerLoop)
        .function("getPlayerPoints", &CreaturePack::PackManager::getPlayerPoints)
        .function("getPlayerColors", &CreaturePack::PackManager::getPlayerColors)
        .function("getPlayerUVs", &CreaturePack::PackManager::getPlayerUVs)
        ;
    }