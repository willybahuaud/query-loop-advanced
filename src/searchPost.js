import { __ } from '@wordpress/i18n'
import {debounce} from 'throttle-debounce'
import apiFetch from '@wordpress/api-fetch'
import { useState, useRef } from '@wordpress/element'
import { dateI18n } from '@wordpress/date'


import {
	TextControl,
} from '@wordpress/components'

export default function SearchPost(props) {

	const field = useRef(false)

	const [ results, setResults ] = useState( false );
	
	const onSearch = debounce( 300, search => {
	
		// On ne lance pas de recherche tant qu'il n'y a pas au moins 3 caractères
		if( search.length < 3 ) { return }

		setResults( __( "Chargement…" ) )
	
		// Route API qui permet de lancer une recherche
		apiFetch({ path: `${props.postTypeBase}/?search=${encodeURI( search )}&per_page=3&exclude=${props.excludeId}` })
		.then( ( posts ) => {
			if( posts.length == 0 ) {
				posts = __( "Aucun résultat", 'capitainewp-gut-bases' )
			}
			setResults( posts )
		} )
	} )


	return (
		<>
			<TextControl
			type="search"
			ref={field}
			placeholder={ __( 'Rechercher un article' ) }
			onChange={onSearch}
			/>
			<div className="detail-agenda__alsolike__results">
				{ results && Array.isArray(results) ?
					(
						<ul>
							{ results.map( result => {
								return (
									<li
										key={ result.id }
										onClick={ () => {
											props.onAdd( result.id )
											setResults(false)
											field.current.value = ''
										} }
										>
										{ `${result.title.rendered} (${dateI18n( 'd/m/Y', result.date)})` }
									</li>
								)
							} ) }
						</ul>
					) : (
						<p>{results}</p>
					)
				}
			</div>
		</>
	)
}