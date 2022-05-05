"use strict";

const bg_color = 220;
const grid_color = 240;

const grid_size = 20;

const show_mouse_coords = true;
const zoom_diff = 0.1;
const zoom_min = 0.1;
const zoom_max = 3;

let hovering_on_obj = false;

let frame_millis = 0;

let camera;
let zoom = 1;

class Game {
  constructor() {
    this.things = [];
    this.items = [this.things];
    
    this.drag_mode = true;
    
    frame_millis = millis();

    camera = createVector(0, 0);
    
    hovering_on_obj = false;
  }
  
  on_resize() {

  }

  on_mouse_press() {
    return false;
  }
  
  on_mouse_drag() {
    if (this.drag_mode && !hovering_on_obj) {
      camera.add(createVector(movedX, 
                              movedY));
    }
    return false;
  }

  on_mouse_release() {
    return false;
  }

  on_mouse_wheel(event) {
    let scale_factor;
    if (event.deltaY > 0) {
      scale_factor = (zoom - zoom_diff) / zoom;
      // scale_factor = 1 - zoom_diff;
    } else {
      scale_factor = (zoom + zoom_diff) / zoom;
      // scale_factor = 1 + zoom_diff;
    }

    // https://stackoverflow.com/a/70660569/10291933
    const previous = zoom;
    zoom *= scale_factor;
    zoom = Math.min(Math.max(zoom, zoom_min), zoom_max);
    zoom = Math.round(zoom * 10) / 10;

    if (zoom != previous) {
      camera.x = mouseX - (mouseX * scale_factor) + (camera.x * scale_factor);
      camera.y = mouseY - (mouseY * scale_factor) + (camera.y * scale_factor);
    }
    
    return false;
  }


  update() {
    frame_millis = millis();
    hovering_on_obj = false;
    for (const i in this.items) {
      const group = this.items[i];
      for (const index in group) {
        const item = group[index];
        if (item.destroy_me != undefined && item.destroy_me) {
          group[index] = undefined;
          continue;
        }
        item.update();
      }
      this.items[i] = group;
      this.items[i] = this.items[i].filter((element) => {
        return element != undefined;
      });
    }
  }
  
  draw_grid(cell_size, cam) {
    push();
    if (this.dark_mode) {
      stroke(dark_grid_color) 
    } else {
      stroke(grid_color);
    }
    const shift = p5.Vector.div(cam, zoom);
    const shift_x = shift.x % cell_size;
    const shift_y = shift.y % cell_size;
    const add_some = cell_size * 3 * zoom;
    for (let y = shift_y - shift.y; 
         y < ((height + add_some) / zoom) + (shift_y - shift.y); 
         y += cell_size) {
      line(-shift.x, y, 
           ((width + add_some) / zoom) + (shift_x - shift.x), y);
    }
    for (let x = shift_x - shift.x; 
         x < ((width + add_some) / zoom) + (shift_x - shift.x); 
         x += cell_size) {
      line(x, -shift.y, x, 
           ((height + add_some) / zoom) + (shift_y - shift.y));
    }
    pop();
  }

  draw() {
    if (this.dark_mode) {
      background(dark_bg_color)
    } else {
      background(bg_color);
    }

    translate(camera);
    scale(zoom);

    this.draw_grid(grid_size, camera);
    
    for (const group of this.items) {
      for (const item of group) {
        item.draw();
      }
    }

    if (show_mouse_coords) {
      push();
      fill(0);
      textSize(12 / zoom);
      let string = Math.round((mouseX - camera.x) / zoom) + ", " + Math.round((mouseY - camera.y) / zoom);
      if (zoom !== 1) {
        string += " at " + zoom + "x";
      }
      text(string, (mouseX - camera.x) / zoom, (mouseY - camera.y) / zoom);
      pop();
    }
  }
}
