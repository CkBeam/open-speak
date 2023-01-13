<?php
/**
 * Plugin Name:       Open Speak
 * Plugin URI:        https://github.com/CkBeam/
 * Description:       Open Speak component (Digital-Path) for OpenHouse Insurance.
 * Version:           1.0.3
 * Requires at least: 5.9
 * Requires PHP:      7.2
 * Author:            OpenHouse Lake Mary Dreamteam
 * Text Domain:       open-speak
 * Domain Path:       /languages
 */

// security feature, so user cannot directly access files without wordpress admin. 
if(!function_exists('add_action')) {
    echo 'This is not the plug-in you are looking for. (=';
    exit;
}

// Setup
define('UP_PLUGIN_DIR_OPEN_SPEAK', plugin_dir_path(__FILE__));


// Includes
$rootFiles = glob(UP_PLUGIN_DIR_OPEN_SPEAK . 'includes/*.php');
$subdirectoryFiles = glob(UP_PLUGIN_DIR_OPEN_SPEAK . 'includes/**/*.php');
$allFiles = array_merge($rootFiles, $subdirectoryFiles);

foreach($allFiles as $filename) {
    include_once($filename);
}


// Hooks
add_action('init', 'up_register_blocks2');


