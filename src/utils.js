/**
 * External dependencies
 */
 import { get } from 'lodash';

 /**
  * WordPress dependencies
  */

 import { decodeEntities } from '@wordpress/html-entities';

 export const getEntitiesInfo = ( entities ) => {
	 const mapping = entities?.reduce(
		 ( accumulator, entity ) => {
			 const { mapById, mapByName, names } = accumulator;
			 mapById[ entity.id ] = entity;
			 mapByName[ entity.name ] = entity;
			 names.push( entity.name );
			 return accumulator;
		 },
		 { mapById: {}, mapByName: {}, names: [] }
	 );
	 return {
		 entities,
		 ...mapping,
	 };
 };
 

 export const mapToIHasNameAndId = ( entities, path ) => {
	 return ( entities || [] ).map( ( entity ) => ( {
		 ...entity,
		 name: decodeEntities( get( entity, path ) ),
	 } ) );
 };
