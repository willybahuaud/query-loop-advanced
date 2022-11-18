<?php
/**
 * Plugin Name:       Core Block Custom Attributes
 * Description:       Example to add custom attributes to core blocks (Toolbar and Sidebar)
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Marie Comet
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       core-block-custom-attributes
 *
 * @package           create-block
 */

if( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if ( ! defined( 'CUSTOM_ATTRIBUTES_PATH' ) ) {
    define( 'CUSTOM_ATTRIBUTES_PATH', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'CUSTOM_ATTRIBUTES_URL' ) ) {
    define( 'CUSTOM_ATTRIBUTES_URL', plugin_dir_url( __FILE__ ) );
}

add_action( 'enqueue_block_editor_assets', 'custom_attributes_editor_scripts' );
function custom_attributes_editor_scripts() {
    wp_register_script(
        'custom-attributes',
        CUSTOM_ATTRIBUTES_URL . 'build/index.js',
        [ 'wp-blocks', 'wp-dom', 'wp-dom-ready', 'wp-edit-post' ],
        filemtime( CUSTOM_ATTRIBUTES_PATH . 'build/index.js' )
    );
    wp_enqueue_script( 'custom-attributes' );
}

add_filter( 'query_loop_block_query_vars', 'custom_loop_query', 10, 2 );
function custom_loop_query( $query, $block ) {
    if ( ! empty( $block->context['query']['queriedPosts'] ) ) {
        $query['post__in'] = $block->context['query']['queriedPosts'];
    }
    return $query;
}

add_filter( 'rest_post_query', 'filter_query_loop_edit', 10, 2 );
add_filter( 'rest_page_query', 'filter_query_loop_edit', 10, 2 );
function filter_query_loop_edit( $args, $request ) {
    if ( ! empty( $request->get_param( 'queriedPosts' ) ) ) {
        $args['post__in'] = $request->get_param( 'queriedPosts' );
    }
    return $args;
}