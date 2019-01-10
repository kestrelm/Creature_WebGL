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

// CreatureTimeSample
class CreatureTimeSample{
	constructor(beginTimeIn, endTimeIn, dataIdxIn)
	{
		this.beginTime = beginTimeIn;
		this.endTime = endTimeIn;
		this.dataIdx = dataIdxIn;
	}

	getAnimPointsOffset()
	{
		if (this.dataIdx < 0)
		{
			return -1; // invalid
		}
			
		return this.dataIdx + 1;
	}


	getAnimUvsOffset() {
		if (this.dataIdx < 0) {
			return -1;
			// invalid
		}

		return this.dataIdx + 2;
	}

	getAnimColorsOffset() {
		if (this.dataIdx < 0) {
			return -1;
			// invalid
		}

		return this.dataIdx + 3;
	}
}

// CreaturePackAnimClip
class CreaturePackAnimClip{
	constructor(dataIdxIn)
	{
		this.dataIdx = dataIdxIn;
		this.startTime = 0;
		this.endTime = 0;
		this.firstSet = false;
		this.timeSamplesMap = {};
	}

	sampleTime(timeIn)
	{
		var lookupTime = Math.round(timeIn);

		var lowTime = this.timeSamplesMap[lookupTime].beginTime;
		var highTime = this.timeSamplesMap[lookupTime].endTime;

		if ((highTime - lowTime) <= 0.0001) {
			return [lowTime, highTime, 0];
		}

		var curFraction = (timeIn - lowTime) / (highTime - lowTime );

		return [lowTime, highTime, curFraction];
	}

	correctTime(timeIn, withLoop) 
	{
		if (this.withLoop == false) {
			if (timeIn < this.startTime) {
				return this.startTime;
			} else if (timeIn > this.endTime) {
				return this.endTime;
			}
		} else {
			if (timeIn < this.startTime) {
				return this.endTime;
			} else if (timeIn > this.endTime) {
				return this.startTime;
			}
		}

		return timeIn;
	};

	addTimeSample(timeIn, dataIdxIn)
	{
		var newTimeSample = new CreatureTimeSample(timeIn, timeIn, dataIdxIn);
		this.timeSamplesMap[timeIn] = newTimeSample;

		if (this.firstSet == false) {
			this.firstSet = true;
			this.startTime = timeIn;
			this.endTime = timeIn;
		} else {
			if (this.startTime > timeIn) {
				this.startTime = timeIn;
			}

			if (this.endTime < timeIn) {
				this.endTime = timeIn;
			}
		}
	}

	finalTimeSamples() 
	{
		function packCmpNumber(a,b) {
			return a - b;
		}

		var oldTime = this.startTime;
		var arrayOfNumbers = Object.keys(this.timeSamplesMap).map(Number);
		var sorted_keys = arrayOfNumbers.sort(packCmpNumber);

		for (var k = 0; k < sorted_keys.length; k++) {
			var cmpTime = sorted_keys[k];
			if (cmpTime != oldTime) {
				for(var fillTime = (oldTime + 1); fillTime < cmpTime; fillTime++) {
					var newTimeSample = new CreatureTimeSample(oldTime, cmpTime, -1);
					this.timeSamplesMap[fillTime] = newTimeSample;
				}

				oldTime = cmpTime;
			}
		}
	}
}

// graphNode
class graphNode
{
	constructor(idxIn=-1)
	{
		this.init(idxIn)
	}

	init(idxIn)
	{
		this.idx = idxIn;
		this.visited = false;
		this.neighbours = [];
	}
}

// This is the class the loads in Creature Pack Data from disk
//
// CreaturePackLoader
class CreaturePackLoader{
	constructor(bytesIn)
	{
		this.indices = [];
		this.uvs = [];
		this.points = [];
		this.animClipMap = {};
		this.headerList = [];
		this.animPairsOffsetList = [];

		this.dMinX = 0.0;
		this.dMinY = 0.0;
		this.dMaxX = 0.0;
		this.dMaxY = 0.0;
		
		this.fileData = msgpack.decode(bytesIn);
		this.headerList = this.fileData[this.getBaseOffset()];
		this.animPairsOffsetList = this.fileData[this.getAnimPairsListOffset()];

		// init basic points and topology structure
		this.indices = new Array(this.getNumIndices());
		this.points = new Array(this.getNumPoints());
		this.uvs = new Array(this.getNumUvs());

		this.updateIndices(this.getBaseIndicesOffset());
		this.updatePoints(this.getBasePointsOffset());
		this.updateUVs(this.getBaseUvsOffset());
		
		this.fillDeformRanges();
		this.finalAllPointSamples();

		// init Animation Clip Map
		for (var i = 0; i < this.getAnimationNum(); i++) {
			var curOffsetPair = this.getAnimationOffsets(i);

	//		var animName = this.fileData[curOffsetPair.a];
			var animName = this.fileData[curOffsetPair[0]];
			var k = curOffsetPair[0];
			k++;
			var newClip = new CreaturePackAnimClip(k);

	//		while (k < curOffsetPair.b) {
			while (k < curOffsetPair[1]) {
				var cur_time = this.fileData[k];
				newClip.addTimeSample(cur_time, k);

				k += 4;
			}

			newClip.finalTimeSamples();
			this.animClipMap[animName] = newClip;
		}

		this.meshRegionsList = this.findConnectedRegions();
	}

	formUndirectedGraph()
	{
		var retGraph = {};
		var numTriangles = this.getNumIndices() / 3;
		for (var i = 0; i < numTriangles; i++)
		{
			var triIndices = new Array(3);
			triIndices[0] = this.indices[i * 3];
			triIndices[1] = this.indices[i * 3 + 1];
			triIndices[2] = this.indices[i * 3 + 2];

			for(var m = 0; m < triIndices.length; m++)
			{
				var triIndex = triIndices[m];
				if ((triIndex in retGraph) == false)
				{
					retGraph[triIndex] = new graphNode(triIndex);
				}

				var curGraphNode = retGraph[triIndex];
				for (var j = 0; j < triIndices.length; j++)
				{
					var cmpIndex = triIndices[j];
					if (cmpIndex != triIndex)
					{
						curGraphNode.neighbours.push(cmpIndex);
					}
				}
			}
		}

		return retGraph;
	}

	regionsDFS(graph, idx)
	{
		var retData = [];
		if (graph[idx].visited)
		{
			return retData;
		}

		var gstack = [];
		gstack.push(idx);

		while (gstack.length > 0)
		{
			var curIdx = gstack.pop();

			var curNode = graph[curIdx];
			if (curNode.visited == false)
			{
				curNode.visited = true;
				retData.push(curNode.idx);
				// search all connected for curNode
				for(var m = 0; m < curNode.neighbours.length; m++)
				{
					var neighbourIdx = curNode.neighbours[m];
					gstack.push(neighbourIdx);
				}
			}
		}

		return retData;
	}

	findConnectedRegions()
	{
		var regionsList = [];
		var graph = this.formUndirectedGraph();

		// Run depth first search
		var regionIdx = 0;
		for (var i = 0; i < this.getNumIndices(); i++)
		{
			var curIdx = this.indices[i];
			if (graph[curIdx].visited == false)
			{
				var indicesList = this.regionsDFS(graph, curIdx);

				function sortNumber(a,b) {
					return a - b;
				}

				indicesList.sort(sortNumber);

				regionsList.push(
					[
						indicesList[0], 
						indicesList[indicesList.length - 1]
					]
				);

				regionIdx++;
			}
		}

		return regionsList;
	}	

	updateIndices(idx) {
		var cur_data = this.fileData[idx];
		for (var i = 0; i < cur_data.length; i++) {
			this.indices[i] = cur_data[i];
		}
	}

	updatePoints(idx) {
		var cur_data = this.fileData[idx];
		for (var i = 0; i < cur_data.length; i++) {
			this.points[i] = cur_data[i];
		}
	}

	updateUVs(idx) {
		var cur_data = this.fileData[idx];
		for (var i = 0; i < cur_data.length; i++) {
			this.uvs[i] = cur_data[i];
		}
	}

	getAnimationNum() {
		var sum = 0;
		for (var i = 0; i < this.headerList.length; i++) {
			if (this.headerList[i] == "animation") {
				sum++;
			}
		}

		return sum;
	}

	hasDeformCompress() {
		for (var i = 0; i < this.headerList.length; i++)
		{
			if (this.headerList[i] == "deform_comp1")
			{
				return "deform_comp1";
			}
			else if (this.headerList[i] == "deform_comp2")
			{
				return "deform_comp2";
			}
			else if (this.headerList[i] == "deform_comp1_1")
			{
				return "deform_comp1_1";
			}
		}

		return "";
	}

	fillDeformRanges()
	{
		if (this.hasDeformCompress() != "")
		{
			var cur_ranges_offset = this.getAnimationOffsets(this.getAnimationNum());
			var cur_ranges = this.fileData[cur_ranges_offset[0]];
			this.dMinX = cur_ranges[0];
			this.dMinY = cur_ranges[1];
			this.dMaxX = cur_ranges[2];
			this.dMaxY = cur_ranges[3];
		}
	};

	finalAllPointSamples()
	{
		var deformCompressType = this.hasDeformCompress();
		if (deformCompressType == "")
		{
			return;
		}

		for (var i = 0; i < this.getAnimationNum(); i++)
		{
			var curOffsetPair = this.getAnimationOffsets(i);

			var animName = this.fileData[curOffsetPair[0]];
			var k = curOffsetPair[0];
			k++;

			while (k < curOffsetPair[1])
			{
				var pts_raw_array = this.fileData[k + 1];
				var pts_raw_byte_array = this.fileData[k + 1];
				var raw_num = pts_raw_array.byteLength;
				var pts_dataview = new DataView(pts_raw_byte_array);

				if (deformCompressType == "deform_comp2")
				{
					raw_num = pts_raw_byte_array.byteLength;
				}
				else if (deformCompressType == "deform_comp1_1")
				{
					raw_num = pts_raw_byte_array.byteLength / 2;
				}

				var final_pts_array = new Array(raw_num);			
				for (var m = 0; m < raw_num; m++)
				{
					var bucketVal = 0;
					var numBuckets = 0;
					if (deformCompressType == "deform_comp1")
					{
						bucketVal = pts_raw_array[m];
						numBuckets = 65535;
					}
					else if (deformCompressType == "deform_comp2")
					{
						bucketVal = pts_dataview.getUint8(m);
						numBuckets = 255;
					}
					else if (deformCompressType == "deform_comp1_1")
					{
						bucketVal = pts_dataview.getUint16(m * 2, true);
						numBuckets = 65535;
					}

					var setVal = 0.0;
					if (m % 2 == 0)
					{
						setVal = (bucketVal / numBuckets * (this.dMaxX - this.dMinX)) + this.dMinX;
						setVal += this.points[m];
					}
					else
					{
						setVal = (bucketVal / numBuckets * (this.dMaxY - this.dMinY)) + this.dMinY;
						setVal += this.points[m];
					}

					final_pts_array[m] = setVal;
				}

				this.fileData[k + 1] = final_pts_array;

				k += 4;
			}
		}
	}

	getAnimationOffsets(idx)
	{
		/*
		return {
			a : animPairsOffsetList[idx * 2],
			b : animPairsOffsetList[idx * 2 + 1]
		};
		*/
		
		return [
			this.animPairsOffsetList[idx * 2],
			this.animPairsOffsetList[idx * 2 + 1]
		];
	}

	getBaseOffset() {
		return 0;
	}

	getAnimPairsListOffset() {
		return 1;
	}

	getBaseIndicesOffset() {
		return this.getAnimPairsListOffset() + 1;
	}

	getBasePointsOffset() {
		return this.getAnimPairsListOffset() + 2;
	}

	getBaseUvsOffset() {
		return this.getAnimPairsListOffset() + 3;
	}

	getNumIndices() {
		return this.fileData[this.getBaseIndicesOffset()].length;
	}

	getNumPoints() {
		return this.fileData[this.getBasePointsOffset()].length;
	}

	getNumUvs() {
		return this.fileData[this.getBaseUvsOffset()].length;
	}
}

// Base Renderer class that target renderers inherit from
//
// CreatureHaxeBaseRenderer
class CreatureHaxeBaseRenderer
{
	constructor(dataIn)
	{
		this.data = dataIn;
		this.createRuntimeMap();


		this.isPlaying = true;
		this.isLooping = true;
		this.animBlendFactor = 0;
		this.animBlendDelta = 0;

		// create data buffers
		this.render_points = new Array(this.data.points.length);
		this.render_uvs = new Array(this.data.uvs.length);
		this.render_colors = new Array(this.data.points.length / 2 * 4);

		for (var i = 0; i < this.render_colors.length; i++) {
			this.render_colors[i] = 1.0;
		}

		for (var i = 0; i < this.render_uvs.length; i++) {
			this.render_uvs[i] = this.data.uvs[i];
		}
	}


	createRuntimeMap() 
	{
		this.runTimeMap = {};
		var firstSet = false;
		for (var animName in this.data.animClipMap) {
			if (firstSet == false) {
				firstSet = true;
				this.activeAnimationName = animName;
				this.prevAnimationName = animName;
			}

			var animClip = this.data.animClipMap[animName];
			this.runTimeMap[animName] = animClip.startTime;
		}

	}

	// Sets an active animation without blending
	setActiveAnimation(nameIn) {
		if (this.runTimeMap.hasOwnProperty(nameIn)) {
			this.activeAnimationName = nameIn;
			this.prevAnimationName = nameIn;
			this.runTimeMap[this.activeAnimationName] = this.data.animClipMap[this.activeAnimationName].startTime;
		}
	}

	// Smoothly blends to a target animation
	blendToAnimation(nameIn, blendDelta) {
		this.prevAnimationName = this.activeAnimationName;
		this.activeAnimationName = nameIn;
		this.animBlendFactor = 0;
		this.animBlendDelta = blendDelta;
	}

	setRunTime(timeIn) {
		this.runTimeMap[this.activeAnimationName] = this.data.animClipMap[this.activeAnimationName].correctTime(timeIn, this.isLooping);
	}

	getRunTime() {
		return this.runTimeMap[this.activeAnimationName];
	}

	// Steps the animation by a delta time
	stepTime(deltaTime) {
		this.setRunTime(this.getRunTime() + deltaTime);

		// update blending
		this.animBlendFactor += this.animBlendDelta;
		if (this.animBlendFactor > 1) {
			this.animBlendFactor = 1;
		}
	}

	interpScalar(val1, val2, fraction) {
		return ((1.0 - fraction) * val1) + (fraction * val2);
	}

	// Call this before a render to update the render data
	syncRenderData() 
	{ 
		var firstSampleIdx = 0;
		var secondSampleIdx = 1;
		var sampleFraction = 2;
		
		{
			// Points blending
			if (this.activeAnimationName == this.prevAnimationName) {
				var cur_clip = this.data.animClipMap[this.activeAnimationName];
				// no blending
				var cur_clip_info = cur_clip.sampleTime(this.getRunTime());
				var low_data = cur_clip.timeSamplesMap[cur_clip_info[firstSampleIdx]];
				var high_data = cur_clip.timeSamplesMap[cur_clip_info[secondSampleIdx]];

				var anim_low_points = this.data.fileData[low_data.getAnimPointsOffset()];
				var anim_high_points = this.data.fileData[high_data.getAnimPointsOffset()];

				for (var i = 0; i < this.render_points.length; i++) {
					var low_val= anim_low_points[i];
					var high_val = anim_high_points[i];
					this.render_points[i] = this.interpScalar(low_val, high_val, cur_clip_info[sampleFraction]);
				}
			} else {
				// blending

				// Active Clip
				var active_clip = this.data.animClipMap[this.activeAnimationName];

				var active_clip_info = active_clip.sampleTime(this.getRunTime());
				var active_low_data = active_clip.timeSamplesMap[active_clip_info[firstSampleIdx]];
				var active_high_data = active_clip.timeSamplesMap[active_clip_info[secondSampleIdx]];

				var active_anim_low_points = this.data.fileData[active_low_data.getAnimPointsOffset()];
				var active_anim_high_points = this.data.fileData[active_high_data.getAnimPointsOffset()];

				// Previous Clip
				var prev_clip = this.data.animClipMap[this.prevAnimationName];

				var prev_clip_info = prev_clip.sampleTime(this.getRunTime());
				var prev_low_data = prev_clip.timeSamplesMap[prev_clip_info[firstSampleIdx]];
				var prev_high_data = prev_clip.timeSamplesMap[prev_clip_info[secondSampleIdx]];

				var prev_anim_low_points = this.data.fileData[prev_low_data.getAnimPointsOffset()];
				var prev_anim_high_points = this.data.fileData[prev_high_data.getAnimPointsOffset()];

				for (var i = 0; i < this.render_points.length; i++) {
					var active_low_val = active_anim_low_points[i];
					var active_high_val = active_anim_high_points[i];
					var active_val = this.interpScalar(active_low_val, active_high_val, active_clip_info[sampleFraction]);

					var prev_low_val = prev_anim_low_points[i];
					var prev_high_val = prev_anim_high_points[i];
					var prev_val = this.interpScalar(prev_low_val, prev_high_val, prev_clip_info[sampleFraction]);

					this.render_points[i] = this.interpScalar(prev_val, active_val, this.animBlendFactor);
				}
			}

			// Colors
			{
				var cur_clip = this.data.animClipMap[this.activeAnimationName];
				// no blending
				var cur_clip_info = cur_clip.sampleTime(this.getRunTime());
				var low_data = cur_clip.timeSamplesMap[cur_clip_info[firstSampleIdx]];
				var high_data = cur_clip.timeSamplesMap[cur_clip_info[secondSampleIdx]];

				var anim_low_colors = this.data.fileData[low_data.getAnimColorsOffset()];
				var anim_high_colors = this.data.fileData[high_data.getAnimColorsOffset()];

				if ((anim_low_colors.length == this.render_colors.length) 
					&& (anim_high_colors.length == this.render_colors.length)) 
				{
					for (var i = 0; i < this.render_colors.length; i++)
					{
						var low_val = anim_low_colors[i];
						var high_val = anim_high_colors[i];
						this.render_colors[i] = this.interpScalar(low_val, high_val, cur_clip_info[sampleFraction]) / 255.0;
					}
				}
			}

			// UVs
			{
				var cur_clip = this.data.animClipMap[this.activeAnimationName];
				var cur_clip_info = cur_clip.sampleTime(this.getRunTime());
				var low_data = cur_clip.timeSamplesMap[cur_clip_info[firstSampleIdx]];
				var anim_uvs = this.data.fileData[low_data.getAnimUvsOffset()];
				if (anim_uvs.length == this.render_uvs.length) {
					for (var i = 0; i < this.render_uvs.length; i++) {
						this.render_uvs[i] = anim_uvs[i];
					}
				}
			}
		}
	}
}
