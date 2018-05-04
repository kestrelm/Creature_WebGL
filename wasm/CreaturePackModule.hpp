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
* Running Software on Licensee�s Website[s] and Server[s];
* Allowing 3rd Parties to run Software on Licensee�s Website[s] and Server[s];
* Publishing Software�s output to Licensee and 3rd Parties;
* Distribute verbatim copies of Software�s output (including compiled binaries);
* Modify Software to suit Licensee�s needs and specifications.
* Binary Restricted: Licensee may sublicense Software as a part of a larger work containing more than Software,
* distributed solely in Object or Binary form under a personal, non-sublicensable, limited license. Such redistribution shall be limited to unlimited codebases.
* Non Assignable & Non-Transferable: Licensee may not assign or transfer his rights and duties under this license.
* Commercial, Royalty Free: Licensee may use Software for any purpose, including paid-services, without any royalties
* Including the Right to Create Derivative Works: Licensee may create derivative works based on Software,
* including amending Software�s source code, modifying it, integrating it into a larger work or removing portions of Software,
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

#pragma once

#include "mp.h"
#include <string>
#include <algorithm> 
#include <unordered_map>
#include <vector>
#include <memory>
#include <array>
#include <stack>
#include <cstring>

namespace CreaturePack {

class CreatureTimeSample
{
public:
	CreatureTimeSample()
		: CreatureTimeSample(0, 0, -1)
	{

	}

    CreatureTimeSample(int beginTimeIn, int endTimeIn, int dataIdxIn)
    {
        beginTime = beginTimeIn;
        endTime = endTimeIn;
        dataIdx = dataIdxIn;
    }
    
    virtual ~CreatureTimeSample() {}
    
	int getAnimPointsOffset()
	{
		if (dataIdx < 0)
		{
			return -1; // invalid
		}
		
		return dataIdx + 1;
	}
	
	int getAnimUvsOffset()
	{
		if (dataIdx < 0)
		{
			return -1; // invalid
		}
		
		return dataIdx + 2;
	}
	
	int getAnimColorsOffset()
	{
		if (dataIdx < 0)
		{
			return -1; // invalid
		}
		
		return dataIdx + 3;
	}

    int beginTime;
    int endTime;
    int dataIdx;
};

class CreaturePackSampleData {
public:
    CreaturePackSampleData(int firstSampleIdxIn, int secondSampleIdxIn, float sampleFractionIn)
    {
        firstSampleIdx = firstSampleIdxIn;
        secondSampleIdx = secondSampleIdxIn;
        sampleFraction = sampleFractionIn;
    }

    int firstSampleIdx, secondSampleIdx;
    float sampleFraction;
};

static bool sortArrayNum(int a, int b)
{
    return a < b;
}

class CreaturePackAnimClip
{
public:
	CreaturePackAnimClip()
		: CreaturePackAnimClip(-1)
	{

	}

    CreaturePackAnimClip(int dataIdxIn)
    {
        dataIdx = dataIdxIn;
		startTime = 0;
		endTime = 0;
		firstSet = false;
    }

	CreaturePackSampleData sampleTime(float timeIn) const
	{
		int lookupTime = (int)(roundf(timeIn));
		if (timeSamplesMap.count(lookupTime) == 0)
		{
			float curTime = timeSamplesMap.begin()->second.beginTime;
			return CreaturePackSampleData((int)curTime, (int)curTime, 0.0f);
		}

		float lowTime = (float)timeSamplesMap.at(lookupTime).beginTime;
		float highTime = (float)timeSamplesMap.at(lookupTime).endTime;
		
		if ( (highTime - lowTime) <= 0.0001)
		{
            return CreaturePackSampleData((int)lowTime, (int)highTime, 0.0f);
		}
	
		float curFraction = (timeIn - lowTime) / ( highTime - lowTime );
		
        return CreaturePackSampleData((int)lowTime, (int)highTime, curFraction);
	}
	
	float correctTime(float timeIn, bool withLoop) const
	{
		if(withLoop == false) {
			if (timeIn < startTime)
			{
				return startTime;
			}
			else if (timeIn > endTime)
			{
				return endTime;
			}
		}
		else {
			if (timeIn < startTime)
			{
				return endTime;
			}
			else if (timeIn > endTime)
			{
				return startTime;
			}
		}
		
		return timeIn;
	}
	
	void addTimeSample(int timeIn, int dataIdxIn)
	{
		CreatureTimeSample newTimeSample(timeIn, timeIn, dataIdxIn);
		timeSamplesMap[timeIn] = newTimeSample;
		
		if (firstSet == false)
		{
			firstSet = true;
			startTime = timeIn;
			endTime = timeIn;
		}
		else {
			if (startTime > timeIn)
			{
				startTime = timeIn;
			}
			
			if (endTime < timeIn)
			{
				endTime = timeIn;
			}
		}
    }
	
	void finalTimeSamples()
	{
		int oldTime = startTime;
		std::vector<int> sorted_keys;
		
		for (auto curData : timeSamplesMap)
		{
			sorted_keys.push_back(curData.first);
		}
		
        std::sort(sorted_keys.begin(), sorted_keys.end(), sortArrayNum);
		
		for (auto curTime : sorted_keys)
		{
			if (curTime != oldTime)
			{
				for (int fillTime = oldTime + 1; fillTime < curTime; fillTime++)
				{
					CreatureTimeSample newTimeSample(oldTime, curTime, -1);
                    timeSamplesMap[fillTime] = newTimeSample;
				}
				
				oldTime = curTime;
			}
		}		
	}

    int startTime, endTime;
    std::unordered_map<int, CreatureTimeSample> timeSamplesMap;
    int dataIdx;
    bool firstSet;
};

// This is the class the loads in Creature Pack Data from disk
class CreaturePackLoader {
public:
	CreaturePackLoader()
	{
		// do nothing
		dMinX = dMinY = dMaxX = dMaxY = 0;
	}

    CreaturePackLoader(const std::vector<uint8_t>& byteArray)
		: CreaturePackLoader()
    {
		runDecoder(byteArray);
		meshRegionsList = findConnectedRegions();
    }

    virtual ~CreaturePackLoader() {}
    
	void updateIndices(int idx)
	{
		auto& cur_data = fileData[idx].int_array_val;
		for (size_t i = 0; i < cur_data.size(); i++)
		{
			indices.get()[i] = cur_data[i];
		}
	}

	void updatePoints(int idx)
	{
		auto& cur_data = fileData[idx].float_array_val;
		for (size_t i = 0; i < cur_data.size(); i++)
		{
			points.get()[i] =  cur_data[i];
		}
	}

    void updateUVs(int idx)
	{
		auto& cur_data = fileData[idx].float_array_val;
		for (size_t i = 0; i < cur_data.size(); i++)
		{
			uvs.get()[i] =  cur_data[i];
		}
	}

	size_t getAnimationNum() const
	{
		size_t sum = 0;
		for (size_t i = 0; i < headerList.size(); i++)
		{
			if (headerList.at(i) == "animation")
			{
				sum++;
			}
		}
		
		return sum;
	}
	
	std::pair<int, int> getAnimationOffsets(int idx) const
	{
        return std::pair<int, int>(animPairsOffsetList.at(idx * 2), animPairsOffsetList.at(idx * 2 + 1));
	}
		
	int getBaseOffset() const
	{
		return 0;
	}

	int getAnimPairsListOffset() const
	{
		return 1;
	}
	
	int getBaseIndicesOffset() const
	{
		return getAnimPairsListOffset() + 1;
	}
	
	int getBasePointsOffset() const
	{
		return getAnimPairsListOffset() + 2;
	}

	int getBaseUvsOffset() const
	{
		return getAnimPairsListOffset() + 3;
	}
	
	size_t getNumIndices() const
	{
		return fileData.at(getBaseIndicesOffset()).int_array_val.size();
	}
	
	size_t getNumPoints() const
	{
		return fileData.at(getBasePointsOffset()).float_array_val.size();
	}

	size_t getNumUvs() const
	{
		return fileData.at(getBaseUvsOffset()).float_array_val.size();
	}
  
    std::shared_ptr<uint32_t> indices;
    std::shared_ptr<float> uvs;
    std::shared_ptr<float> points;
    std::unordered_map<std::string, CreaturePackAnimClip> animClipMap;
    
    std::vector<mpMini::msg_mini_generic_data> fileData;
    std::vector<std::string> headerList;
    std::vector<int> animPairsOffsetList;
	std::vector<std::pair<uint32_t, uint32_t>> meshRegionsList;
    float dMinX, dMinY, dMaxX, dMaxY;

protected:
    void runDecoder(const std::vector<uint8_t>& byteArray)
    {
		mpMini::msg_mini newReader(byteArray);
        fileData = newReader.msg_mini_get_generic_objects();
        
        headerList = fileData[getBaseOffset()].str_array_val;
		animPairsOffsetList = fileData[getAnimPairsListOffset()].int_array_val;
		
		// init basic points and topology structure
		indices = std::shared_ptr<uint32_t>(new uint32_t[getNumIndices()], std::default_delete<uint32_t[]>());
		points = std::shared_ptr<float>(new float[getNumPoints()], std::default_delete<float[]>());
		uvs = std::shared_ptr<float>(new float[getNumUvs()], std::default_delete<float[]>());
		
		updateIndices(getBaseIndicesOffset());
		updatePoints(getBasePointsOffset());
		updateUVs(getBaseUvsOffset());

		fillDeformRanges();
		finalAllPointSamples();
		
		// init Animation Clip Map		
		for (size_t i = 0; i < getAnimationNum(); i++)
		{
			const auto& curOffsetPair = getAnimationOffsets(i);
			
			auto animName = fileData[curOffsetPair.first].string_val;
			auto k = curOffsetPair.first ;
			k++;
			CreaturePackAnimClip newClip(k);
				
			while(k < curOffsetPair.second)
			{
				int cur_time = fileData[k].float_val;
				newClip.addTimeSample(cur_time, (int)k);
					
				k += 4;
			}
				
			newClip.finalTimeSamples();
            animClipMap[animName] = newClip;
		}

    }

	std::string hasDeformCompress() const
	{
		for (int i = 0; i < (int)headerList.size(); i++)
		{
			if (headerList[i] == "deform_comp1")
			{
				return "deform_comp1";
			}
			else if (headerList[i] == "deform_comp2")
			{
				return "deform_comp2";
			}
			else if (headerList[i] == "deform_comp1_1")
			{
				return "deform_comp1_1";
			}
		}

		return "";
	}

	void fillDeformRanges()
	{
		if (hasDeformCompress().size() > 0)
		{
			auto cur_ranges_offset = getAnimationOffsets(getAnimationNum());
			auto cur_ranges = fileData[cur_ranges_offset.first];
			dMinX = (float)(cur_ranges.float_array_val[0]);
			dMinY = (float)(cur_ranges.float_array_val[1]);
			dMaxX = (float)(cur_ranges.float_array_val[2]);
			dMaxY = (float)(cur_ranges.float_array_val[3]);
		}
	}

	void finalAllPointSamples()
	{
		auto deformCompressType = hasDeformCompress();
		if (deformCompressType.size() == 0)
		{
			return;
		}

		for (int i = 0; i < (int)getAnimationNum(); i++)
		{
			auto curOffsetPair = getAnimationOffsets(i);

			auto animName = fileData[curOffsetPair.first].string_val;
			auto k = curOffsetPair.first;
			k++;

			while (k < curOffsetPair.second)
			{
				const auto& pts_raw_array = fileData[k + 1].int_array_val;
				const auto& pts_raw_byte_array = fileData[k + 1].byte_array_val;
				int raw_num = (int)pts_raw_array.size();

				if (deformCompressType == "deform_comp2")
				{
					raw_num = (int)pts_raw_byte_array.size();
				}
				else if (deformCompressType == "deform_comp1_1")
				{
					raw_num = (int)pts_raw_byte_array.size() / 2;
				}

				std::vector<float> final_pts_array(raw_num);
				for (int m = 0; m < raw_num; m++)
				{
					float bucketVal = 0;
					float numBuckets = 0.0f;
					if (deformCompressType == "deform_comp1")
					{
						bucketVal = (float)pts_raw_array[m];
						numBuckets = 65535.0f;
					}
					else if (deformCompressType == "deform_comp2")
					{
						bucketVal = (float)pts_raw_byte_array[m];
						numBuckets = 255.0f;
					}
					else if (deformCompressType == "deform_comp1_1")
					{
						uint16_t raw_int = 0;
						std::memcpy(&raw_int, &pts_raw_byte_array[m * 2], sizeof(uint16_t));
						bucketVal = (float)raw_int;
						numBuckets = 65535.0f;
					}

					float setVal = 0.0f;
					if (m % 2 == 0)
					{
						setVal = (bucketVal / numBuckets * (dMaxX - dMinX)) + dMinX;
						setVal += points.get()[m];
					}
					else
					{
						setVal = (bucketVal / numBuckets * (dMaxY - dMinY)) + dMinY;
						setVal += points.get()[m];
					}

					final_pts_array[m] = setVal;
				}

				fileData[k + 1].int_array_val.clear();
				fileData[k + 1].byte_array_val.clear();
				fileData[k + 1].float_array_val = final_pts_array;

				k += 4;
			}
		}
	}	

	class graphNode {
	public:
		graphNode()
			: graphNode(-1)
		{

		}

		graphNode(int idxIn)
		{
			idx = idxIn;
			visited = false;
		}

		int idx;
		std::vector<int> neighbours;
		bool visited;
	};

	std::unordered_map<uint32_t, graphNode> formUndirectedGraph() const
	{
		std::unordered_map<uint32_t, graphNode> retGraph;
		auto numTriangles = getNumIndices() / 3;
		for (size_t i = 0; i < (size_t)numTriangles; i++)
		{
			std::array<uint32_t, 3> triIndices;
			triIndices[0] = indices.get()[i * 3];
			triIndices[1] = indices.get()[i * 3 + 1];
			triIndices[2] = indices.get()[i * 3 + 2];

			for (auto triIndex : triIndices)
			{
				if (retGraph.count(triIndex) == 0)
				{
					retGraph[triIndex] = graphNode(triIndex);
				}

				auto& curGraphNode = retGraph[triIndex];
				for (size_t j = 0; j < (size_t)triIndices.size(); j++)
				{
					auto cmpIndex = triIndices[j];
					if (cmpIndex != triIndex)
					{
						curGraphNode.neighbours.push_back(cmpIndex);
					}
				}
			}
		}

		return retGraph;
	}

	std::vector<uint32_t>
	regionsDFS(std::unordered_map<uint32_t, graphNode>& graph, int idx) const
	{
		std::vector<uint32_t> retData;
		if (graph[idx].visited)
		{
			return retData;
		}

		std::stack<uint32_t> gstack;
		gstack.push(idx);

		while (gstack.empty() == false)
		{
			auto curIdx = gstack.top();
			gstack.pop();

			auto& curNode = graph[curIdx];
			if (curNode.visited == false)
			{
				curNode.visited = true;
				retData.push_back(curNode.idx);
				// search all connected for curNode
				for (auto neighbourIdx : curNode.neighbours)
				{
					gstack.push(neighbourIdx);
				}
			}
		}

		return retData;
	}

	std::vector<std::pair<uint32_t, uint32_t>>
	findConnectedRegions() const
	{
		std::vector<std::pair<uint32_t, uint32_t>> regionsList;
		std::unordered_map<uint32_t, graphNode> graph = formUndirectedGraph();

		// Run depth first search
		uint32_t regionIdx = 0;
		for (size_t i = 0; i < (size_t)getNumIndices(); i++)
		{
			auto curIdx = indices.get()[i];
			if (graph[curIdx].visited == false)
			{
				std::vector<uint32_t> indicesList = regionsDFS(graph, curIdx);
				std::sort(indicesList.begin(), indicesList.end());

				regionsList.push_back(std::pair<uint32_t, uint32_t>(indicesList[0], indicesList[indicesList.size() - 1]));

				regionIdx++;
			}
		}

		return regionsList;
	}
};

// Base Player class that target renderers use
class CreaturePackPlayer {
public:
    CreaturePackPlayer(CreaturePackLoader& dataIn)
        : data(dataIn)
    {
        createRuntimeMap();
		isPlaying = true;
		isLooping = true;
		animBlendFactor = 0;
		animBlendDelta = 0;
				
		// create data buffers
        renders_base_size = data.getNumPoints() / 2;
		render_points = std::shared_ptr<float>(new float[getRenderPointsLength()], std::default_delete<float[]>());
		render_2d_points = std::shared_ptr<float>(new float[getRender2DPointsLength()], std::default_delete<float[]>());
		render_uvs = std::shared_ptr<float>(new float[getRenderUVsLength()], std::default_delete<float[]>());
		render_colors = std::shared_ptr<uint8_t>(new uint8_t[getRenderColorsLength()], std::default_delete<uint8_t[]>());
		
		for (size_t i = 0; i < (size_t)getRenderColorsLength(); i++)
		{
			render_colors.get()[i] = 255;
		}
		
		for (size_t i = 0; i < (size_t)getRenderUVsLength(); i++)
		{
			render_uvs.get()[i] = data.uvs.get()[i];
		}       
    }
    
    size_t getRenderColorsLength() const {
        return (size_t)renders_base_size * 4; 
    }

    size_t getRenderPointsLength() const {
        return (size_t)renders_base_size * 3; 
    }

	size_t getRender2DPointsLength() const {
        return (size_t)renders_base_size * 2; 
    }

    size_t getRenderUVsLength() const {
        return (size_t)renders_base_size * 2; 
    }
    
	void createRuntimeMap()
	{
        runTimeMap.clear();
		bool firstSet = false;
        for(auto& curData : data.animClipMap)
		{
            auto animName = curData.first;
            
			if (firstSet == false)
			{
				firstSet = true;
				activeAnimationName = animName;
				prevAnimationName = animName;
			}
			
			auto animClip = data.animClipMap.at(animName);
            runTimeMap[animName] = animClip.startTime;
		}
		
	}
	
	// Sets an active animation without blending
	bool setActiveAnimation(const std::string& nameIn)
	{
		if (runTimeMap.count(nameIn) > 0)
		{
			activeAnimationName = nameIn;
			prevAnimationName = nameIn;
            runTimeMap[activeAnimationName] = data.animClipMap[activeAnimationName].startTime;
            
            return true;
		}
        
        return false;
	}
	
	// Smoothly blends to a target animation
	void blendToAnimation(const std::string& nameIn, float blendDelta)
	{
		if (runTimeMap.count(nameIn) > 0) {
			prevAnimationName = activeAnimationName;
			activeAnimationName = nameIn;
			animBlendFactor = 0;
			animBlendDelta = blendDelta;

			runTimeMap[activeAnimationName] = data.animClipMap[activeAnimationName].startTime;
		}
	}

	void setRunTime(float timeIn)
	{	
		runTimeMap[activeAnimationName] = data.animClipMap[activeAnimationName].correctTime(timeIn, isLooping);
	}
	
	float getRunTime() const
	{
		return runTimeMap.at(activeAnimationName);
	}
	
	// Steps the animation by a delta time
	void stepTime(float deltaTime)
	{
		setRunTime(getRunTime() + deltaTime);
		
		// update blending
		animBlendFactor += animBlendDelta;
		if (animBlendFactor > 1)
		{
			animBlendFactor = 1;
		}
	}
	
	float interpScalar(float val1, float val2, float fraction)
	{
		return ((1.0 - fraction) * val1) + (fraction * val2);
	}
	
	// Call this before a render to update the render data
	void syncRenderData() { 
	{
		// Points blending
		if (activeAnimationName == prevAnimationName)
		{
			auto& cur_clip = data.animClipMap[activeAnimationName];
			// no blending
			auto cur_clip_info = cur_clip.sampleTime(getRunTime());
			CreatureTimeSample& low_data = cur_clip.timeSamplesMap[cur_clip_info.firstSampleIdx];
			CreatureTimeSample& high_data = cur_clip.timeSamplesMap[cur_clip_info.secondSampleIdx];
			
			std::vector<float>& anim_low_points = data.fileData[low_data.getAnimPointsOffset()].float_array_val;
			std::vector<float>& anim_high_points = data.fileData[high_data.getAnimPointsOffset()].float_array_val;
			
			for (auto i = 0; i < renders_base_size; i++)
			{
                for(auto j = 0; j < 2; j++)
                {
                    auto low_val = anim_low_points[i * 2 + j];
                    auto high_val = anim_high_points[i * 2 + j];
                    render_points.get()[i * 3 + j] = interpScalar(low_val, high_val, cur_clip_info.sampleFraction);                    
                }
                
                render_points.get()[i * 3 + 2] = 0.0f;
			}
		}
		else {
			// blending
			
			// Active Clip
			auto& active_clip =  data.animClipMap[activeAnimationName];
			
			auto active_clip_info = active_clip.sampleTime(getRunTime());
			CreatureTimeSample& active_low_data = active_clip.timeSamplesMap[active_clip_info.firstSampleIdx];
			CreatureTimeSample& active_high_data = active_clip.timeSamplesMap[active_clip_info.secondSampleIdx];
			
			std::vector<float>& active_anim_low_points = data.fileData[active_low_data.getAnimPointsOffset()].float_array_val;
			std::vector<float>& active_anim_high_points = data.fileData[active_high_data.getAnimPointsOffset()].float_array_val;
			
			// Previous Clip
			auto& prev_clip =  data.animClipMap[prevAnimationName];
			
			auto prev_clip_info = prev_clip.sampleTime(getRunTime());
			CreatureTimeSample& prev_low_data = prev_clip.timeSamplesMap[prev_clip_info.firstSampleIdx];
			CreatureTimeSample& prev_high_data = prev_clip.timeSamplesMap[prev_clip_info.secondSampleIdx];
			
			std::vector<float>& prev_anim_low_points = data.fileData[prev_low_data.getAnimPointsOffset()].float_array_val;
			std::vector<float>& prev_anim_high_points = data.fileData[prev_high_data.getAnimPointsOffset()].float_array_val;

			for (auto i = 0; i < renders_base_size; i++)
			{
                for(auto j = 0; j < 2; j++)
                {
                    auto active_low_val = active_anim_low_points[i * 2 + j];
                    auto active_high_val = active_anim_high_points[i * 2 + j];
                    auto active_val =  interpScalar(active_low_val, active_high_val, active_clip_info.sampleFraction);

                    auto prev_low_val = prev_anim_low_points[i * 2 + j];
                    auto prev_high_val = prev_anim_high_points[i * 2 + j];
                    auto prev_val =  interpScalar(prev_low_val, prev_high_val, prev_clip_info.sampleFraction);

                    render_points.get()[i * 3 + j] = interpScalar(prev_val, active_val, animBlendFactor);
                }
                
                render_points.get()[i * 3 + 2] = 0.0f;
			}
		}

		// Copy to 2D points
		for (auto i = 0; i < renders_base_size; i++)
		{
			render_2d_points.get()[i * 2] = render_points.get()[i * 3];
			render_2d_points.get()[i * 2 + 1] = -render_points.get()[i * 3 + 1]; // Flip to account for 2D coordinate APIs
		}
		
		// Colors
		{
			auto& cur_clip =  data.animClipMap[activeAnimationName];
			// no blending
			auto cur_clip_info = cur_clip.sampleTime(getRunTime());
			CreatureTimeSample& low_data = cur_clip.timeSamplesMap[cur_clip_info.firstSampleIdx];
			CreatureTimeSample& high_data = cur_clip.timeSamplesMap[cur_clip_info.secondSampleIdx];
			
			std::vector<int32_t>& anim_low_colors = data.fileData[low_data.getAnimColorsOffset()].int_array_val;
			std::vector<int32_t>& anim_high_colors = data.fileData[high_data.getAnimColorsOffset()].int_array_val;
			
			if((anim_low_colors.size() == getRenderColorsLength())
				&& (anim_high_colors.size() == getRenderColorsLength())) {
				for (size_t i = 0; i < (size_t)getRenderColorsLength(); i++)
				{
				    float low_val = (float)anim_low_colors[i];
					float high_val = (float)anim_high_colors[i];
					render_colors.get()[i] = (uint8_t)interpScalar(low_val, high_val, cur_clip_info.sampleFraction);
				}
			}
		}
	
			// UVs
			{
				auto& cur_clip =  data.animClipMap[activeAnimationName];
				auto cur_clip_info = cur_clip.sampleTime(getRunTime());
				CreatureTimeSample& low_data = cur_clip.timeSamplesMap[cur_clip_info.firstSampleIdx];
				std::vector<float>& anim_uvs = data.fileData[low_data.getAnimUvsOffset()].float_array_val;
				if (anim_uvs.size() == getRenderUVsLength())
				{
					for (size_t i = 0; i < (size_t)getRenderUVsLength(); i++)
					{
						render_uvs.get()[i] = anim_uvs[i];
					}
				}
			}		
		}
	}

	void updateRegionOffsetsZ(float offset_z)
	{
		auto& mesh_regions_list = data.meshRegionsList;
		float set_region_z = 0.0f;
		for (auto cur_region : mesh_regions_list)
		{
			auto start_idx = cur_region.first;
			auto end_idx = cur_region.second;

			float * cur_pts = render_points.get();
			for (auto i = start_idx; i <= end_idx; i++)
			{
				cur_pts[i * 3 + 2] = set_region_z;
			}

			set_region_z += offset_z;
		}		
	}
    
    CreaturePackLoader& data;

    std::shared_ptr<float> render_uvs;
    std::shared_ptr<uint8_t> render_colors;
    std::shared_ptr<float> render_points, render_2d_points;
	int renders_base_size;
    std::unordered_map<std::string, float> runTimeMap;
    bool isPlaying, isLooping;
    
    std::string activeAnimationName, prevAnimationName;
    float animBlendFactor, animBlendDelta;
};

}