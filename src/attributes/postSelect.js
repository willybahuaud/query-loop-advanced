/* Add custom attribute to image block, in Sidebar */
const { __ } = wp.i18n;
import React from 'react';
// import SelecteurMultiple from '../orderableSelect'
import { useSelect } from '@wordpress/data'
import Sortable from 'gutenberg-sortable'
import {
	PanelBody,
	Button,
} from '@wordpress/components'
import { useSelect } from '@wordpress/data'
import SearchPost from './attributes/searchPost'

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

		// const posts = useSelect( select => {
		// 	return select( 'core' ).getEntityRecords( 'postType', query?.postType || 'post' )
		// }, [ query?.postType ] )

		// let options = []
		// if ( posts?.length ) {
		// 	options = posts.map(obj => {
		// 		return {
		// 			value: obj.id,
		// 			label: obj.title.rendered,
		// 		};
		// 	})
		// }
		// const values = (query?.queriedPosts) ? (query.queriedPosts.map(obj => {
		// 		return options.find(item => item.value === obj );
		// 	})
		// ) : []
		const values = query?.queriedPosts ?? []


		// const updateQuery = (values) => {
		// 	query.queriedPosts = values ? values.map(a => a.value) : []
		// 	setAttributes({ query: query })
		// }

		const updateQueriedPosts = ( newValue ) => {
			query.queriedPosts = newValue ? newValue.map(el => el.id) : []
			setAttributes({ query: query })
		}
	
		const removeQueriedPost = ( toDel ) => {
			const newAlsoLike = [ ...values].filter(el => el !== toDel)
			query.queriedPosts = newAlsoLike
			setAttributes({ query: query })
		}
	
		const addQueriedPost = ( newValue ) => {
			const newAlsoLike = [ ...values,newValue]
			query.queriedPosts = newAlsoLike
			setAttributes({ query: query })
		}

		const linked = useSelect(
			(select) => {
				const linked = values ? select('core').getEntityRecords('postType','post',{include:values}) : null
				if ( linked ) {
					return values.map((el) =>{
						const result = linked.filter(obj => {
							return obj.id === el
						})
						return(result[0])
					})
				}
			},
			[values]
		);

        return (
            <Fragment>
                <BlockEdit { ...props } />
                <InspectorControls>
                	<PanelBody
    	                title={ __( 'Sélectionnez un article' ) }
    	            >
						<SearchPost
						excludeId={values}
						postType="agenda"
						onAdd={addQueriedPost}
						/>
						{ linked?.length > 0 && (
							<Sortable
								className ="gallery"
								items     ={linked}
								onSortEnd ={updateQueriedPosts}
							>
							{linked.map(( child, index ) =>{

								return(
									<div
										className="detail-agenda__alsolike"
										key={'elem'+child.id}
									>
										<span className="detail-agenda__alsolike__item">
										{`${child.title.rendered} (${dateI18n( 'd/m/Y', child.date)})`}
										</span>
										<Button
											onClick={() => removeQueriedPost(child.id) }
											style={{float:'right'}}>
											╳
										</Button>
									</div>
									)
							})}
						</Sortable>)
						}
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