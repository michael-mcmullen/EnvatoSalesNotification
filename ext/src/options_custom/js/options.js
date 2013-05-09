// Read Settings
var envato_username = localStorage["envato_username"];
var envato_key			= localStorage["envato_key"];

function main() {
	console.log('Loading Settings');
	
	if(envato_username !== 'undefined') {
		document.getElementById('envato_username').value = envato_username;
	}
	if(envato_key !== 'undefined') {
		document.getElementById('envato_key').value = envato_key;
	}
	
}
    		
function clickHandler(e) {
	SaveSettings();
	document.getElementById("showSaved").style.display = 'block';
}
    		
function SaveSettings(){
	console.log('Saving Settings');
	
	localStorage["envato_username"]				= document.getElementById('envato_username').value;
	localStorage["envato_key"]						= document.getElementById('envato_key').value;
	localStorage["envato_marketplace"]		= document.getElementById('envato_marketplace').value;
	localStorage["envato_notifications"]	= document.getElementById('envato_notification').value;
}

// Add event listeners once the DOM has fully loaded
document.addEventListener('DOMContentLoaded', function() {
	document.querySelector('button').addEventListener('click', clickHandler);
	main();
});