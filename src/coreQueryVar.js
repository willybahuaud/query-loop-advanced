const MY_VARIATION_NAME = 'wab/post__in';
const { Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor;
import { dateI18n } from '@wordpress/date'
import Sortable from 'gutenberg-sortable'
import {
	PanelBody,
    Button,
} from '@wordpress/components'
import { useSelect } from '@wordpress/data'
import SearchPost from './searchPost'

// import React from 'react';
// import SelecteurMultiple from './orderableSelect';
// import {PostInControl} from './postInControl';
// import { useSelect } from '@wordpress/data'
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

    const values = query?.queriedPosts ? query.queriedPosts : []
    const pt = useSelect(
        (select) => {
            if( ! query?.postType) {
                return '/wp/v2/posts'
            }
            return select('core').getEntityConfig('postType',query.postType).baseURL
        },
        ['query']
    )//query?.postType ? query?.postType : 'posts'
    const posts = useSelect(
        (select) => {

            const posts = values ? select('core').getEntityRecords('postType','post',{include:values}) : null
            if ( posts ) {
                return values.map((el) =>{
                    const result = posts.filter(obj => {
                        return obj.id === el
                    })
                    return(result[0])
                })
            }
        },
        [values]
    )

    const removeQueriedPost = ( toDel ) => {
        const nqp = [ ...values].filter(el => el !== toDel)
        const nq = Object.assign({}, query, {queriedPosts: nqp ?? [] })
        setAttributes({ query: nq })
    }

    const addQueriedPost = ( newValue ) => {
        const nqp = [ ...values,newValue]
        const nq = Object.assign({}, query, {queriedPosts: nqp ?? [] })
        setAttributes({ query: nq })
    }

    const updateQuery = (values) => {
        const nq = Object.assign({}, query, {queriedPosts: values.map(el => el.id) ?? [] })
        setAttributes({ query: nq })
    }


    return isMyBooksVariation( props ) ? (
        <Fragment>
            <BlockEdit { ...props } />
            <InspectorControls>
                <PanelBody
    	                title={ __( 'Sélectionnez un article' ) }
    	            >
                        <SearchPost
						excludeId={values}
						postTypeBase={pt}
						onAdd={addQueriedPost}
						/>
						{ posts?.length > 0 && (
							<Sortable
								className ="gallery"
								items     ={posts}
								onSortEnd ={updateQuery}
							>
							{posts.map(( child, index ) =>{

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
    ) : (
        <BlockEdit { ...props } />
    );
};

wp.hooks.addFilter( 'editor.BlockEdit', 'core/query', withBookQueryControls );