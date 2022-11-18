/**
 * WordPress dependencies
 */
 import { __ } from '@wordpress/i18n';
 import { FormTokenField } from '@wordpress/components';
 import { useSelect } from '@wordpress/data';
 import { store as coreStore } from '@wordpress/core-data';
 import { useState, useEffect, useMemo } from '@wordpress/element';
 import { useDebounce } from '@wordpress/compose';
 
 /**
  * Internal dependencies
  */
 import { getEntitiesInfo, mapToIHasNameAndId } from './utils';
 
 const EMPTY_ARRAY = [];
 const BASE_QUERY = {
	 order: 'asc',
	 _fields: 'id,title',
	 context: 'view',
 };
 
 export function PostInControl( { post__in, postType, onChange } ) {
	 const [ search, setSearch ] = useState( '' );
	 const [ value, setValue ] = useState( EMPTY_ARRAY );
	 const [ suggestions, setSuggestions ] = useState( EMPTY_ARRAY );
	 const debouncedSearch = useDebounce( setSearch, 250 );
	 const { searchResults, searchHasResolved } = useSelect(
		 ( select ) => {
			 if ( ! search ) {
				 return { searchResults: EMPTY_ARRAY, searchHasResolved: true };
			 }
			 const { getEntityRecords, hasFinishedResolution } =
				 select( coreStore );
			 const selectorArgs = [
				 'postType',
				 postType,
				 {
					 ...BASE_QUERY,
					 search,
					 orderby: 'relevance',
					 exclude: post__in,
					 per_page: 20,
				 },
			 ];
			 return {
				 searchResults: getEntityRecords( ...selectorArgs ),
				 searchHasResolved: hasFinishedResolution(
					 'getEntityRecords',
					 selectorArgs
				 ),
			 };
		 },
		 [ search, post__in ]
	 );
	 const currentpost__in = useSelect(
		 ( select ) => {
			 if ( ! post__in?.length ) return EMPTY_ARRAY;
			 const { getEntityRecords } = select( coreStore );
			 return getEntityRecords( 'postType', postType, {
				 ...BASE_QUERY,
				 include: post__in,
				 per_page: post__in.length,
			 } );
		 },
		 [ post__in ]
	 );
	 // Update the `value` state only after the selectors are resolved
	 // to avoid emptying the input when we're changing post__in.
	 useEffect( () => {
		 if ( ! post__in?.length ) {
			 setValue( EMPTY_ARRAY );
		 }
		 if ( ! currentpost__in?.length ) return;
		 const currentpost__inInfo = getEntitiesInfo(
			 mapToIHasNameAndId( currentpost__in, 'title.rendered' )
		 );
		 // Returns only the existing entity ids. This prevents the component
		 // from crashing in the editor, when non existing ids are provided.
		 const sanitizedValue = post__in.reduce( ( accumulator, id ) => {
			 const entity = currentpost__inInfo.mapById[ id ];
			 if ( entity ) {
				 accumulator.push( {
					 id,
					 value: entity.name,
				 } );
			 }
			 return accumulator;
		 }, [] );
		 setValue( sanitizedValue );
	 }, [ post__in, currentpost__in ] );
 
	 const entitiesInfo = useMemo( () => {
		 if ( ! searchResults?.length ) return EMPTY_ARRAY;
		 return getEntitiesInfo(
			 mapToIHasNameAndId( searchResults, 'title.rendered' )
		 );
	 }, [ searchResults ] );
	 // Update suggestions only when the query has resolved.
	 useEffect( () => {
		 if ( ! searchHasResolved ) return;
		 setSuggestions( entitiesInfo.names );
	 }, [ entitiesInfo.names, searchHasResolved ] );
 
	 const getIdByValue = ( entitiesMappedByName, entity ) => {
		 const id = entity?.id || entitiesMappedByName?.[ entity ]?.id;
		 if ( id ) return id;
	 };
	 const onParentChange = ( newValue ) => {
		 const ids = Array.from(
			 newValue.reduce( ( accumulator, entity ) => {
				 // Verify that new values point to existing entities.
				 const id = getIdByValue( entitiesInfo.mapByName, entity );
				 if ( id ) accumulator.add( id );
				 return accumulator;
			 }, new Set() )
		 );
		 setSuggestions( EMPTY_ARRAY );
		 onChange( { post__in: ids } );
	 };
	 return (
		 <FormTokenField
			 label={ __( 'Sélection' ) }
			 value={ value }
			 onInputChange={ debouncedSearch }
			 suggestions={ suggestions }
			 onChange={ onParentChange }
			 __experimentalShowHowTo={ false }
		 />
	 );
 }
 