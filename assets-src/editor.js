import tinymce from 'tinymce';

// Import appropriate dependencies.
import 'tinymce/plugins/lists';
import 'tinymce/themes/silver';
// import 'tinymce/skins/content/default';

let status = {
	bold: false,
	italic: false,
	underline: false,
	strikethrough: false,
	paraType: 'p',
};
const sendStatus = () => {
	if ( window.ReactNativeWebView ) {
		window.ReactNativeWebView.postMessage( JSON.stringify( {
			type: 'updateStatus',
			payload: status,
		} ) );
	} else {
		console.log( status );
	}
};

tinymce.init( {
	target: document.getElementById( 'editor' ),

	// Remove all UI.
	menubar: false,
	statusbar: false,
	toolbar: false,
	theme: false,
	skin: false,

	// Reset content styles.
	content_css: false,

	// No need for inputs.
	hidden_input: false,

	// Add some basic plugins.
	plugins: [
		'lists',
	],
} ).then( editors => {
	const editor = editors[0];
	window.tinyEditor = editor;

	editor.on( 'NodeChange', ( api ) => {
		// Find the nearest list item.
		for ( let i = 0; i < api.parents.length; i++ ) {
			if ( api.parents[ i ].tagName !== 'LI' ) {
				continue;
			}

			// Found a list item, check the parent.
			const parentIndex = i + 1;
			if ( parentIndex >= api.parents.length ) {
				console.log( parentIndex );
				continue;
			}
			const parent = api.parents[ parentIndex ];
			switch ( parent.tagName ) {
				case 'UL':
				case 'OL':
					status = {
						...status,
						paraType: parent.tagName.toLowerCase(),
					};
					sendStatus();
					break;
			}
		}
	} );

	const formats = [
		'bold',
		'italic',
		'underline',
		'strikethrough',
	];
	formats.forEach( format => {
		editor.formatter.formatChanged( format, value => {
			status = {
				...status,
				[ format ]: value,
			};
			sendStatus();
		}, true );
	} );

	const paraType = [
		'p',
		'blockquote',
		'h1',
		'h2',
		'pre',
		'UL',
		'OL',
	];
	paraType.forEach( type => {
		editor.formatter.formatChanged( type, value => {
			if ( ! value ) {
				return;
			}

			status = {
				...status,
				paraType: type,
			};
			sendStatus();
		} );
	} );
} );