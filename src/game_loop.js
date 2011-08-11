var jaws = (function(jaws) {

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 16.666);
          };
})();

/**
 * @class A classic gameloop forever looping calls to update() / draw() with given framerate
 *
 * @example
 *
 * function draw() {
 *    ... your stuff executed every 30 FPS ...
 * }
 *
 * gameloop = new jaws.GameLoop(setup, update, draw, 30)
 * gameloop.start()
 *
 * // You can also use the shortcut jaws.start(), it will:
 * // 1) Load all assets with jaws.assets.loadAll()
 * // 2) Create a GameLoop() and start it
 * jaws.start(MyGameState, {fps: 30})
 *
 */
jaws.GameLoop = function(setup, update, draw, wanted_fps) {
  this.ticks = 0
  this.tick_duration = 0
  this.fps = 0
  
  var update_id
  var paused = false
  var that = this
  var mean_value = new MeanValue(20) // let's have a smooth, non-jittery FPS-value

  /** Start the gameloop by calling setup() once and then loop update()/draw() forever with given FPS */
  this.start = function() {
    jaws.log("gameloop start", true)
    this.current_tick = (new Date()).getTime();
    this.last_tick = (new Date()).getTime(); 
    if(setup) { setup() }
    step_delay = 1000 / wanted_fps;
    
    // update_id = setInterval(this.loop, step_delay);
    requestAnimFrame(this.loop)

    jaws.log("gameloop loop", true)
  }
  
  /** The core of the gameloop. Calculate a mean FPS and call update()/draw() if gameloop is not paused */
  this.loop = function() {
    that.current_tick = (new Date()).getTime();
    that.tick_duration = that.current_tick - that.last_tick
    that.fps = mean_value.add(1000/that.tick_duration).get()

    if(!paused) {
      if(update) { update() }
      if(draw)   { draw() }
      that.ticks++
      requestAnimFrame(that.loop)
    }
    that.last_tick = that.current_tick;
  }
  
  /** Pause the gameloop. loop() will still get called but not update() / draw() */
  this.pause = function()   { paused = true }
  
  /** unpause the gameloop */
  this.unpause = function() { paused = false }

  /** Stop the gameloop */
  this.stop = function() { if(update_id) clearInterval(update_id); }
}

/** @ignore */
function MeanValue(size) {
  this.size = size
  this.values = new Array(this.size)
  this.value
  
  this.add = function(value) {
    if(this.values.length > this.size) {  // is values filled?
      this.values.splice(0,1)
      this.value = 0
      for(var i=0; this.values[i]; i++) {
        this.value += this.values[i]
      }
      this.value = this.value / this.size
    }
    this.values.push(value)
    
    return this
  }

  this.get = function() {
    return parseInt(this.value)
  }

}

return jaws;
})(jaws || {});

