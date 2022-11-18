const MY_VARIATION_NAME = 'wab/post__in';
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;

import React from 'react';
import SelecteurMultiple from './orderableSelect';
// import {PostInControl} from './postInControl';
import { useSelect } from '@wordpress/data'
import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockVariation( 'core/query', {
    name: MY_VARIATION_NAME,
    title: 'Sélection d’articles',
    description: 'Sélection précisement des pages ou des articles',
    isActive: ( { namespace, query } ) => {
        return (
            namespace === MY_VARIATION_NAME
        );
    },
    icon:'list-view',
	allowedControls: [ 'order', 'orderBy', 'postType' ],
    attributes: {
        namespace: MY_VARIATION_NAME,
        query: {
            perPage: 0,
            pages: 0,
            offset: 0,
            postType: '',
            order: 'desc',
            orderBy: 'date',
            author: '',
            search: '',
            exclude: [],
            sticky: '',
            inherit: false,
			queriedPosts: [],
        },
    },
} )

const isMyBooksVariation = (props) => {
	return props.name === 'core/query' && props.attributes.namespace === MY_VARIATION_NAME;
	return true;
}

export const withBookQueryControls = ( BlockEdit ) => ( props ) => {
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
    const nq = Object.assign({}, query, {queriedPosts: values ? values.map(a => a.value) : [] })
    setAttributes({ query: nq })
}


    return isMyBooksVariation( props ) ? (
        <Fragment>
            <BlockEdit { ...props } />
            <InspectorControls>
                <PanelBody
    	                title={ __( 'Sélectionnez un article' ) }
    	            >
                        {/* <PostInControl
                            query={ query }
                            onChange={ updateQuery }
                        /> */}
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
    ) : (
        <BlockEdit { ...props } />
    );
};

wp.hooks.addFilter( 'editor.BlockEdit', 'core/query', withBookQueryControls );