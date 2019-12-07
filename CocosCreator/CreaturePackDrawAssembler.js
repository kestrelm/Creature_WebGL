let CreaturePackDraw = require('./CreaturePackDraw');

export default class CreatureAssembler extends cc.Assembler {    
    updateRenderData (comp) {
    }

    fillBuffers (comp, renderer) {
      if(comp._ia == null) {
        return;
      }
      // first flush batched commands
      renderer._flush();
  
      // update render states before flush
      renderer.material = comp._materials[0];
      renderer.node = comp.node;
      renderer.cullingMask = comp.node._cullingMask;
  
      // flush ia directly
      if(comp._ia.count >= 4) {
        renderer._flushIA(comp._ia);
      }
    }
  }
  
  // register assembler to render component
  cc.Assembler.register(CreaturePackDraw, CreatureAssembler);
  module.exports = CreatureAssembler;