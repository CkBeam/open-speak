<?php

function up_register_blocks2() {
  $blocks = [
    [ 'name' => 'open-speak', 'options' => [
        'render_callback' => 'up_open_speak_render_cb'
    ]],
  ];

  foreach($blocks as $block) {
    register_block_type(
        UP_PLUGIN_DIR_OPEN_SPEAK . 'build/blocks/' . $block['name'],
      isset($block['options']) ? $block['options'] : []
    );
  }
}