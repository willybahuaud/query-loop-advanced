/* Add custom attribute to image block, in Sidebar */
const { __ } = wp.i18n;
import React from 'react';
import SelecteurMultiple from '../orderableSelect';
import { useSelect } from '@wordpress/data'
// import Select from 'react-select';
// import Async, { useAsync } from 'react-select/async';
// import { debounce } from 'throttle-debounce'


// Enable custom attributes on Image block
const enablePostsSelectOnBLocks = [
    'core/query'
];

const { createHigherOrderComponent } = wp.compose;
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;

/**
 * Add Custom Select to Image Sidebar
 */
const withSidebarSelect = createHigherOrderComponent( ( BlockEdit ) => {
    return ( props ) => {

        // If current block is not allowed
    	if ( ! enablePostsSelectOnBLocks.includes( props.name ) ) {
            return (
                <BlockEdit { ...props } />
            );
        }

        const { attributes, setAttributes } = props;
        const { query } = attributes;

		const posts = useSelect( select => {
			return select( 'core' ).getEntityRecords( 'postType', query?.postType || 'post' )
		}, [ query?.postType ] )

		let options = []
		if ( posts?.length ) {
			options = posts.map(obj => {
				return {
					value: obj.id,
					label: obj.title.rendered,
				};
			})
		}
		const values = (query?.queriedPosts) ? (query.queriedPosts.map(obj => {
				return options.find(item => item.value === obj );
			})
		) : []


		const updateQuery = (values) => {
			query.queriedPosts = values ? values.map(a => a.value) : []
			setAttributes({ query: query })
		}

        return (
            <Fragment>
                <BlockEdit { ...props } />
                <InspectorControls>
                	<PanelBody
    	                title={ __( 'Sélectionnez un article' ) }
    	            >
						<div className='Select'>
							<SelecteurMultiple
								selected={values}
								onChange={updateQuery}
								options={options}
							/>
						</div>
	                </PanelBody>
                </InspectorControls>
            </Fragment>
        );
    };
}, 'withSidebarSelect' );

wp.hooks.addFilter(
    'editor.BlockEdit',
    'custom-attributes/with-sidebar-select',
    withSidebarSelect
);

/**
 * Save our custom attribute
 */
const saveSidebarSelectAttribute = ( extraProps, blockType, attributes ) => {
    // Do nothing if it's another block than our defined ones.
    if ( enablePostsSelectOnBLocks.includes( blockType.name ) ) {
        const { queriedPosts } = attributes;
        if ( queriedPosts ) {
            extraProps.queriedPosts = queriedPosts
        }
    }    

    return extraProps;
}
wp.hooks.addFilter(
    'blocks.getSaveContent.extraProps',
    'custom-attributes/save-toolbar-button-attribute',
    saveSidebarSelectAttribute
);


/**
 * Declare our custom attribute
 */
// const getPostsSelectAttributes = ( settings, name ) => {
//     // Do nothing if it's another block than our defined ones.
//     if ( ! enablePostsSelectOnBLocks.includes( name ) ) {
//         return settings;
//     }

//     return Object.assign( {}, settings, {
//         attributes: Object.assign( {}, settings.attributes, {
//             queriedPosts: { type: 'array' }
//         } ),
//     } );
// };
// wp.hooks.addFilter(
//     'blocks.registerBlockType',
//     'custom-attributes/set-sidebar-select-attribute',
//     getPostsSelectAttributes
// );